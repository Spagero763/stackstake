import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";
const STX = (n: number) => n * 1_000_000;

// ================================================================
// EFFECTIVE RATE AND LOCK STATE
// ================================================================

describe("get-effective-rate-bps", () => {
  it("returns the base rate for a non-staker", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-effective-rate-bps", [Cl.principal(user)], user
    );
    expect(result).toBeOk(Cl.uint(50));
  });

  it("adds the lock bonus for a locked staker", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(4320)], user);
    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-effective-rate-bps", [Cl.principal(user)], user
    );
    expect(result).toBeOk(Cl.uint(200)); // 50 base + 150 bonus
  });
});

describe("has-active-lock", () => {
  it("is false without a stake", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    expect(
      simnet.callReadOnlyFn(CONTRACT, "has-active-lock", [Cl.principal(user)], user).result
    ).toBeOk(Cl.bool(false));
  });

  it("is true right after locking and false once it expires", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(1008)], user);
    expect(
      simnet.callReadOnlyFn(CONTRACT, "has-active-lock", [Cl.principal(user)], user).result
    ).toBeOk(Cl.bool(true));

    simnet.mineEmptyBlocks(1100);
    expect(
      simnet.callReadOnlyFn(CONTRACT, "has-active-lock", [Cl.principal(user)], user).result
    ).toBeOk(Cl.bool(false));
  });
});
