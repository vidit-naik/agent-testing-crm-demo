# Deploying to Vercel

Monorepo → one Vercel project per app. Main shell rewrites subpaths to sister project domains.

## Layout

```
apps/shell      → crm-demo-agents.vercel.app         (Next 14)
apps/admin      → crm-admin.vercel.app               (Vite React)
apps/checkout   → crm-checkout.vercel.app            (Angular 17)
apps/legacy     → crm-legacy.vercel.app              (AngularJS + Vue 2)
apps/seatmap    → bundled into shell via workspace dep (no separate deploy)
```

## Steps

1. **Install pnpm** (version ≥ 9).
2. **From repo root**: `pnpm install`.
3. **Create five Vercel projects** pointing at this repo, each with its `Root Directory` set to the app path:

   | Vercel project | Root directory | Framework |
   |---|---|---|
   | `crm-demo-agents` (main) | `apps/shell` | Next.js |
   | `crm-admin` | `apps/admin` | Other (Vite) |
   | `crm-checkout` | `apps/checkout` | Other (Angular) |
   | `crm-legacy` | `apps/legacy` | Other (Vite) |

   Each app has its own `vercel.json`. The `installCommand` runs `pnpm install` from the repo root so workspace packages (`@crm/fake-api`, `@crm/seatmap`) resolve.

4. **Update shell rewrites** in `apps/shell/vercel.json` to match the actual domain names Vercel assigned:
   ```json
   { "source": "/admin/:path*", "destination": "https://<admin-project>.vercel.app/:path*" }
   ```
   The defaults (`crm-admin.vercel.app`, `crm-checkout.vercel.app`, `crm-legacy.vercel.app`) are placeholders — rename to your slugs.

5. **Environment variables** (optional, on shell project):
   - `NEXT_PUBLIC_DEBUG_PANEL=1` → enables `/__debug` agent-blind panel.
   - `DATABASE_URL=...` → Postgres connection string for Prisma.

6. **Push to `main`**. All five projects build from the same commit.

## Local dev

```bash
# all apps in separate terminals
pnpm dev:shell      # :3000  → main CRM
pnpm dev:admin      # :3001  → Vite React reports
pnpm dev:checkout   # :3002  → Angular checkout
pnpm dev:legacy     # :3003  → AngularJS + Vue 2 legacy
pnpm dev:seatmap    # :5173  → Lit Web Component dev (not required; bundled into shell)
```

Shell's cross-satellite routes (`/lab/reports`, `/lab/quote`, `/lab/pricing-calc`, `/lab/legacy-admin`) will 404 the iframe/link in local dev unless you also set up a local rewrite. For full local testing, either deploy the satellites to preview URLs or run `vercel dev` from `apps/shell/`.

## Notes

- `apps/seatmap` builds into shell's bundle (workspace import), so it does not need its own Vercel project.
- `apps/shell/vercel.json` uses `cd ../..` to install from the repo root — this is required for pnpm workspace resolution on Vercel.
- The `checksumai` dependency (test-writer) stays on shell only.
- Prisma: shell's `postinstall` hook runs `prisma generate` automatically.
