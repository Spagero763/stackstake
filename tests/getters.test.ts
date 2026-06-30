import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";

// ================================================================
// CONFIG AND VERSION GETTERS
// ================================================================

describe("get-config", () => {
  it("reports the staking parameters", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(CONTRACT, "get-config", [], user);
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({
          "min-stake": Cl.uint(1_000_000),
          "reward-rate-bps": Cl.uint(50),
          "min-lock-blocks": Cl.uint(144),
          "max-lock-blocks": Cl.uint(52560),
        }),
      })
    );
  });
});

describe("get-version", () => {
  it("returns the contract version string", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(CONTRACT, "get-version", [], user);
    expect(result).toBeOk(Cl.stringAscii("1.1.0"));
  });
});

describe("get-lock-bonus", () => {
  it("maps durations to the matching bonus tier", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-lock-bonus", [Cl.uint(0)], user).result
    ).toBeOk(Cl.uint(0));
    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-lock-bonus", [Cl.uint(1008)], user).result
    ).toBeOk(Cl.uint(50));
    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-lock-bonus", [Cl.uint(4320)], user).result
    ).toBeOk(Cl.uint(150));
    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-lock-bonus", [Cl.uint(12960)], user).result
    ).toBeOk(Cl.uint(300));
  });
});

const STX = (n: number) => n * 1_000_000;

describe("is-staker", () => {
  it("is false before staking and true after", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    expect(
      simnet.callReadOnlyFn(CONTRACT, "is-staker", [Cl.principal(user)], user).result
    ).toBeOk(Cl.bool(false));

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(0)], user);

    expect(
      simnet.callReadOnlyFn(CONTRACT, "is-staker", [Cl.principal(user)], user).result
    ).toBeOk(Cl.bool(true));
  });
});

describe("get-user-share-bps", () => {
  it("is zero for a non-staker", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-user-share-bps", [Cl.principal(user)], user).result
    ).toBeOk(Cl.uint(0));
  });

  it("splits the pool in basis points across stakers", () => {
    const accounts = simnet.getAccounts();
    const a = accounts.get("wallet_1")!;
    const b = accounts.get("wallet_2")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(30)), Cl.uint(0)], a);
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(0)], b);

    // a holds 30 of 40 STX, which is 7500 bps.
    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-user-share-bps", [Cl.principal(a)], a).result
    ).toBeOk(Cl.uint(7500));
  });
});

describe("get-contract-balance", () => {
  it("grows as the reward pool is funded", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    simnet.callPublicFn(CONTRACT, "fund-reward-pool", [Cl.uint(STX(100))], deployer);
    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-contract-balance", [], deployer
    );
    expect(result).toBeOk(Cl.uint(STX(100)));
  });
});
