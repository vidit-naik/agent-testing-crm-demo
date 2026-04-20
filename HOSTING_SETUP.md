# Hosting Setup — Agent Testing Fork (Vercel)

This is a fork of `crm-demo` intended as a sandboxed deployment for agent testing.
Unlike the original (which ran on Firebase Hosting + Cloud Functions on the Blaze
plan), this fork targets **Vercel**, whose free tier is sufficient for Next.js SSR.

## What's already done in this fork

- `package.json` renamed to `crm-demo-agents`.
- All Firebase-specific files removed (`firebase.json`, `.firebaserc`,
  `apphosting.yaml`, old `DEPLOYMENT.md`).
- `package.json` `deploy` script rewritten to call `vercel --prod`.
- Fresh git history.
- `scripts/bootstrap-vercel.sh` — one-shot provisioning script.

## Prereqs (manual, can't be automated)

1. **Create a Supabase project** at https://supabase.com (free tier).
   From **Project Settings → Database → Connection string**, grab:
   - **Pooled** (port 6543, transaction mode, includes `?pgbouncer=true`) → this is `POSTGRES_URL`
   - **Direct** (port 5432) → this is `POSTGRES_DIRECT_URL`

   Both need the DB password you set at project creation time.

2. **Install + auth Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel login
   ```

## Run the bootstrap

```bash
POSTGRES_URL='postgresql://postgres.xxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true' \
POSTGRES_DIRECT_URL='postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres' \
./scripts/bootstrap-vercel.sh
```

The script will:

1. Write `.env` with both DB URLs (local use).
2. `npm install`, switch Prisma to Postgres mode, push the schema, and seed demo data.
3. `vercel link` — prompts you to pick/create a Vercel project.
4. `vercel env add` — pushes `POSTGRES_URL` and `POSTGRES_DIRECT_URL` to the
   production and preview environments.
5. `vercel --prod` — deploys. Vercel prints the live URL.

## Serverless + Prisma note

Supabase's pooler (port 6543 with `?pgbouncer=true`) is what makes Prisma safe to
use from Vercel's serverless functions. If you hit connection-exhaustion errors
in the logs, append `&connection_limit=1` to `POSTGRES_URL`.

## Local development (no Vercel / Supabase needed)

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

(Switches Prisma to Postgres and runs `vercel --prod`. Or just `git push` — if
you connect the Vercel project to a GitHub repo, Vercel auto-deploys every push.)
