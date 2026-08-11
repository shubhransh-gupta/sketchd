# GitHub API + Vercel Deployment

## Architecture

```
Browser  →  POST /api/save          →  Vercel Function  →  GitHub Contents API
Browser  →  GET  /api/drawings/:id  →  Vercel Function  →  GitHub Contents API
```

Drawings are stored as JSON files in a dedicated public repo:

```
your-username/sketchd-drawings/
  drawings/
    quiet-moon-42.json
    swift-star-7.json
```

No user authentication. A server-side GitHub token handles all writes.

---

## 1. Create the drawings repo

```bash
gh repo create sketchd-drawings --public --description "Sketch'd drawing storage"
```

Or create it manually on GitHub — must be **public** so shared links work without auth.

---

## 2. Create a GitHub token

1. Go to **GitHub → Settings → Developer settings → Personal access tokens**
2. Create a fine-grained token with:
   - **Repository access**: `sketchd-drawings` only
   - **Permissions**: Contents → Read and write
3. Copy the token (starts with `github_pat_` or `ghp_`)

---

## 3. Local development

```bash
cp .env.example .env
```

Edit `.env`:

```env
GITHUB_TOKEN=github_pat_...
GITHUB_REPO=shubhransh-gupta/sketchd-drawings
GITHUB_BRANCH=main
SITE_URL=http://localhost:5173
```

```bash
npm run dev
```

The Vite dev server runs the same `/api/*` handlers via middleware.

---

## 4. Deploy to Vercel

### Option A — CLI

```bash
npm install
npx vercel login
npx vercel link
npx vercel env add GITHUB_TOKEN
npx vercel env add GITHUB_REPO
npx vercel env add SITE_URL
npm run deploy
```

### Option B — GitHub integration

1. Import `shubhransh-gupta/sketchd` at [vercel.com/new](https://vercel.com/new)
2. Add environment variables in **Project Settings → Environment Variables**:

| Variable | Example | Notes |
|----------|---------|-------|
| `GITHUB_TOKEN` | `github_pat_...` | Server-side only |
| `GITHUB_REPO` | `shubhransh-gupta/sketchd-drawings` | `owner/repo` |
| `GITHUB_BRANCH` | `main` | Optional |
| `SITE_URL` | `https://sketchd.vercel.app` | Your deployed URL |

3. Deploy — every push to `main` auto-deploys.

---

## 5. Verify the flow

1. Open your deployed URL
2. Draw something
3. Click **Save** → toast: *"Saved to GitHub"*
4. Click **Share** → copy link
5. Open link in incognito → drawing loads from GitHub

---

## Fallback behavior

If GitHub is unavailable (no token, offline, rate limit):

- Drawings save to **localStorage** automatically
- Toast: *"Saved locally — GitHub sync unavailable"*
- Nothing is lost; reconnect and save again to sync

---

## Security notes

- `GITHUB_TOKEN` never reaches the browser
- Token should only have access to the drawings repo
- Drawing IDs are sanitized (`[a-z0-9-]` only)
- No user PII stored in drawing metadata
