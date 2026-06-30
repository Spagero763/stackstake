# Deployment

## Contract

The contract is deployed with Clarinet. Generate a deployment plan and apply
it to the target network:

```bash
clarinet deployments generate --testnet --low-cost
clarinet deployments apply --testnet
```

After deployment, fund the reward pool so stakers can claim:

```
(contract-call? .stacking-pool fund-reward-pool u100000000)
```

## Frontend

The frontend reads the deployer address and contract name from
`frontend/src/config.js`. Update `DEPLOYER_ADDRESS`, `CONTRACT_NAME` and
`NETWORK` to match the deployment, then build:

```bash
cd frontend
npm run build
```

The `frontend/vercel.json` rewrite rule serves the SPA so client side routes
such as `/leaderboard` and `/position/:address` resolve correctly on reload.

## Checklist

- [ ] Contract deployed and verified on the explorer.
- [ ] Reward pool funded.
- [ ] `config.js` points at the deployed contract.
- [ ] Frontend build succeeds and routes resolve on reload.
