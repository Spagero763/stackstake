import { Simnet } from "@hirosystems/clarinet-sdk";
import "@hirosystems/clarinet-sdk/vitest";

declare global {
  var simnet: Simnet;
}

declare module "vitest" {
  interface Assertion<R = any> {
    toBeOk(expected?: any): R;
    toBeErr(expected?: any): R;
    toBeSome(expected?: any): R;
    toBeNone(): R;
  }
  interface AsymmetricMatchersContaining {
    toBeOk(expected?: any): any;
    toBeErr(expected?: any): any;
    toBeSome(expected?: any): any;
    toBeNone(): any;
  }
}
