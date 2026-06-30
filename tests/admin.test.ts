import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";
const STX = (n: number) => n * 1_000_000;

// ================================================================
// ADMIN: fund / drain reward pool
// ================================================================

describe("drain-reward-pool", () => {
  it("owner can drain funded rewards", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    simnet.callPublicFn(CONTRACT, "fund-reward-pool", [Cl.uint(STX(1000))], deployer);
    const { result } = simnet.callPublicFn(
      CONTRACT, "drain-reward-pool",
      [Cl.uint(STX(400))],
      deployer
    );
    expect(result).toBeOk(Cl.tuple({ drained: Cl.uint(STX(400)) }));
  });

  it("rejects draining more than the pool holds", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    simnet.callPublicFn(CONTRACT, "fund-reward-pool", [Cl.uint(STX(100))], deployer);
    const { result } = simnet.callPublicFn(
      CONTRACT, "drain-reward-pool",
      [Cl.uint(STX(500))],
      deployer
    );
    expect(result).toBeErr(Cl.uint(108)); // ERR-INSUFFICIENT-FUNDS
  });

  it("non-owner cannot drain", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "fund-reward-pool", [Cl.uint(STX(100))], deployer);
    const { result } = simnet.callPublicFn(
      CONTRACT, "drain-reward-pool",
      [Cl.uint(STX(10))],
      user
    );
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });
});

describe("fund-reward-pool validation", () => {
  it("rejects funding zero", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "fund-reward-pool",
      [Cl.uint(0)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(101)); // ERR-ZERO-AMOUNT
  });

  it("accumulates across multiple deposits", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    simnet.callPublicFn(CONTRACT, "fund-reward-pool", [Cl.uint(STX(100))], deployer);
    const { result } = simnet.callPublicFn(
      CONTRACT, "fund-reward-pool",
      [Cl.uint(STX(250))],
      deployer
    );
    expect(result).toBeOk(Cl.tuple({ "pool-balance": Cl.uint(STX(350)) }));
  });
});
