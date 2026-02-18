# ◈ StackStake — STX Staking Protocol

> Stake STX, earn rewards, compete on the leaderboard. Built on Stacks (Bitcoin L2).

## Status
- [x] Day 1 — Core Clarity contract 
- [x] Day 2 — Testnet deploy + tests
- [ ] Day 3 — React app scaffold + wallet connect
- [ ] Day 4 — Stake / Unstake UI
- [ ] Day 5 — Live dashboard
- [ ] Day 6 — Leaderboard
- [ ] Day 7 — Shareable position links
- [ ] Day 8 — Mobile polish
- [ ] Day 9 — Mainnet deploy

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


## License

MIT
