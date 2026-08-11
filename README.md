# Sketch'd

**Draw. Save. Share. No account.**

A fast, open-source infinite canvas where drawings can be saved directly to GitHub and shared with a URL.

No login. No signup. No workspace. No friction.

```
Open → Draw → Save → Share
```

![Sketch'd OG Image](./public/og-image.svg)

## Features

- **Canvas-first design** — Full viewport drawing with floating UI
- **Zero account friction** — Open and draw immediately
- **GitHub-native persistence** — Save drawings to GitHub (local-first fallback)
- **Shareable URLs** — `sketchd.dev/d/quiet-moon-42`
- **Developer tool feel** — Command palette (⌘K), keyboard shortcuts, context menus
- **Premium themes** — System / Light / Dark with layered surfaces
- **PWA-ready** — Installable with proper manifest and icons
- **Mobile support** — Bottom toolbar with touch-friendly controls

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Select |
| `H` | Hand (pan) |
| `R` | Rectangle |
| `D` | Diamond |
| `O` | Ellipse |
| `A` | Arrow |
| `L` | Line |
| `P` | Draw (freehand) |
| `T` | Text |
| `⌘K` / `Ctrl+K` | Command palette |
| `⌘S` / `Ctrl+S` | Save |
| `⌘Z` / `Ctrl+Z` | Undo |
| `⌘⇧Z` / `Ctrl+Shift+Z` | Redo |

## Architecture

```
src/
├── components/     # UI (TopBar, Toolbar, Canvas, etc.)
├── context/        # Drawing & theme state
├── hooks/          # Keyboard, etc.
├── lib/            # Canvas engine, storage, IDs
├── pages/          # Editor, Viewer, 404
├── styles/         # Design tokens & globals
└── types/          # TypeScript definitions
```

### Storage

- **Local-first**: Drawings saved to `localStorage` immediately
- **GitHub sync**: Optional API endpoint for remote persistence
- **Share URLs**: Human-readable IDs like `quiet-moon-42`

## GitHub Setup

Drawings are persisted to a dedicated GitHub repo via serverless API routes.

```bash
# 1. Create the storage repo
gh repo create sketchd-drawings --public

# 2. Configure environment
cp .env.example .env
# Set GITHUB_TOKEN and GITHUB_REPO=your-username/sketchd-drawings

# 3. Run locally (API middleware included in dev server)
npm run dev
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full setup and Vercel deployment.

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shubhransh-gupta/sketchd&env=GITHUB_TOKEN,GITHUB_REPO,SITE_URL&envDescription=GitHub%20API%20credentials&project-name=sketchd)

Required environment variables on Vercel:

| Variable | Value |
|----------|-------|
| `GITHUB_TOKEN` | Fine-grained PAT with Contents read/write on `sketchd-drawings` |
| `GITHUB_REPO` | `your-username/sketchd-drawings` |
| `SITE_URL` | Your Vercel deployment URL |

```bash
npm run deploy   # or: npx vercel --prod
```

## Scripts

```bash
npm run dev        # Development server (includes /api middleware)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint with oxlint
npm run typecheck  # TypeScript check
npm run test       # Run tests
npm run deploy     # Deploy to Vercel (production)
```

## Contributing

PRs welcome. Keep the canvas-first, zero-friction philosophy.

## Roadmap

- [ ] Real-time collaboration
- [ ] Export PNG/SVG
- [ ] Image upload
- [ ] Grid snap guides
- [ ] Plugin system

## License

MIT
