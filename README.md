# ◈ StackStake — STX Staking Protocol

> Stake STX, earn rewards, compete on the leaderboard. Built on Stacks (Bitcoin L2).

![Clarity](https://img.shields.io/badge/Clarity-2-5546FF)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Tests](https://img.shields.io/badge/tests-vitest-6E9F18)
![License](https://img.shields.io/badge/license-MIT-blue)

## Live Demo
https://stackstake.vercel.app

## Roadmap
- [x] Core Clarity staking contract
- [x] Testnet deployment and contract test suite
- [x] React app with wallet connect
- [x] Stake and unstake UI
- [x] Live pool dashboard
- [x] Leaderboard
- [x] Shareable position links
- [ ] Mobile polish
- [ ] Mainnet deployment

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


## Local development

Install dependencies and run the contract test suite:

```bash
npm install
npm test
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Contract reference](docs/CONTRACT.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)

## License

MIT
