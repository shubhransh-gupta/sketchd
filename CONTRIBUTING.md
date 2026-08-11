# Contributing to Sketch'd

Thanks for helping improve Sketch'd. This guide covers how to work with the repo, branch protection, and the release flow.

## Quick links

- **Live app:** https://shubhransh-gupta.github.io/sketchd/
- **Repo:** https://github.com/shubhransh-gupta/sketchd
- **Drawing storage:** https://github.com/shubhransh-gupta/sketchd-drawings

---

## Branch protection on `main`

`main` is protected with rules tuned for **solo development**:

| Rule | Setting |
|------|---------|
| Force push | Blocked |
| Branch deletion | Blocked |
| Linear history | Required (rebase or squash merges) |
| Required CI checks | `build`, `deploy` (when merging PRs) |
| Pull request reviews | Not required (direct push allowed) |

### Recommended workflow

For small fixes, you can push directly to `main`:

```bash
git checkout main
git pull
# make changes
npm run typecheck && npm run test && npm run build
git add -A && git commit -m "fix: describe change"
git push origin main
```

For larger changes, use a feature branch and PR (CI runs automatically):

```bash
git checkout -b feature/my-change
# make changes, commit
git push -u origin feature/my-change
gh pr create --title "feat: my change" --body "What and why"
# merge after build + deploy checks pass
```

---

## Local development

```bash
npm install
cp .env.example .env   # optional — for GitHub cloud save
npm run dev            # http://localhost:5173
```

### Environment variables (optional)

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | Save drawings to `sketchd-drawings` via `/api` |
| `GITHUB_REPO` | e.g. `shubhransh-gupta/sketchd-drawings` |
| `SITE_URL` | Base URL for share links in dev |

On GitHub Pages, drawings save locally in the browser. Cloud save works when running locally with a token configured.

---

## Before you commit

Run these locally — they mirror CI:

```bash
npm run lint
npm run typecheck
npm run test
npm run build        # local / Vercel
npm run build:pages  # GitHub Pages (uses /sketchd/ base path)
```

---

## CI / deployment

Every push to `main` triggers **Deploy to GitHub Pages**:

1. `build` — install, typecheck, build, SPA 404 fallback
2. `deploy` — publish to https://shubhransh-gupta.github.io/sketchd/

PRs against `main` must pass both checks before merge.

---

## Project structure

```
src/
├── components/   # UI (TopBar, Toolbar, Canvas, …)
├── context/      # Drawing + theme state
├── hooks/        # Keyboard shortcuts, etc.
├── lib/          # Canvas engine, storage, IDs
├── pages/        # Editor, viewer, 404
└── styles/       # Design tokens

api/              # GitHub save/load (dev + Vercel only)
.github/workflows # Pages deploy + drawing save action
```

---

## Code guidelines

- **Canvas first** — don't add UI that competes with the drawing surface
- **Minimal diffs** — match existing patterns and naming
- **No accounts** — don't add login/signup flows
- **No secrets in client code** — GitHub tokens stay server-side
- **Accessibility** — labels, focus states, keyboard navigation

---

## Commit messages

Use clear, imperative messages:

```
feat: add export to PNG
fix: selection handles in dark mode
docs: update deployment guide
chore: bump dependencies
```

---

## Pull requests

Include:

1. **What** changed
2. **Why** it was needed
3. **Test plan** — steps you ran locally

Example test plan:

- [ ] Drew rectangle, arrow, text — smooth
- [ ] Saved locally / to GitHub
- [ ] Shared URL loads in incognito
- [ ] Light and dark mode OK
- [ ] Mobile layout OK at 375px

---

## Questions?

Open an [issue](https://github.com/shubhransh-gupta/sketchd/issues) with context and steps to reproduce.
