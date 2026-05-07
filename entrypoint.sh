#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
#  hms-fe entrypoint — generate runtime env config
#
#  Next.js bakes NEXT_PUBLIC_* env vars at build time, which means one image
#  per environment. We want ONE image for all envs, so we generate a tiny
#  /public/env-config.js at container start from env vars (sourced from the
#  k8s ConfigMap via `envFrom`). layout.js loads this script with
#  strategy="beforeInteractive" so window.__ENV__ is ready before React.
#
#  Expected env vars (set via ConfigMap hms-fe-config):
#    API_URL      — backend base URL (e.g. https://api.hms-staging.evanlwp.my.id)
#    CREATE_URL   — pubsub base URL  (e.g. https://pubsub.hms-staging.evanlwp.my.id)
# ─────────────────────────────────────────────────────────────────────────────
set -eu

ENV_FILE=/app/public/env-config.js

# Escape any double quotes in values so we don't break the JS literal.
esc() { printf '%s' "$1" | sed 's/"/\\"/g'; }

API_URL_ESC=$(esc "${API_URL:-}")
CREATE_URL_ESC=$(esc "${CREATE_URL:-}")

cat > "$ENV_FILE" <<EOF
window.__ENV__ = {
  API_URL: "${API_URL_ESC}",
  CREATE_URL: "${CREATE_URL_ESC}"
};
EOF

echo "[entrypoint] wrote ${ENV_FILE}"
echo "[entrypoint]   API_URL=${API_URL:-<unset>}"
echo "[entrypoint]   CREATE_URL=${CREATE_URL:-<unset>}"

# Hand off to the CMD (node server.js)
exec "$@"
