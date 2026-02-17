# ◈ StackStake — STX Staking Protocol

> Stake STX, earn rewards, compete on the leaderboard. Built on Stacks (Bitcoin L2).

## Status
- [x] Day 1 — Core Clarity contract + tests
- [ ] Day 2 — Testnet deploy
- [ ] Day 3 — React app scaffold + wallet connect
- [ ] Day 4 — Stake / Unstake UI
- [ ] Day 5 — Live dashboard
- [ ] Day 6 — Leaderboard
- [ ] Day 7 — Shareable position links
- [ ] Day 8 — Mobile polish
- [ ] Day 9 — Mainnet deploy

## Contract Overview

**File:** `contracts/stacking-pool.clar`  
**Network:** Stacks Mainnet (Bitcoin L2)  
**Language:** Clarity 2

### Functions

| Function | Type | Description |
|---|---|---|
| `stake(amount, lock-duration)` | public | Stake STX with optional lock |
| `add-stake(amount)` | public | Add to existing stake |
| `claim-rewards()` | public | Claim accrued rewards |
| `unstake()` | public | Withdraw stake + auto-claim rewards |
| `fund-reward-pool(amount)` | public (owner) | Add STX to reward pool |
| `get-staker-status(user)` | read-only | Full staker info |
| `get-pool-stats()` | read-only | Global pool metrics |
| `get-pending-rewards(user)` | read-only | Live pending rewards |
| `estimate-apy(lock-duration)` | read-only | APY estimate |

### Lock Bonuses

| Duration | Bonus |
|---|---|
| No lock | +0 BPS |
| 1 week (1008 blocks) | +50 BPS |
| 1 month (4320 blocks) | +150 BPS |
| 3 months (12960 blocks) | +300 BPS |

## Tech Stack

- **Smart Contract:** Clarity 2, Stacks mainnet
- **Frontend:** React 18 + Vite (coming Day 3)
- **Wallet:** `@stacks/connect`
- **Chain reads:** `@stacks/transactions`

## Getting Started

```bash
# Install Clarinet
brew install clarinet  # or https://github.com/hirosystems/clarinet

# Lint contract
clarinet check

# Run tests (14 tests)
clarinet test

# Interactive REPL
clarinet console
```

## License

MIT
