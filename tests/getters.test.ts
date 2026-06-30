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
