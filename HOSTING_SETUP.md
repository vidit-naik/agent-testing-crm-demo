# Hosting Setup — Agent Testing Fork

This is a fork of `crm-demo` intended as a sandboxed deployment for agent testing.
It is **not** wired to any live Firebase project yet. Follow the steps below to
stand up your own isolated copy.

## What's already done in this fork

- `package.json` renamed to `crm-demo-agents`.
- `firebase.json` function name changed to `ssrcrmagents` (so it won't collide
  with the original `crm-demo-ck-prod` deployment if they ever share a GCP org).
- `.firebaserc` project id set to the placeholder `REPLACE_WITH_FIREBASE_PROJECT_ID`
  (the bootstrap script will rewrite this).
- Fresh git history (`git log` shows a single "initial fork" commit).
- `scripts/bootstrap-hosting.sh` — one-shot provisioning script.

## What you still need to do manually (can't be automated)

1. **Create a Supabase project** at https://supabase.com
   - Grab the pooled connection string (port 6543, includes `?pgbouncer=true`) — this
     is `POSTGRES_URL`.
   - Grab the direct connection string (port 5432) — this is `POSTGRES_DIRECT_URL`.

2. **Create a Firebase project** at https://console.firebase.google.com
   - Upgrade it to the **Blaze** plan. Cloud Functions (required for Next.js SSR)
     will not deploy on Spark.

3. **Auth both CLIs once**:
   ```bash
   gcloud auth login
   firebase login
   ```

## Then run the bootstrap

```bash
PROJECT_ID=your-firebase-project-id \
POSTGRES_URL='postgresql://postgres:PASSWORD@db.xxxx.supabase.co:6543/postgres?pgbouncer=true' \
POSTGRES_DIRECT_URL='postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres' \
./scripts/bootstrap-hosting.sh
```

The script will:

1. Write `.firebaserc` with your project id.
2. Write `.env` with both DB URLs.
3. Enable Secret Manager, Cloud Functions, Cloud Build, and Cloud Run APIs.
4. Create `postgres-url` and `postgres-direct-url` secrets in Secret Manager and
   grant the default compute SA `secretmanager.secretAccessor`.
5. `npm install`, switch Prisma to Postgres mode, push the schema, and seed demo data.
6. `firebase deploy --only hosting` — this creates the `ssrcrmagents` Cloud
   Function and the hosting site in one shot.

When it finishes you should see your site at `https://<PROJECT_ID>.web.app`.

## Local development (no Firebase / Supabase needed)

```bash
npm install
npm run db:use:sqlite   # points Prisma at a local sqlite file
npm run db:setup        # generate + push + seed
npm run dev             # http://localhost:3000
```

## Re-deploying after code changes

```bash
npm run deploy
```

(Defined in `package.json` — switches Prisma to Postgres, wipes `.firebase/`, and
runs `firebase deploy`.)

## See also

- `DEPLOYMENT.md` — the original project's full operational runbook. Most of it
  still applies, but substitute your project id for `crm-demo-ck-prod` and the
  function name `ssrcrmagents` for `ssrcrmdemockprod`.
