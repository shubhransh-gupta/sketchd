# GitHub API + Deployment

## Architecture (GitHub Pages + Save API)

GitHub Pages is **static only** — it cannot run `/api/save` at runtime. Production uses:

```
Browser (GitHub Pages)  →  POST /api/save           →  Cloudflare Worker or Vercel  →  GitHub Contents API
Browser (shared link)   →  GET  /api/drawings/:id   →  Cloudflare Worker or Vercel  →  sketchd-drawings repo
Browser (fallback)      →  GET  raw.githubusercontent.com/.../drawings/:id.json
```

Drawings are stored as JSON in [sketchd-drawings](https://github.com/shubhransh-gupta/sketchd-drawings):

```
shubhransh-gupta/sketchd-drawings/
  drawings/
    quiet-moon-42.json
```

No user authentication. A server-side GitHub token handles all writes.

---

## 1. Create a GitHub token

1. **GitHub → Settings → Developer settings → Personal access tokens**
2. Fine-grained token with:
   - **Repository**: `sketchd-drawings` only
   - **Permissions**: Contents → Read and write
3. Copy the token

---

## 2. Deploy the Save API

Choose **one** backend (Cloudflare Worker is recommended for GitHub Pages).

### Option A — Cloudflare Worker (recommended)

1. Create a [Cloudflare](https://dash.cloudflare.com) account (free tier works)
2. Add these **GitHub repository secrets** on `shubhransh-gupta/sketchd`:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `DRAWINGS_REPO_TOKEN` | GitHub PAT from step 1 |
| `VITE_API_URL` | Worker URL after first deploy, e.g. `https://sketchd-api.<subdomain>.workers.dev` |

3. Push to `main` — the **Deploy Save API** workflow deploys `worker/` automatically
4. After the first deploy, copy the worker URL from Cloudflare dashboard and set `VITE_API_URL` secret
5. Re-run **Deploy GitHub Pages** (or push any change) so the frontend picks up `VITE_API_URL`

Manual deploy:

```bash
cd worker
npm ci
npx wrangler login
echo "YOUR_PAT" | npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

### Option B — Vercel serverless

1. Import the repo at [vercel.com/new](https://vercel.com/new) (API-only project is fine)
2. Set environment variables:

| Variable | Example |
|----------|---------|
| `GITHUB_TOKEN` | `github_pat_...` |
| `GITHUB_REPO` | `shubhransh-gupta/sketchd-drawings` |
| `GITHUB_BRANCH` | `main` |
| `SITE_URL` | `https://shubhransh-gupta.github.io/sketchd` |

3. Deploy — API lives at `https://your-project.vercel.app`
4. Set GitHub secret `VITE_API_URL` to that URL (no trailing slash)
5. Re-deploy GitHub Pages

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

Leave `VITE_API_URL` empty locally — Vite middleware serves `/api/*` on the same origin.

---

## 4. Verify end-to-end

1. Open https://shubhransh-gupta.github.io/sketchd/
2. Draw something → click **Save** → toast: *"Saved to GitHub"*
3. Check [sketchd-drawings/drawings](https://github.com/shubhransh-gupta/sketchd-drawings/tree/main/drawings) for a new `.json` file
4. Click **Share** → copy link
5. Open link in incognito → same drawing loads

Health check (replace with your API URL):

```bash
curl https://sketchd-api.YOUR_SUBDOMAIN.workers.dev/api/health
```

---

## Fallback behavior

If the save API is unreachable:

- Drawings still save to **localStorage** on your device
- Toast warns that cloud sync is unavailable
- Shared links only work for others after a successful cloud save

---

## Security

- `GITHUB_TOKEN` / `DRAWINGS_REPO_TOKEN` never reach the browser
- Token should only access `sketchd-drawings`
- Drawing IDs are sanitized (`[a-z0-9-]` only)
