# Data documentation

Every authority entry must include verified official information. **Never fabricate URLs.**

## Schema

### Authority (`data/authorities.json`)

| Field | Description |
|-------|-------------|
| `id` | Unique slug |
| `name` | Full official name |
| `shortName` | Display name |
| `state` | State or "India" |
| `jurisdiction` | City names covered |
| `departments` | Issue types handled |
| `website` | Official domain |
| `source` | URL where info was verified |
| `lastVerified` | ISO date |
| `complaint_channels` | Official contact methods |

### Location (`data/locations.json`)

| Field | Description |
|-------|-------------|
| `id` | Unique slug |
| `name` | City name |
| `latitude/longitude` | Map coordinates |
| `pinCodes` | Supported PIN codes |
| `aliases` | Alternative names |
| `authorityIds` | Authorities in this city |
| `emergency` | Emergency numbers |

## Verified authorities

### BBMP — Bruhat Bengaluru Mahanagara Palike

- **Domain:** https://bbmp.gov.in/
- **Complaint URL:** https://sahaya.bbmp.gov.in/
- **Last verified:** 2026-08-12
- **Issues:** Garbage, roads, drainage, street lights, encroachment, building
- **Source:** Official BBMP website

### BESCOM — Bangalore Electricity Supply Company

- **Domain:** https://bescom.org/
- **Last verified:** 2026-08-12
- **Issues:** Street lighting, electrical hazards
- **Source:** Official BESCOM website

### NHAI — National Highways Authority of India

- **Domain:** https://nhai.gov.in/
- **Complaint URL:** https://pgportal.gov.in/
- **Last verified:** 2026-08-12
- **Issues:** National highway roads, traffic infrastructure
- **Source:** Official NHAI website

### Delhi Jal Board

- **Domain:** https://delhijalboard.delhi.gov.in/
- **Last verified:** 2026-08-12
- **Issues:** Water supply, sewage (Delhi)
- **Source:** Official DJB website

*(See `data/authorities.json` for the complete list.)*

## Link checking

A weekly GitHub Action runs `npm run check-links` to verify all URLs. Reports are saved as artifacts.

## Adding new data

1. Verify the official URL in a browser
2. Add entry to the appropriate JSON file
3. Update this document
4. Add a test case if routing is affected
5. Submit a PR
