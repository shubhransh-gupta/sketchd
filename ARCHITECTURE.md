# Architecture

FixFr is designed to run entirely on GitHub Pages with zero server infrastructure.

## Stack

```
GitHub Repository
      ↓
GitHub Actions (build)
      ↓
Static HTML/CSS/JS in /dist
      ↓
GitHub Pages CDN
      ↓
Browser
```

| Layer | Technology |
|-------|------------|
| UI | React 19, CSS |
| Build | Vite, TypeScript |
| Map | Leaflet + OpenStreetMap tiles |
| Data | Static JSON in `/data` |
| Routing | Pure TypeScript engine in `/src/engine` |
| Tests | Vitest |
| CI | GitHub Actions |

## Data flow

1. User describes problem → **classifier** matches keywords to category
2. User selects/confirms location → **location resolver** maps to jurisdiction
3. Progressive questions refine context → **question engine**
4. **Router** applies rules from `problems.json` → resolves authority role → maps to authority ID for jurisdiction
5. Result screen shows authority, reasoning, official links, escalation

## Key files

```
data/
  authorities.json    # Authority definitions + official URLs
  problems.json       # Problem categories + routing rules
  locations.json      # Cities, coordinates, PIN codes
  escalation.json     # Escalation paths by category

src/engine/
  classifier.ts       # Keyword-based problem classification
  router.ts           # Authority routing logic
  questions.ts        # Progressive question definitions
  types.ts            # Shared TypeScript types

src/lib/
  location.ts         # Location search + geolocation mapping

src/components/
  LocationMap.tsx     # Lazy-loaded Leaflet map
```

## Routing rules

Routing rules in `problems.json` use **authority roles** (municipal, water_board, police, etc.) rather than hardcoded authority IDs. The router maps roles to concrete authorities based on the user's selected city.

Example:

```json
{
  "condition": { "road_type": "national_highway" },
  "authorityRole": "nhai",
  "confidence": "high",
  "reason": "National highways are maintained by NHAI."
}
```

## Map

- Lazy-loaded only after location selection
- Uses OpenStreetMap tiles (no API key)
- Falls back gracefully if tiles fail
- Does not affect routing — purely visual

## Constraints

Everything must pass this test:

> Can this be implemented using only a GitHub repo + GitHub Pages + browser capabilities + public data?

If no → do not build it.

## Extending coverage

1. Add location to `data/locations.json`
2. Add authorities to `data/authorities.json`
3. Update role maps in `src/engine/router.ts` if needed
4. Document in `DATA.md`
5. Add routing tests in `src/test/`
