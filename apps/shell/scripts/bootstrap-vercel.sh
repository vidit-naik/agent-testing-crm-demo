#!/usr/bin/env bash
# Bootstrap a fresh Vercel deployment for this fork.
#
# Prereqs:
#   1. Vercel CLI installed and authed: `npm i -g vercel && vercel login`
#   2. A Supabase project created at https://supabase.com (free tier is fine)
#      with its POSTGRES_URL (pooled, port 6543) and POSTGRES_DIRECT_URL
#      (direct, port 5432) copied from Settings → Database → Connection string.
#
# Usage:
#   POSTGRES_URL='postgresql://...pgbouncer=true' \
#   POSTGRES_DIRECT_URL='postgresql://...' \
#   ./scripts/bootstrap-vercel.sh

set -euo pipefail

: "${POSTGRES_URL:?Set POSTGRES_URL to the Supabase pooled connection string}"
: "${POSTGRES_DIRECT_URL:?Set POSTGRES_DIRECT_URL to the Supabase direct connection string}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Writing .env (used locally AND fed to Vercel in the next step)"
cat > .env <<EOF
# Local + production connection strings.
SQLITE_URL="file:./dev.db"
POSTGRES_URL="$POSTGRES_URL"
POSTGRES_DIRECT_URL="$POSTGRES_DIRECT_URL"
EOF

echo "==> Installing npm deps"
npm install

echo "==> Pointing Prisma at Postgres and pushing schema + seed data"
npm run db:use:postgres
npx prisma db push
npm run prisma:seed

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

echo "==> Linking this directory to a Vercel project (answer the prompts)"
vercel link

echo "==> Pushing env vars to Vercel (production scope)"
# Pipe values into `vercel env add` to avoid the interactive editor.
printf '%s' "$POSTGRES_URL"        | vercel env add POSTGRES_URL        production
printf '%s' "$POSTGRES_DIRECT_URL" | vercel env add POSTGRES_DIRECT_URL production
printf '%s' "$POSTGRES_URL"        | vercel env add POSTGRES_URL        preview
printf '%s' "$POSTGRES_DIRECT_URL" | vercel env add POSTGRES_DIRECT_URL preview

echo "==> Deploying to production"
vercel --prod

echo ""
echo "Done. Vercel printed the live URL above."
