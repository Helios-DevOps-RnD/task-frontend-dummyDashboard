#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  scripts/gen-env-config.js
//
//  Generates /public/env-config.js for LOCAL DEV from .env.local (or shell env).
//  In production, entrypoint.sh does this same job inside the container from
//  the k8s ConfigMap — so ONE image works across staging & prod.
//
//  Runs automatically via the `predev` / `prebuild` npm hooks.
//
//  Priority order for each key:
//    1. process.env  (shell wins — e.g. `API_URL=http://x npm run dev`)
//    2. .env.local   (committed-safe, gitignored by Next.js defaults)
//    3. hardcoded fallback below
// ─────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_LOCAL = path.join(ROOT, '.env.local');
const OUT = path.join(ROOT, 'public', 'env-config.js');

// Minimal .env parser — KEY=VALUE, ignores blank lines and `#` comments.
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const raw of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // Strip matching surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fileEnv = parseEnvFile(ENV_LOCAL);

const API_URL    = process.env.API_URL    ?? fileEnv.API_URL    ?? 'http://127.0.0.1:3001';
const CREATE_URL = process.env.CREATE_URL ?? fileEnv.CREATE_URL ?? 'http://127.0.0.1:3002';

const esc = (s) => String(s).replace(/"/g, '\\"');

const contents = `window.__ENV__ = {
  API_URL: "${esc(API_URL)}",
  CREATE_URL: "${esc(CREATE_URL)}"
};
`;

fs.writeFileSync(OUT, contents, 'utf8');
console.log(`[gen-env-config] wrote ${path.relative(ROOT, OUT)}`);
console.log(`[gen-env-config]   API_URL=${API_URL}`);
console.log(`[gen-env-config]   CREATE_URL=${CREATE_URL}`);
