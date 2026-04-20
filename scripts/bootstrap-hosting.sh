#!/usr/bin/env bash
# Bootstrap a fresh Firebase + Supabase deployment for this fork.
#
# Prereqs:
#   1. gcloud CLI authed: `gcloud auth login`
#   2. firebase CLI authed: `firebase login`
#   3. A Supabase project created at https://supabase.com (free tier is fine)
#      with its POSTGRES_URL (pooled, port 6543) and POSTGRES_DIRECT_URL (port 5432)
#      connection strings copied.
#   4. A Firebase project created at https://console.firebase.google.com
#      upgraded to the Blaze (pay-as-you-go) plan — required for Cloud Functions.
#
# Usage:
#   PROJECT_ID=your-firebase-project-id \
#   POSTGRES_URL='postgresql://...pgbouncer=true' \
#   POSTGRES_DIRECT_URL='postgresql://...' \
#   ./scripts/bootstrap-hosting.sh

set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID to your Firebase project id}"
: "${POSTGRES_URL:?Set POSTGRES_URL to the Supabase pooled connection string}"
: "${POSTGRES_DIRECT_URL:?Set POSTGRES_DIRECT_URL to the Supabase direct connection string}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Writing .firebaserc for project: $PROJECT_ID"
cat > .firebaserc <<EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

echo "==> Writing .env for local + deploy-time env injection"
cat > .env <<EOF
# Local development uses sqlite by default. Swap with \`npm run db:use:postgres\`.
SQLITE_URL="file:./dev.db"
POSTGRES_URL="$POSTGRES_URL"
POSTGRES_DIRECT_URL="$POSTGRES_DIRECT_URL"
EOF

echo "==> Enabling required GCP APIs"
gcloud services enable \
  secretmanager.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  --project="$PROJECT_ID"

echo "==> Creating Secret Manager secrets (ignore already-exists errors)"
gcloud secrets create postgres-url --project="$PROJECT_ID" 2>/dev/null || true
gcloud secrets create postgres-direct-url --project="$PROJECT_ID" 2>/dev/null || true

echo "==> Writing secret values"
printf '%s' "$POSTGRES_URL" | gcloud secrets versions add postgres-url --data-file=- --project="$PROJECT_ID"
printf '%s' "$POSTGRES_DIRECT_URL" | gcloud secrets versions add postgres-direct-url --data-file=- --project="$PROJECT_ID"

echo "==> Granting the default compute SA access to secrets"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
for secret in postgres-url postgres-direct-url; do
  gcloud secrets add-iam-policy-binding "$secret" \
    --member="serviceAccount:$SA" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID" >/dev/null
done

echo "==> Installing npm deps"
npm install

echo "==> Pointing Prisma at Postgres and pushing schema + seed data"
npm run db:use:postgres
npx prisma db push
npm run prisma:seed

echo "==> Deploying to Firebase Hosting (this also creates the Cloud Function)"
rm -rf .firebase
firebase deploy --only hosting --project "$PROJECT_ID"

echo ""
echo "Done. Your site should be live at: https://$PROJECT_ID.web.app"
