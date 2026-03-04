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

## Colors

- **All colors must use tokens** from `packages/client/src/lib/colors.ts`. Never hardcode hex or rgba values.
- Use the `c` object for named tokens: `c.brand`, `c.surface`, `c.canvas`, `c.ink`, `c.danger`, `c.dangerBg`, `c.brandGhost`, `c.flameOuter`, `c.flameInner`.
- Use the `ink(opacity)` helper for translucent black overlays, borders, and muted text (e.g. `ink(0.08)` for subtle borders, `ink(0.5)` for muted icons).
- Colors are defined in React inline styles, not CSS or Tailwind utility classes.
- `c.brand` (orange-500) is the single accent color — use it for active states, selections, and focus rings throughout the UI.

## Icons

- Use **lucide-react** for all icons. Never inline custom SVGs except for brand identity assets (`CampfireIcon`).
- Import icons by name: `import { Trash2, Plus, Play } from "lucide-react"`.
- `CampfireIcon` lives in `components/UILibrary/CampfireIcon.tsx` and is the only hand-crafted SVG component.

## Key Scripts

```bash
pnpm dev          # start Next.js dev server
pnpm build        # production build
pnpm format       # prettier --write across the repo
pnpm format:check # prettier --check (CI)
```
