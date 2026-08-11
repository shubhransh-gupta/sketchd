<div align="center">

# Sketch'd

### Draw. Save. Share. No account.

[![Live Demo](https://img.shields.io/badge/demo-live-6366f1?style=for-the-badge&logo=githubpages&logoColor=white)](https://shubhransh-gupta.github.io/sketchd/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Stars](https://img.shields.io/github/stars/shubhransh-gupta/sketchd?style=for-the-badge&logo=github&color=6366f1)](https://github.com/shubhransh-gupta/sketchd/stargazers)
[![Open Source](https://img.shields.io/badge/open--source-❤️-f59e0b?style=for-the-badge)](https://github.com/shubhransh-gupta/sketchd)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-222?style=flat-square&logo=githubpages&logoColor=white)](https://shubhransh-gupta.github.io/sketchd/)

<br />

**The Excalidraw alternative that needs zero accounts.**  
Open-source infinite canvas · save to GitHub · share with a URL · no signup ever.

<br />

[**Try it live →**](https://shubhransh-gupta.github.io/sketchd/) · [**Star on GitHub ⭐**](https://github.com/shubhransh-gupta/sketchd)

<br />

<img src="./public/og-image.svg" alt="Sketch'd preview" width="640" />

<br />

`#drawing-app` · `#whiteboard` · `#infinite-canvas` · `#excalidraw-alternative` · `#no-login` · `#opensource` · `#react` · `#typescript` · `#github-pages` · `#developer-tools` · `#diagramming` · `#pwa`

</div>

---

## Perfect for

> Product Hunt · Hacker News · Reddit · GitHub Trending · Dev Twitter

- **Founders** — architecture diagrams in seconds
- **Developers** — system design, API flows, RFC sketches  
- **Students** — whiteboarding without signups
- **Teams** — share a link, zero workspace setup
- **Privacy folks** — local-first, no account required

**If Excalidraw + GitHub had a baby with zero friction — that's Sketch'd.**

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

<br />

Created with ❤️ by **[Shubhransh Gupta](https://github.com/shubhransh-gupta)**

<br />

[![Star this repo](https://img.shields.io/github/stars/shubhransh-gupta/sketchd?style=social&label=Star%20Sketch'd)](https://github.com/shubhransh-gupta/sketchd/stargazers)

<br />

Released under the [MIT License](LICENSE) · Copyright © 2026 Shubhransh Gupta

</div>
