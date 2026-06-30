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
- Test coverage for admin flows, APY estimation, lock bounds and read-only
  edge cases.
- Repository tooling: `.gitattributes`, `.editorconfig`, `.nvmrc`.

## 1.0.0

### Added
- Core `stacking-pool.clar` contract with stake, add-stake, claim and unstake.
- Lock duration bonuses for one week, one month and three months.
- React frontend with wallet connect, dashboard, leaderboard and shareable
  position pages.
