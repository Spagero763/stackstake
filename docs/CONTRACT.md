# Contract reference: stacking-pool

This document describes the public and read-only interface of
`contracts/stacking-pool.clar`.

## Constants

| Name | Value | Meaning |
|---|---|---|
| `MIN-STAKE` | `u1000000` | Minimum stake, 1 STX |
| `REWARD-RATE-BPS` | `u50` | Base reward rate in basis points |
| `MIN-LOCK-BLOCKS` | `u144` | Smallest non-zero lock |
| `MAX-LOCK-BLOCKS` | `u52560` | Largest lock |

## Public functions

### `stake(amount, lock-duration)`
Open a new position. `amount` must be at least `MIN-STAKE`. `lock-duration` is
either zero or between `MIN-LOCK-BLOCKS` and `MAX-LOCK-BLOCKS`. Fails with
`ERR-ALREADY-STAKING` if the caller already has a position.

### `add-stake(amount)`
Add STX to an existing position. Rewards are checkpointed first so the added
principal does not retroactively earn rewards.

### `claim-rewards()`
Transfer accrued rewards to the caller without touching their principal.

### `unstake()`
Withdraw principal and any claimable rewards. Reverts with `ERR-STILL-LOCKED`
while a lock is active.

### `fund-reward-pool(amount)` (owner)
Add STX to the reward pool that rewards are paid from.

### `drain-reward-pool(amount)` (owner)
Remove unspent STX from the reward pool.

### `set-paused(state)` (owner)
Flip the emergency pause. While paused, `stake` and `add-stake` revert with
`ERR-PAUSED`, but claims and unstakes remain open.

### `set-pending-owner(who)` (owner)
Nominate a successor for ownership.

### `accept-ownership()` (nominee)
Finalize a two-step ownership transfer.

## Read-only functions

| Function | Returns |
|---|---|
| `get-pool-stats()` | Global totals and the live accumulator |
| `get-staker-status(user)` | Full position detail for one staker |
| `get-pending-rewards(user)` | Live claimable rewards |
| `get-staker-at-index(i)` | Principal at a leaderboard index |
| `get-staker-count()` | Number of indexed stakers |
| `estimate-apy(lock-duration)` | Base, bonus and estimated APY in bps |
| `get-owner()` | Current contract owner |
| `get-pending-owner()` | Nominated successor, if any |
| `is-paused()` | Whether new deposits are paused |
| `is-staker(user)` | Whether an address has a position |
| `get-config()` | Staking parameters |
| `get-version()` | Contract version string |
| `get-lock-bonus(duration)` | Bonus bps for a lock duration |
| `get-contract-balance()` | STX held by the contract |
| `get-user-share-bps(user)` | A staker's share of the pool in bps |
| `get-effective-rate-bps(user)` | Base plus lock bonus for a staker |
| `has-active-lock(user)` | Whether a staker's lock is still active |

## Error codes

| Code | Constant |
|---|---|
| `u100` | `ERR-NOT-AUTHORIZED` |
| `u101` | `ERR-ZERO-AMOUNT` |
| `u102` | `ERR-STILL-LOCKED` |
| `u103` | `ERR-NO-STAKE` |
| `u104` | `ERR-ALREADY-STAKING` |
| `u105` | `ERR-INVALID-LOCK` |
| `u106` | `ERR-POOL-EMPTY` |
| `u107` | `ERR-NOTHING-TO-CLAIM` |
| `u108` | `ERR-INSUFFICIENT-FUNDS` |
| `u109` | `ERR-NO-PENDING-OWNER` |
| `u110` | `ERR-PAUSED` |
