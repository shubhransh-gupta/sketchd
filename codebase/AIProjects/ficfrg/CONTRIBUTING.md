# Contributing to FixFr

Thanks for helping make civic routing better for everyone.

## Ways to contribute

| Contribution | File(s) to edit |
|-------------|-----------------|
| Add authority | `data/authorities.json` |
| Add city/location | `data/locations.json` |
| Add/update routing | `data/problems.json` |
| Update complaint URL | `data/authorities.json` |
| Fix routing logic | `src/engine/router.ts` |
| Report broken link | Open an issue or PR updating `lastVerified` |

## Data PR checklist

- [ ] Official URL verified in browser (not guessed)
- [ ] `source` field points to verification page
- [ ] `lastVerified` date updated
- [ ] Entry added to `DATA.md`
- [ ] Test added if routing behavior changed

## Development

```bash
npm install
npm run dev       # Start dev server
npm test          # Run routing tests
npm run typecheck # TypeScript check
npm run build     # Production build
```

## Code style

- TypeScript strict mode
- Minimal scope — focused diffs
- Match existing patterns in the codebase
- No backend dependencies

## Routing changes

Routing rules live in `data/problems.json`. Code changes to `src/engine/router.ts` should only be needed when adding new authority roles or jurisdiction mappings.

## Questions?

Open an issue at https://github.com/shubhransh-gupta/FixFR/issues
