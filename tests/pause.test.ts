import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";
const STX = (n: number) => n * 1_000_000;

// ================================================================
// EMERGENCY PAUSE
// ================================================================

describe("set-paused", () => {
  it("defaults to not paused", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    expect(
      simnet.callReadOnlyFn(CONTRACT, "is-paused", [], user).result
    ).toBeOk(Cl.bool(false));
  });

  it("only the owner can toggle the pause", () => {
    const accounts = simnet.getAccounts();
    const stranger = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "set-paused", [Cl.bool(true)], stranger
    );
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });

  it("blocks new stakes while paused", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "set-paused", [Cl.bool(true)], deployer);
    const { result } = simnet.callPublicFn(
      CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(0)], user
    );
    expect(result).toBeErr(Cl.uint(110)); // ERR-PAUSED
  });

  it("allows staking again after unpausing", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "set-paused", [Cl.bool(true)], deployer);
    simnet.callPublicFn(CONTRACT, "set-paused", [Cl.bool(false)], deployer);
    const { result } = simnet.callPublicFn(
      CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(0)], user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({ staked: Cl.uint(STX(10)) }),
      })
    );
  });

  it("still lets a staker unstake while paused", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(0)], user);
    simnet.callPublicFn(CONTRACT, "set-paused", [Cl.bool(true)], deployer);
    const { result } = simnet.callPublicFn(CONTRACT, "unstake", [], user);
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({ unstaked: Cl.uint(STX(10)) }),
      })
    );
  });
});
