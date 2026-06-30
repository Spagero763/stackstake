import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";
const STX = (n: number) => n * 1_000_000;

// ================================================================
// AVERAGE STAKE
// ================================================================

describe("get-average-stake", () => {
  it("is zero when the pool is empty", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-average-stake", [], user).result
    ).toBeOk(Cl.uint(0));
  });

  it("averages total stake across stakers", () => {
    const accounts = simnet.getAccounts();
    const a = accounts.get("wallet_1")!;
    const b = accounts.get("wallet_2")!;

    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(30)), Cl.uint(0)], a);
    simnet.callPublicFn(CONTRACT, "stake", [Cl.uint(STX(10)), Cl.uint(0)], b);

    // 40 STX across 2 stakers => 20 STX average.
    expect(
      simnet.callReadOnlyFn(CONTRACT, "get-average-stake", [], a).result
    ).toBeOk(Cl.uint(STX(20)));
  });
});
