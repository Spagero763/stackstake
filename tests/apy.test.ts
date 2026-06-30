import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const CONTRACT = "stacking-pool";

// ================================================================
// APY ESTIMATION
// ================================================================

describe("estimate-apy", () => {
  it("returns base only for no lock", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "estimate-apy", [Cl.uint(0)], user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({
          "base-bps": Cl.uint(50),
          "bonus-bps": Cl.uint(0),
          "total-bps": Cl.uint(50),
          "est-apy-bps": Cl.uint(50 * 526),
        }),
      })
    );
  });

  it("adds the 30-day bonus", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "estimate-apy", [Cl.uint(4320)], user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({
          "bonus-bps": Cl.uint(150),
          "total-bps": Cl.uint(200),
          "est-apy-bps": Cl.uint(200 * 526),
        }),
      })
    );
  });

  it("adds the 90-day bonus", () => {
    const accounts = simnet.getAccounts();
    const user = accounts.get("wallet_1")!;

    const { result } = simnet.callReadOnlyFn(
      CONTRACT, "estimate-apy", [Cl.uint(12960)], user
    );
    expect(result).toBeOk(
      expect.objectContaining({
        value: expect.objectContaining({
          "bonus-bps": Cl.uint(300),
          "total-bps": Cl.uint(350),
        }),
      })
    );
  });
});
