# Contributing to Concord

Concord is a reference implementation maintained by Dust AI Labs. Issues and
pull requests are welcome — especially new specialist categories, additional
test coverage, or integrations with real ticketing systems.

## Setup

```bash
npm install
npm run build --workspace=@concord/core
```

## Before opening a PR

```bash
npm run lint
npm run test --workspace=@concord/core
npm run build --workspace=@concord/core
npm run build --workspace=@concord/web
```

All four should pass cleanly — CI runs the same checks on every PR.

## Code style

- TypeScript, strict mode, no implicit `any`.
- Agents are plain functions that take a client and return a typed result —
  keep them dependency-injected so they stay testable without mocking `fetch`.
- Keep system prompts and their JSON response contracts next to each other in
  the same file, so a prompt change and its parsing stay in sync.
