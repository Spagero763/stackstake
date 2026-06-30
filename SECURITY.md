# Security Policy

## Reporting a vulnerability

If you discover a security issue in the StackStake contract or frontend,
please do not open a public issue. Instead, report it privately so it can be
triaged and fixed before disclosure.

Include as much detail as you can:

- A description of the issue and its impact.
- Steps to reproduce, ideally with a failing test or transaction.
- Any suggested remediation.

## Scope

The reward accounting in `stacking-pool.clar` is the most sensitive surface.
Areas worth extra scrutiny:

- The reward-per-token accumulator and checkpoint logic.
- Lock enforcement on `unstake`.
- Owner-only guards on `fund-reward-pool` and `drain-reward-pool`.

## Supported versions

Only the latest deployed contract and the `main` branch of the frontend are
supported. Older testnet deployments are not maintained.
