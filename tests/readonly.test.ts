import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";
const STX = (n: number) => n * 1_000_000;

// ================================================================
// READ-ONLY EDGE CASES
// ================================================================

describe("get-staker-status", () => {
  it("errors with ERR-NO-STAKE for an address that never staked", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-staker-status",
      [Cl.principal(user)],
      user
    );
    expect(result).toBeErr(Cl.uint(103)); // ERR-NO-STAKE
  });

  it("reports blocks-remaining of 0 once a lock expires", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(1008)], user);
    simnet.mineEmptyBlocks(1100);

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-staker-status",
      [Cl.principal(user)],
      user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({
          "is-unlocked": Cl.bool(true),
          "blocks-remaining": Cl.uint(0),
        }),
      })
    );
  });
});

describe("get-pending-rewards", () => {
  it("is zero before any rewards accrue", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(0)], user);
    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-pending-rewards",
      [Cl.principal(user)],
      user
    );
    expect(result).toBeOk(Cl.uint(0));
  });
});

describe("get-staker-at-index", () => {
  it("is none when the pool is empty", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-staker-at-index",
      [Cl.uint(0)],
      user
    );
    expect(result).toBeNone();
  });
});
