#!/usr/bin/env node
/**
 * Checks all URLs in data/authorities.json and reports status.
 * Used by CI — the app itself stays fully static.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dir, '../data/authorities.json');
const authorities = JSON.parse(readFileSync(dataPath, 'utf8'));

const urls = [];
for (const auth of authorities) {
  for (const ch of auth.complaint_channels ?? []) {
    if (ch.url) urls.push({ authority: auth.id, url: ch.url, label: ch.label });
  }
  if (auth.website) urls.push({ authority: auth.id, url: auth.website, label: 'website' });
  if (auth.source) urls.push({ authority: auth.id, url: auth.source, label: 'source' });
}

const unique = [...new Map(urls.map((u) => [u.url, u])).values()];

let working = 0;
let redirected = 0;
let broken = 0;
const report = [];

for (const { authority, url, label } of unique) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const status = res.status;
    if (status >= 200 && status < 300) {
      working++;
      report.push({ authority, url, label, status: 'working', code: status });
    } else if (status >= 300 && status < 400) {
      redirected++;
      report.push({ authority, url, label, status: 'redirected', code: status });
    } else {
      broken++;
      report.push({ authority, url, label, status: 'broken', code: status });
    }
  } catch (err) {
    broken++;
    report.push({ authority, url, label, status: 'broken', error: String(err) });
  }
}

const summary = {
  checked: unique.length,
  working,
  redirected,
  broken,
  timestamp: new Date().toISOString(),
  details: report,
};

console.log(`Authority links checked: ${summary.checked}`);
console.log(`🟢 Working: ${working}`);
console.log(`🟡 Redirected: ${redirected}`);
console.log(`🔴 Broken: ${broken}`);

writeFileSync(join(__dir, '../link-check-report.json'), JSON.stringify(summary, null, 2));

if (broken > 0) {
  console.error('\nBroken links found — see link-check-report.json');
  process.exit(1);
}
