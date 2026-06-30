# Architecture

StackStake is a single Clarity contract paired with a React single page app.

## Components

```
contracts/stacking-pool.clar   on-chain staking and reward accounting
frontend/                       React app (wallet, dashboard, leaderboard)
tests/                          Vitest suites run against a simnet session
```

## On-chain model

The contract uses the standard reward-per-token accumulator pattern:

1. The owner funds a reward pool with STX.
2. Rewards accrue per block as a function of the pool size and a fixed rate.
3. A global `reward-per-token-stored` accumulator tracks how much reward each
   staked micro-STX has earned over time.
4. Each staker records the accumulator value they were last paid at, so their
   pending rewards are `amount * (current-rpt - paid-rpt)`.

Whenever a staker interacts with the contract, `checkpoint` advances the
accumulator to the current block and books the staker's pending rewards before
their position changes.

## Lock bonuses

Stakers can optionally lock their stake for a fixed number of blocks in
exchange for a bonus expressed in basis points. Locks are enforced on
`unstake` but never block reward claims.

## Frontend data flow

The frontend never trusts a backend. It reads contract state directly through
the Hiro API using read-only function calls, decodes the Clarity hex responses
in `hooks/useStaking.js`, and writes through the wallet using
`@stacks/connect`. State is polled on an interval so the dashboard stays close
to live without websockets.
