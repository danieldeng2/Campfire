---
name: refactor
description: Refactor the codebase for cleanliness and maintainability
---

Look through the existing code and perform the following refactors:

1. **Helper functions** — group similar pure logic in the same file into named helper functions. Extract repeated utility logic (e.g. coordinate math, geometry, constants) into dedicated files under `src/lib/`.

2. **Custom hooks** — group stateful logic (useState, useEffect, useCallback, event handlers that depend on state) into dedicated React hooks under `src/hooks/`. Each hook should have a single, clear responsibility.

3. **Component splitting** — break down any component files over 200 lines into smaller focused components. Prefer extracting self-contained UI sub-sections or complex logic blocks. Avoid splitting purely for line count when it would add unnecessary indirection.

4. **Folder organisation** — move related components into named subfolders (e.g. `components/UILibrary/`, `components/editor/elements/`). Reusable UI primitives belong in `UILibrary/`.

5. **Dead code removal** — identify and remove unused code: unreachable branches (`if (false)`, conditions that can never be true), functions/variables/types that are defined but never imported or called, commented-out code blocks that are no longer relevant, and unused imports. Verify each deletion won't break anything before removing.

After all changes:
- Run `source ~/.zprofile && pnpm prettier --write <files>` on every modified file
- Run `pnpm tsc --noEmit` to confirm no type errors
