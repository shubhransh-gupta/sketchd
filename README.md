<div align="center">

# Sketch'd

### Draw. Save. Share. No account.

[![Live Demo](https://img.shields.io/badge/demo-live-6366f1?style=for-the-badge&logo=githubpages&logoColor=white)](https://shubhransh-gupta.github.io/sketchd/)
[![License: MIT](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-24292f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shubhransh-gupta/sketchd/actions)

<br />

**A fast, open-source infinite canvas.**  
Draw anything. Save locally or to GitHub. Share with a link. Zero signups.

<br />

[**Open Sketch'd →**](https://shubhransh-gupta.github.io/sketchd/)

<br />

<img src="./public/og-image.svg" alt="Sketch'd preview" width="640" />

</div>

---

## Why Sketch'd?

| | |
|---|---|
| **Zero friction** | Open → draw. No login, no workspace, no onboarding |
| **Canvas-first** | Full-screen drawing surface with floating, minimal UI |
| **Developer-native** | ⌘K command palette, keyboard shortcuts, GitHub persistence |
| **Shareable** | Human-readable URLs like `/d/quiet-moon-42` |
| **Private by default** | Drawings live in your browser until you choose to save |

```
  Open          Draw          Save          Share
    │             │              │              │
    ▼             ▼              ▼              ▼
 Browser  →  Infinite canvas  →  Local / GitHub  →  Copy link
```

---

## Features

- **Tools** — Select, hand, shapes, arrows, freehand, text, image upload
- **Touchpad zoom** — Pinch to zoom, two-finger pan
- **Themes** — System / light / dark with layered surfaces
- **Command palette** — `⌘K` / `Ctrl+K`
- **Clear all** — One tap with confirmation dialog
- **PWA-ready** — Installable from the browser
- **Mobile** — Bottom toolbar + touch gestures

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `V` | Select |
| `H` | Hand (pan) |
| `R` `D` `O` | Rectangle / diamond / ellipse |
| `A` `L` `P` | Arrow / line / draw |
| `T` `I` | Text / image |
| `⌘K` | Command palette |
| `⌘S` | Save |
| `⌘Z` / `⌘⇧Z` | Undo / redo |

---

## Quick start

```bash
git clone https://github.com/shubhransh-gupta/sketchd.git
cd sketchd
npm install
npm run dev
```

Open **http://localhost:5173**

### Optional: GitHub cloud save

```bash
cp .env.example .env
# GITHUB_TOKEN=...  GITHUB_REPO=your-user/sketchd-drawings
npm run dev
```

---

## Deploy

**Live:** [shubhransh-gupta.github.io/sketchd](https://shubhransh-gupta.github.io/sketchd/)

Pushes to `main` auto-deploy via GitHub Actions. See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for details.

---

## Stack

```
React 19 · TypeScript · Vite · Canvas 2D · GitHub Pages
```

```
src/
├── components/   TopBar, Toolbar, Canvas, …
├── lib/          Canvas engine, storage, image cache
├── context/      Drawing + theme state
└── pages/        Editor, viewer, 404
```

---

## Contributing

PRs welcome → [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Roadmap

- [x] Touchpad zoom & pan
- [x] Text tool
- [x] Image upload
- [x] Clear all with confirm
- [ ] Export PNG / SVG
- [ ] Real-time collaboration

---

<div align="center">

**No login. No signup. Just draw.**

MIT © [shubhransh-gupta](https://github.com/shubhransh-gupta)

</div>
