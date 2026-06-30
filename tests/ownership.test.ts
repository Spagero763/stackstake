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
