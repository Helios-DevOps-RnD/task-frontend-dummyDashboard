# hms-fe — Next.js Dashboard

Next.js 14 UI that talks to `hms-be` (read/update/delete) and `hms-pubsub` (create). Runs on **port 3000**.

## Prerequisites

- Node.js 20+
- `hms-be` running on `http://127.0.0.1:3001`
- `hms-pubsub` running on `http://127.0.0.1:3002`

## Quick start

```bash
# 1. Install deps
npm install

# 2. Create local env file (optional — defaults already point to 3001/3002)
cp .env.example .env.local
# edit .env.local only if you need to override API_URL / CREATE_URL

# 3. Run it
npm run dev
```

Open `http://localhost:3000`.

## Runtime env injection

This app is deployed as **one image across staging & prod**. URLs are injected
at runtime via `/public/env-config.js` (read by `window.__ENV__` in the browser):

- **In Docker / k8s:** `entrypoint.sh` rewrites `/public/env-config.js` on
  container start from the `hms-fe-config` ConfigMap (`API_URL`, `CREATE_URL`).
- **In local dev:** the `predev` npm hook runs `scripts/gen-env-config.js`,
  which reads `.env.local` (or shell env) and regenerates
  `/public/env-config.js` before `next dev` starts.

So you **never** edit `/public/env-config.js` by hand — change `.env.local`
and re-run `npm run dev`.

## Port conventions (local dev)

| Service  | Port |
| -------- | ---- |
| **hms-fe** | **3000** |
| hms-be   | 3001 |
| hms-pubsub | 3002 |
