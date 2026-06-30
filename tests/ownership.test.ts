import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";

// ================================================================
// OWNERSHIP
// ================================================================

describe("get-owner", () => {
  it("reports the deployer as the initial owner", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "get-owner", [], deployer
    );
    expect(result).toBeOk(Cl.principal(deployer));
  });
});

describe("ownership transfer", () => {
  it("completes a two-step handover to a new owner", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const next = accounts.get("wallet_1")!;

    simnet.callPublicFn(CONTRACT, "set-pending-owner", [Cl.principal(next)], deployer);
    const accept = simnet.callPublicFn(CONTRACT, "accept-ownership", [], next);
    expect(accept.result).toBeOk(Cl.principal(next));

    const { result } = simnet.callReadOnlyFn(CONTRACT, "get-owner", [], next);
    expect(result).toBeOk(Cl.principal(next));
  });

  it("only the owner can nominate a successor", () => {
    const accounts = simnet.getAccounts();
    const stranger = accounts.get("wallet_2")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "set-pending-owner", [Cl.principal(stranger)], stranger
    );
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });

  it("only the nominee can accept ownership", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const next = accounts.get("wallet_1")!;
    const stranger = accounts.get("wallet_2")!;

    simnet.callPublicFn(CONTRACT, "set-pending-owner", [Cl.principal(next)], deployer);
    const { result } = simnet.callPublicFn(CONTRACT, "accept-ownership", [], stranger);
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });

  it("accept fails when there is no pending owner", () => {
    const accounts = simnet.getAccounts();
    const stranger = accounts.get("wallet_2")!;

    const { result } = simnet.callPublicFn(CONTRACT, "accept-ownership", [], stranger);
    expect(result).toBeErr(Cl.uint(109)); // ERR-NO-PENDING-OWNER
  });
});
