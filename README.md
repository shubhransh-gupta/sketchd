# FixFr

**Fix, for real.** Who owns this civic problem?

FixFr is an open-source, static web app that routes real-world complaints to the correct government authority in India. Describe your problem in plain English — get the responsible authority, official complaint channel, and escalation path.

**Live:** [shubhransh-gupta.github.io/fixfr](https://shubhransh-gupta.github.io/fixfr)

## What it does

```
PROBLEM → RESPONSIBLE AUTHORITY → OFFICIAL COMPLAINT CHANNEL → WHAT TO SUBMIT → ESCALATION PATH
```

FixFr is **not** a government portal. It does not submit complaints or impersonate any department.

## Quick start

```bash
git clone https://github.com/shubhransh-gupta/fixfr.git
cd fixfr
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

GitHub Pages build:

```bash
npm run build:pages
```

## Supported locations

Coverage varies by location. Currently verified:

- Bengaluru, Karnataka
- Mysuru, Karnataka
- Lucknow, Uttar Pradesh
- Noida, Uttar Pradesh
- Mumbai, Maharashtra
- Delhi

## Problem categories

Garbage · Street lights · Roads · Water · Drainage · Noise · Construction · Animals · Traffic · Encroachment

## Architecture

100% static — deployable exclusively through GitHub Pages.

- React + TypeScript + Vite
- Static JSON datasets in `/data`
- Client-side routing engine in `/src/engine`
- Leaflet + OpenStreetMap for location visualization
- No backend, database, API keys, or authentication

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Contributing

We welcome PRs that add jurisdictions, authorities, or routing rules. See [CONTRIBUTING.md](./CONTRIBUTING.md) and [DATA.md](./DATA.md).

## Data quality

Every authority URL is documented with source and last-verified date. Never guess links — see [DATA.md](./DATA.md).

## License

MIT — see [LICENSE](./LICENSE).
