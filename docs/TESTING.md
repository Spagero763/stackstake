# Testing

The contract test suite runs with Vitest using the Clarinet SDK simnet.

## Running

```bash
npm test          # single run
npm run test:watch
```

## How it works

`vitest.config.mjs` registers the `clarinet` environment and points it at
`Clarinet.toml`. With `initBeforeEach` enabled, each test starts from a fresh
simnet session, so contract state never leaks between cases.

## Custom matchers

The Clarinet SDK adds matchers for Clarity response values:

- `toBeOk(value)` and `toBeErr(value)` for `(ok ...)` and `(err ...)`.
- `toBeSome(value)` and `toBeNone()` for optionals.

Tuple fields are read through the `.value` property of a clarity value, which
matters when asserting partial tuples with `expect.objectContaining`.

## Layout

| File | Area |
|---|---|
| `tests/stacking-pool.test.ts` | Core stake, claim and unstake flows |
| `tests/admin.test.ts` | Reward pool fund and drain |
| `tests/apy.test.ts` | APY estimation tiers |
| `tests/lock-bounds.test.ts` | Lock duration validation |
| `tests/readonly.test.ts` | Read-only edge cases |
