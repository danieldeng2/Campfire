# Campfire

A WYSIWYG editor for [reveal.js](https://revealjs.com) presentations.

## Getting Started

**Prerequisites:** Node.js ≥ 20, pnpm ≥ 10

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/editor`.

## Scripts

All scripts run from the repo root and delegate to the relevant workspace package.

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |

## Repository Structure

```
Campfire/
├── packages/
│   └── client/          # Next.js frontend (@campfire/client)
├── package.json         # Workspace root
└── pnpm-workspace.yaml
```

## Editor

The editor at `/editor` provides:

- **Left sidebar** — scrollable slide thumbnails; click to switch slides
- **Canvas** — 1920×1080 coordinate space scaled to fit the viewport
- **Drag** — click and drag any text element to reposition it
- **Inline edit** — double-click a text element to edit its content; press Escape or click away to save
- **Present** — click the Present button in the top bar to launch full-screen reveal.js presentation mode (arrow keys to navigate)
