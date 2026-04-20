# Deployment Guide - CRM Demo App

This Next.js CRM application is deployed to Firebase Hosting with Cloud Functions for SSR support.

## Live URL

- **Production**: https://crm-demo-ck-prod.web.app

## Prerequisites

- Node.js 20+ (Firebase supports up to Node 24)
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud CLI (for secret management)

## Project Setup

### 1. Firebase Project

The app uses Firebase project: `crm-demo-ck-prod`

Configuration files:
- `firebase.json` - Hosting configuration
- `.firebaserc` - Project alias
- `apphosting.yaml` - App Hosting runtime config (for reference)

### 2. Database (Supabase PostgreSQL)

The app uses Prisma ORM with Supabase PostgreSQL.

**Environment Variables Required:**
- `POSTGRES_URL` - Pooled connection string (for Prisma)
- `POSTGRES_DIRECT_URL` - Direct connection string (for migrations)

## Setting Up Secrets

Secrets are stored in Google Cloud Secret Manager and configured for the Cloud Function.

### Create Secrets (one-time setup)

```bash
# Create the secrets
gcloud secrets create postgres-url --project=crm-demo-ck-prod
gcloud secrets create postgres-direct-url --project=crm-demo-ck-prod

# Add secret values
echo -n "postgresql://user:pass@host:6543/postgres?pgbouncer=true" | \
  gcloud secrets versions add postgres-url --data-file=- --project=crm-demo-ck-prod

echo -n "postgresql://user:pass@host:5432/postgres" | \
  gcloud secrets versions add postgres-direct-url --data-file=- --project=crm-demo-ck-prod
```

### Verify Secrets

```bash
gcloud secrets list --project=crm-demo-ck-prod
```

### Grant Function Access to Secrets

The Cloud Function service account needs access to read secrets:

```bash
gcloud secrets add-iam-policy-binding postgres-url \
  --member="serviceAccount:410504128800-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=crm-demo-ck-prod

gcloud secrets add-iam-policy-binding postgres-direct-url \
  --member="serviceAccount:410504128800-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=crm-demo-ck-prod
```

## Prisma Configuration

**Important**: Firebase's Next.js hosting ignores custom build scripts. To ensure Prisma Client is generated:

The `package.json` includes a `postinstall` script that runs during `npm install`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

This ensures the Prisma Client is generated before the build runs.

## Deploying

### Full Deployment

```bash
firebase deploy --only hosting
```

This will:
1. Install dependencies (runs `postinstall` which generates Prisma Client)
2. Build the Next.js app
3. Create a Cloud Function for SSR
4. Deploy static assets to Firebase Hosting
5. Configure rewrites to route requests to the Cloud Function

### Force Deployment (with cleanup policy)

```bash
firebase deploy --only hosting --force
```

### Deploy Only Functions

```bash
firebase deploy --only functions
```

## Verifying Deployment

### Check Hosting Status

```bash
firebase hosting:channel:list
```

### Check Cloud Function

```bash
firebase functions:list
gcloud functions describe ssrcrmdemockprod --region=us-central1 --project=crm-demo-ck-prod --gen2
```

### View Function Logs

```bash
gcloud functions logs read ssrcrmdemockprod --region=us-central1 --project=crm-demo-ck-prod --gen2 --limit=50
```

## Troubleshooting

### "Site Not Found" Error

If you see the Firebase "Site Not Found" page:
1. Check that the deployment completed successfully
2. Verify the Cloud Function is running: `firebase functions:list`
3. Check function logs for errors

### Prisma Client Not Initialized

If you see `@prisma/client did not initialize yet`:
- Ensure `postinstall` script exists in `package.json`
- Redeploy: `firebase deploy --only hosting --force`

### Database Connection Errors

1. Verify secrets exist: `gcloud secrets list --project=crm-demo-ck-prod`
2. Check environment variables in function:
   ```bash
   gcloud functions describe ssrcrmdemockprod --region=us-central1 --project=crm-demo-ck-prod --gen2 | grep -A 20 "environmentVariables"
   ```

### API Returns 500 Errors

Check the Cloud Function logs:
```bash
gcloud functions logs read ssrcrmdemockprod --region=us-central1 --project=crm-demo-ck-prod --gen2 --limit=30
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                          │
│                 (Static Assets + CDN)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ rewrites /**
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloud Function (Cloud Run)                      │
│                  ssrcrmdemockprod                            │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Next.js    │    │    Prisma    │    │  API Routes  │  │
│  │     SSR      │    │    Client    │    │   /api/*     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                         │
│              (via POSTGRES_URL secret)                       │
└─────────────────────────────────────────────────────────────┘
```

## Supabase Keepalive (Prevent Free Tier Pausing)

Supabase free tier pauses projects after **7 days of inactivity**. A Cloud Scheduler job pings the API daily to prevent this.

### Current Setup

- **Job Name**: `supabase-keepalive`
- **Schedule**: Daily at 9:00 AM UTC (`0 9 * * *`)
- **Endpoint**: `https://crm-demo-ck-prod.web.app/api/dashboard/stats`

### View Job Status

```bash
gcloud scheduler jobs list --location=us-central1 --project=crm-demo-ck-prod
```

### Manually Trigger (Test)

```bash
gcloud scheduler jobs run supabase-keepalive --location=us-central1 --project=crm-demo-ck-prod
```

### View Job Logs

```bash
gcloud logging read "resource.type=cloud_scheduler_job AND resource.labels.job_id=supabase-keepalive" \
  --project=crm-demo-ck-prod --limit=10
```

### Create/Recreate the Job

If you need to set this up again:

```bash
# Enable Cloud Scheduler API (one-time)
gcloud services enable cloudscheduler.googleapis.com --project=crm-demo-ck-prod

# Create the scheduled job
gcloud scheduler jobs create http supabase-keepalive \
  --location=us-central1 \
  --schedule="0 9 * * *" \
  --uri="https://crm-demo-ck-prod.web.app/api/dashboard/stats" \
  --http-method=GET \
  --project=crm-demo-ck-prod \
  --description="Daily ping to keep Supabase database active"
```

### Delete the Job

```bash
gcloud scheduler jobs delete supabase-keepalive --location=us-central1 --project=crm-demo-ck-prod
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build locally
npm run build

# Run production build locally
npm start
```

## Environment Files

- `.env` - Local development (contains database URLs)
- `.env.local` - Local overrides (not committed)

**Note**: The `.env` file is read during Firebase deployment to configure the Cloud Function's environment variables.
