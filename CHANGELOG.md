# Changelog

All notable changes to this project are documented in this file. The format is
loosely based on Keep a Changelog, and the project aims to follow semantic
versioning once the contract is deployed to mainnet.

## Unreleased

### Fixed
- `get-staker-status` no longer double-wraps `ERR-NO-STAKE`.
- Clarity and config sources are normalized to LF so the Clarinet toolchain
  can parse them.

### Changed
- Test harness migrated to `@stacks/clarinet-sdk` with per-test session reset.

### Added
- Mutable contract owner with a two-step ownership transfer.
- Emergency pause that blocks new deposits while keeping withdrawals open.
- Read-only helpers: owner, pending owner, pause state, config, version,
  lock bonus, contract balance, user share, effective rate and active lock.
- Frontend Vitest setup with unit tests for the formatting, field, validation,
  numeric, share and time helpers.
- Reusable frontend hooks and components, plus FAQ, about and 404 pages.
- Test coverage for admin flows, APY estimation, lock bounds, read-only edge
  cases, ownership, pause and effective rate.
- Repository tooling: `.gitattributes`, `.editorconfig`, `.nvmrc`, Prettier
  config, CI workflows and issue templates.

## 1.0.0

### Added
- Core `stacking-pool.clar` contract with stake, add-stake, claim and unstake.
- Lock duration bonuses for one week, one month and three months.
- React frontend with wallet connect, dashboard, leaderboard and shareable
  position pages.
