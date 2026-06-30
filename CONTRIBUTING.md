# Contributing to StackStake

Thanks for taking the time to contribute. This guide covers how to get a local
environment running and the conventions used in this repository.

## Getting started

1. Install Node 20 (see `.nvmrc`).
2. Install root dependencies for the contract test suite:

   ```bash
   npm install
   ```

3. Install the frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

## Running the contract tests

The Clarity contract is exercised with Vitest through the Clarinet SDK:

```bash
npm test
```

Tests live in `tests/` and run against a fresh simnet session before each
case, so state never leaks between tests.

## Running the frontend

```bash
cd frontend
npm run dev
```

## Conventions

- Clarity source is formatted with two-space indentation.
- Keep public functions small and push shared logic into private helpers.
- Every new public or read-only function should ship with a test.
- Line endings are LF everywhere (enforced by `.gitattributes`).

## Commit messages

Write commit subjects in the imperative mood and keep them under ~72
characters. Add a body when the change needs context.

## Pull requests

Before opening a pull request, make sure `npm test` passes and the frontend
builds with `npm run build`.
