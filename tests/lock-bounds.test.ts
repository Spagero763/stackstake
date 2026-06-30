import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";
const STX = (n: number) => n * 1_000_000;

// ================================================================
// LOCK DURATION BOUNDS
// ================================================================

describe("lock duration bounds", () => {
  it("accepts the minimum lock of 144 blocks", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(10)), Cl.uint(144)],
      user
    );
    expect(result).toBeOk(expect.anything());
  });

  it("accepts the maximum lock of 52560 blocks", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(10)), Cl.uint(52560)],
      user
    );
    expect(result).toBeOk(expect.anything());
  });

  it("rejects a lock above the maximum", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(10)), Cl.uint(52561)],
      user
    );
    expect(result).toBeErr(Cl.uint(105)); // ERR-INVALID-LOCK
  });

  it("treats a lock of 0 as no lock", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callPublicFn(
      CONTRACT, "stake",
      [Cl.uint(STX(10)), Cl.uint(0)],
      user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({ "lock-until": Cl.uint(0) }),
      })
    );
  });
});
