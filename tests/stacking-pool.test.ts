import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";
const STX = (n: number) => n * 1_000_000;

// ================================================================
// STAKE
// ================================================================

describe("stake", () => {
  it("succeeds with valid amount and no lock", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(100)), Cl.uint(0)],
      user
    );
    expect(result).toBeOk(
      Cl.tuple({
        staked: Cl.uint(STX(100)),
        "lock-until": Cl.uint(0),
        "lock-bonus-bps": Cl.uint(0),
      })
    );
  });

  it("applies +50 BPS bonus for 1-week lock", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(100)), Cl.uint(1008)],
      user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        data: expect.objectContaining({
          "lock-bonus-bps": Cl.uint(50),
        }),
      })
    );
  });

  it("applies +300 BPS bonus for 90-day lock", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(100)), Cl.uint(12960)],
      user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        data: expect.objectContaining({
          "lock-bonus-bps": Cl.uint(300),
        }),
      })
    );
  });

  it("rejects duplicate stake from same address", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(0)], user);
    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(50)), Cl.uint(0)],
      user
    );
    expect(result).toBeErr(Cl.uint(104)); // ERR-ALREADY-STAKING
  });

  it("rejects amount below 1 STX minimum", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(999), Cl.uint(0)],
      user
    );
    expect(result).toBeErr(Cl.uint(101)); // ERR-ZERO-AMOUNT
  });

  it("rejects lock duration below minimum", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(10)), Cl.uint(10)],
      user
    );
    expect(result).toBeErr(Cl.uint(105)); // ERR-INVALID-LOCK
  });
});

// ================================================================
// ADD-STAKE
// ================================================================

describe("add-stake", () => {
  it("increases position and total-staked", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(0)], user);
    const { result } = simnet.callPublicFn(
      CONTRACT, "add-stake",
      [Cl.uint(STX(50))],
      user
    );
    expect(result).toBeOk(
      Cl.tuple({ "new-total": Cl.uint(STX(150)) })
    );
  });

  it("fails if no existing stake", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "add-stake",
      [Cl.uint(STX(50))],
      user
    );
    expect(result).toBeErr(Cl.uint(103)); // ERR-NO-STAKE
  });
});

// ================================================================
// UNSTAKE
// ================================================================

describe("unstake", () => {
  it("succeeds with no lock and returns principal", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(0)], user);
    const { result } = simnet.callPublicFn(CONTRACT, "unstake", [], user);
    expect(result).toBeOk(
      Cl.tuple({
        unstaked: Cl.uint(STX(100)),
        "rewards-claimed": Cl.uint(0),
      })
    );
  });

  it("is blocked during active lock period", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(1008)], user);
    const { result } = simnet.callPublicFn(CONTRACT, "unstake", [], user);
    expect(result).toBeErr(Cl.uint(102)); // ERR-STILL-LOCKED
  });

  it("succeeds after lock period expires", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(1008)], user);
    simnet.mineEmptyBlocks(1100);
    const { result } = simnet.callPublicFn(CONTRACT, "unstake", [], user);
    expect(result).toBeOk(
      expect.objectContaining({
        data: expect.objectContaining({
          unstaked: Cl.uint(STX(100)),
        }),
      })
    );
  });

  it("fails if no stake exists", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(CONTRACT, "unstake", [], user);
    expect(result).toBeErr(Cl.uint(103)); // ERR-NO-STAKE
  });
});

// ================================================================
// REWARDS
// ================================================================

describe("fund-reward-pool", () => {
  it("owner can fund the pool", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "fund-reward-pool",
      [Cl.uint(STX(1000))],
      deployer
    );
    expect(result).toBeOk(
      Cl.tuple({ "pool-balance": Cl.uint(STX(1000)) })
    );
  });

  it("non-owner cannot fund", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "fund-reward-pool",
      [Cl.uint(STX(100))],
      user
    );
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });
});

describe("claim-rewards", () => {
  it("accrues rewards over blocks and claim succeeds", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "fund-reward-pool", [Cl.uint(STX(10000))], deployer);
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(0)], user);
    simnet.mineEmptyBlocks(200);

    // Check pending rewards > 0
    const pending = simnet.callReadOnlyFn(
      CONTRACT, "get-pending-rewards",
      [Cl.principal(user)],
      user
    );
    // Should be ok and not zero
    expect(pending.result).toBeOk(expect.anything());
    expect(pending.result).not.toEqual(Cl.ok(Cl.uint(0)));

    // Claim should succeed
    const { result } = simnet.callPublicFn(CONTRACT, "claim-rewards", [], user);
    expect(result).toBeOk(
      expect.objectContaining({
        data: expect.objectContaining({
          claimed: expect.anything(),
        }),
      })
    );
  });

  it("fails with ERR-NOTHING-TO-CLAIM when no rewards accrued", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    // Stake with no reward pool funded, no blocks mined
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(0)], user);
    const { result } = simnet.callPublicFn(CONTRACT, "claim-rewards", [], user);
    expect(result).toBeErr(Cl.uint(107)); // ERR-NOTHING-TO-CLAIM
  });
});

// ================================================================
// POOL STATS + LEADERBOARD
// ================================================================

describe("pool stats and leaderboard", () => {
  it("reflects correct totals across multiple stakers", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const u1 = accounts.get("wallet_1")!;
    const u2 = accounts.get("wallet_2")!;
    const u3 = accounts.get("wallet_3")!;

    simnet.callPublicFn(CONTRACT, "fund-reward-pool", [Cl.uint(STX(5000))], deployer);
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(300)), Cl.uint(0)], u1);
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(200)), Cl.uint(1008)], u2);
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(4320)], u3);

    const { result } = simnet.callReadOnlyFn(CONTRACT, "get-pool-stats", [], deployer);
    expect(result).toBeOk(
      expect.objectContaining({
        data: expect.objectContaining({
          "total-staked": Cl.uint(STX(600)),
          "staker-count": Cl.uint(3),
          "reward-pool": Cl.uint(STX(5000)),
        }),
      })
    );
  });

  it("leaderboard index tracks all stakers in order", () => {
    const accounts = simnet.getAccounts();
    const u1 = accounts.get("wallet_1")!;
    const u2 = accounts.get("wallet_2")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(100)), Cl.uint(0)], u1);
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(200)), Cl.uint(0)], u2);

    const count = simnet.callReadOnlyFn(CONTRACT, "get-staker-count", [], u1);
    expect(count.result).toBeOk(Cl.uint(2));

    const first = simnet.callReadOnlyFn(
      CONTRACT, "get-staker-at-index",
      [Cl.uint(0)],
      u1
    );
    expect(first.result).toBeSome(Cl.principal(u1));
  });

  it("estimate-apy returns correct BPS for no-lock and max-lock", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const noLock = simnet.callReadOnlyFn(
      CONTRACT, "estimate-apy", [Cl.uint(0)], user
    );
    expect(noLock.result).toBeOk(
      expect.objectContaining({
        data: expect.objectContaining({
          "total-bps": Cl.uint(50),
        }),
      })
    );

    const maxLock = simnet.callReadOnlyFn(
      CONTRACT, "estimate-apy", [Cl.uint(12960)], user
    );
    expect(maxLock.result).toBeOk(
      expect.objectContaining({
        data: expect.objectContaining({
          "total-bps": Cl.uint(350),
        }),
      })
    );
  });
});
