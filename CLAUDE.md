# Campfire – Claude Instructions

## Code Style

- **TypeScript**: Use modern TypeScript/ESNext — `const`/`let`, arrow functions, optional chaining, nullish coalescing, destructuring, `async/await`. Avoid `var`, `.then()` chains, and legacy patterns.
- **Imports**: Use named exports. Prefer `import type` for type-only imports.
- **Formatting**: Run `pnpm prettier --write <file>` on every file after editing it.

## Workflow

- **After editing any file**: run `source ~/.zprofile && pnpm prettier --write <file>` before moving on.
- **Before committing**: update `README.md` to reflect any relevant changes (new commands, changed structure, new features).

## Repository

- **Package manager**: pnpm monorepo. Run all commands from the repo root.
- **Frontend**: `packages/client` (`@campfire/client`). `pnpm dev` / `pnpm build` delegate to it via `--filter`.
- **Shell**: prepend `source ~/.zprofile &&` to any `node`/`pnpm` commands — the shell PATH doesn't include `/opt/homebrew/bin` by default.

## Key Scripts

```bash
pnpm dev          # start Next.js dev server
pnpm build        # production build
pnpm format       # prettier --write across the repo
pnpm format:check # prettier --check (CI)
```
