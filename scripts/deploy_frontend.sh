#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-}"

if [[ -z "$ENVIRONMENT" ]]; then
  echo "Usage: deploy_frontend.sh <environment>"
  exit 1
fi

if [[ -z "${FRONTEND_TOKEN:-}" ]]; then
  echo "FRONTEND_TOKEN no definido"
  exit 1
fi

rm -f frontend.zip
(
  cd frontend
  zip -rq ../frontend.zip .
)

sanitize() {
  printf "%s" "$1" | tr -d '\r\n'
}

CUSTOM_ENDPOINT=$(sanitize "${FRONTEND_DEPLOY_ENDPOINT:-}")

if [[ -n "$CUSTOM_ENDPOINT" ]]; then
  echo "Desplegando frontend en ${ENVIRONMENT} usando endpoint custom"
  curl -sSf -X POST \
    -H "Authorization: Bearer ${FRONTEND_TOKEN}" \
    -H "Content-Type: application/zip" \
    --data-binary "@frontend.zip" \
    "${CUSTOM_ENDPOINT}"
  echo "Frontend desplegado correctamente"
  exit 0
fi

if [[ -z "${FRONTEND_SITE_ID:-}" ]]; then
  echo "FRONTEND_SITE_ID no definido"
  exit 1
fi

SITE_ID=$(sanitize "${FRONTEND_SITE_ID}")

if [[ -z "$SITE_ID" ]]; then
  echo "FRONTEND_SITE_ID quedó vacío después de sanitizar (¿espacios o saltos de línea?)." >&2
  exit 1
fi

echo "Desplegando frontend en ${ENVIRONMENT} (Netlify)"
curl -sSf -H "Authorization: Bearer ${FRONTEND_TOKEN}" \
  -H "Content-Type: application/zip" \
  --data-binary "@frontend.zip" \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys"

echo "Frontend desplegado correctamente"

