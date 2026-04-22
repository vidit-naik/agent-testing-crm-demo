# Agent Gaps & Test-Fixture Element Spec

A reference for (a) what the Checksum agents (E2E healer/scaffolder + CQ code-gen) are systematically missing, and (b) the concrete UI elements / app patterns we should bake into an internal test website so we can reproduce, regression-test, and benchmark agent behavior against these failure modes.

**Sources for everything below:**
- Logfire telemetry (project: `starter-project`), 30 days (Mar 19 → Apr 17, 2026), `e2e-agent` and `aiagents` services.
- Customer submodules under `submodules/` (snipdesk, dealpath, summation, valur, gofundme, integral-de, readyon, xnow + 30 more).

---

## Part 1 — What the agent is missing

Grouped by where in the agent's behavior the gap lives. Each row cites the trace or repo evidence so you can re-derive it.

### 1.1 Diagnostic gaps (E2E agent)

| Gap | What the agent does today | Evidence |
|---|---|---|
| **Can't distinguish "test bug" from "app bug" from "backend bug" from "timing bug"** | All four get the same selector-rewrite treatment; agent edits the test file when the real issue is a runtime crash, a Hasura WebSocket disconnect, or a slow GraphQL query. | snipdesk Hasura timeouts (`019d5fe2…`); board page redirect-to-lobby (`019d44ff…`); `pw_eval` timeouts treated as needing more time, not different code. |
| **Treats wrong selectors as timing problems** | Escalates `pw_eval` timeout from 10s → 15s → 20s → 30s → 40s within a single trace instead of inspecting why the locator returned 0. | Multiple traces show the timeout-bump anti-pattern. |
| **No "have I seen this failure before in this trace?" memory** | Same selector tried, fails, agent edits, tries again with cosmetic variation, fails the same way. | `019d5375…` Duplicate Snip Dialog: 30+ identical "page crashed" responses ignored. |
| **Doesn't recognize infra failures and exit fast** | OpenAI 401 (Sat 21 Mar), ngrok 404 (10 Apr), MessageAbortedError chew the iteration budget instead of terminating the session cleanly. | CQ traces; 6+ `cq.opencode_error.transition` events. |
| **No "should this even be a test?" check** | Tries to test a feature whose backend is currently down (Hasura) or whose UI has crashed (snipdesk Target crashed); doesn't punt to "skip + report blocker". | snipdesk traces. |

### 1.2 Tool-use ergonomics gaps

| Gap | Effect | Evidence |
|---|---|---|
| **Newpage shotgun**: when one page misbehaves, agent spawns N more pages and tries variants. | `019d28159322882e44493f76139fd768` had **46 `context.newPage()` calls** and 36 "Continue with Email" clicks. |
| **Test re-run as a debug step**: re-runs the full Playwright suite to read where it failed, with timeouts escalating 120s → 300s → 600s. | `019d28df…` Snip AI Chat Oversized — 5+ full re-runs with `--grep` value unchanged. |
| **Snapshot ping-pong**: `aria-ref=eNN` clicked from a stale `_snapshotForAI` snapshot after navigation invalidates it. | `019d54fd…` clicks `aria-ref=e251` against a fresh page where e251 means something else. |
| **"Path is not a directory" loop**: misleading read-tool error message on valid `.tsx` files leads the agent to try `…/index.tsx`, `…/`, etc. | 14 occurrences in `019d44ff…`, 10 in `019d28983b…`. |
| **Edit dance**: 5+ consecutive `edit_file` failures on the same spec with different `old_string`s — in-memory copy drifts from disk. | `019d2967d0e2…` |
| **Mental model of the bash allowlist is wrong**: agent keeps trying `chmod`, `kill`, `rg`, `find`, `ps`. `Command not allowed` 68× in the dataset. Even calls `sleep` as a tool name and gets `Unknown tool`. | All traces. |
| **Doesn't escape `{` in ripgrep regex**: `regex parse error: (?:checkoutClicked\s*\(\)\s*{)` bites in 4 traces. | xnow trace `019d3118…` etc. |
| **Workspace path coordination broken across users**: `/Users/anthony/`, `/Users/monicalokare/`, `/Users/rickyzhao/`, `/home/coder/workspace/`, `/workspace/` mixed; `Absolute paths are not allowed` 8+ times. | All non-sandboxed traces. |
| **Auth0 reinvented from scratch every session**: agent re-derives an OAuth-PKCE-via-Node-https flow with `crypto.subtle` PKCE challenge across 1500+ lines of pw_eval, in 5 separate snipdesk traces. | snipdesk login traces. |

### 1.3 UI-pattern blind spots

The agent **doesn't reach for the right primitive** for these patterns. None of these are exotic — all show up across 5+ customer apps.

| Pattern | What the agent does wrong | Customers |
|---|---|---|
| **Portal-rendered dropdowns** (react-select `menuPortalTarget={document.body}`, Radix `*.Portal`, `@angular/cdk` overlay, vue2-teleport) | Queries `dialog.getByRole('option')` → returns 0 → blames the trigger. Should query at root scope. | dealpath, snipdesk, integral-de, readyon, gofundme, xnow, valur, summation |
| **2-step / multi-step identity-server login** (email screen → password screen, no `aria-describedby`) | Inconsistent waits between step 1 and step 2 (1000/1500/2000/8000ms across attempts). | snipdesk, dealpath, gofundme, readyon, xnow, integral-de |
| **Multi-tab modal wizards with disabled-until-valid Next** (often XState-driven) | Re-discovers field requirements by introspection each iteration; doesn't realize transitions briefly disable buttons mid-XState. | dealpath (`EntityCreateEditMachine`), readyon (Add Associate 4-tab), snipdesk, valur |
| **Auth0 cross-origin redirect** that crashes Playwright headless-shell tab | Spawns fresh pages instead of using full Chromium or a programmatic OAuth code-exchange helper. | snipdesk |
| **SPA force-navigates to lobby after Hasura WebSocket disconnect** | Edits selectors when the real fix is asserting URL stability or unrouting WS calls. | snipdesk |
| **Searchable comboboxes with stale options** (debounce + async, no `aria-busy`) | Reads option list before fetch completes. | readyon, integral-de, gofundme |
| **Conditional fields tied to derived/workflow state** (visibility computed across many tables) | Has no debug attribute to read; rewrites assertions instead. | dealpath (892-line `app/utils/conditional.ts`), summation, valur, snipdesk |
| **Drawer-scoped rich-text editors** (TipTap/ProseMirror, Quill, Lexical, MDXEditor — no `data-testid` on the contenteditable) | `fill()` doesn't fire the right ProseMirror events; agent never reaches the input. | snipdesk, summation, dealpath, integral-de |
| **Eventual-consistency dropdowns after admin save** (cache not invalidated on mutation) | Burns iterations re-opening the dropdown looking for the new option. | crm-demo, readyon, integral-de, summation |
| **Multi-frame iframe payment widgets** with bot-detection (Stripe, Braintree) | Fast `fill()` rejected; doesn't know to use `pressSequentially({ delay: 150 })` + retry. | gofundme, xnow, valur, integral-de |
| **Closed shadow-root consent modals** | Can't see inside; doesn't know to monkey-patch `Element.prototype.attachShadow` at `addInitScript` time. | gofundme |
| **WebAuthn / passkey OS prompts** | Doesn't register a virtual authenticator via CDP. | integral-de Microsoft popup |
| **Hidden-but-present duplicate buttons** (responsive variants) | `getByRole` returns multiple hits; doesn't add `:visible` filter. | gofundme |
| **Localization toggle as precondition** | Selectors assume English; default may be German/Swedish. | integral-de, soderberg |
| **Multi-context tests** (one test, multiple users via `browser.newPage()`) | Healer assumes a single page; misses cross-page state. | readyon RBAC suite |
| **Canvas / virtualized grids** (cells not in DOM until scrolled; canvas needs `dispatchEvent` not click) | Coordinate clicks against pan/zoom-transformed React Flow / `@ng-select` overlay. | xnow (seat map), snipdesk (Konva), dealpath/summation (ag-Grid Enterprise), integral-de (xyflow) |
| **Angular SSR / zone.js late render** | Reads `total = 0` from initial SSR HTML; doesn't wait for hydration + cart fetch. | xnow `Total Amount Due` |
| **Yjs collaborative "syncing" state distinct from "online/offline"** | Thinks app is ready when it's still syncing. | snipdesk |
| **Slash-command / mention popups via `@tiptap/suggestion`** | Teleport into Floating UI outside editor's DOM tree. | snipdesk, integral-de, summation |
| **Multi-frontend / multi-repo flows** (one user journey crosses repos and stacks) | Reads stale source tree; doesn't know which repo owns the runtime selector. | gofundme (4 repos / 4 stacks), integral-de (3 repos with parallel `v2/` rewrite), summation, dealpath |

### 1.4 CQ-specific gaps (code-gen pipeline)

| Gap | Effect | Evidence |
|---|---|---|
| **Review-cycle ping-pong dominates dollar cost** | 70% of recent `review` steps need 2–4 review↔impl loops; only 19% close in one. | Logfire stage retry distribution. |
| **Generated-type round-trip awareness** | Edits the source but forgets to regenerate types; CI fails. | summation (5 codegen pipelines: OpenAPI + ts-json-schema + protobufs + tRPC + prompt-md), snipdesk (GraphQL Codegen + TanStack `routeTree.gen.ts`). |
| **AGENTS.md / lint hard rules ignored** | No `any`, no `as` casts, no barrel files, all user strings through `useText()`, no direct `components/ui/**` imports outside design-system layer — agent diffs get rejected at review. | summation AGENTS.md; dealpath ESLint rules. |
| **`missing_required_artifact` nudges** (agent finishes a stage but doesn't write the expected MD file) | Top cases: `verify → bug_report_md` (3 valur sandboxes got 3 consecutive nudges each); `impl → plan_md` 8 sandboxes. | `cq.missing_artifact.nudge` events. |
| **Auto-advance heuristic doesn't recognize "ready to move"** | `cq.manual_prompt` 6–8× in a session — humans had to repeatedly nudge. | `c4081dd6…` (checksum-ai/aiagents), `d51088cb…`, `c27c319b…`. |
| **No fallback for "no app source cloned"** | boostcx had only a test repo and chewed through 8 impl restarts. The E2E side already has a `playwright-test-writer-no-access-to-source` variant; CQ doesn't. | `eda2f389…` boostcx. |
| **Multi-repo navigation** | Re-discovers files each impl in 7-repo gofundme / 3-repo Integral-de monorepos; should consult a one-shot index. | gofundme, integral-de stage-cap hits. |

---

## Part 2 — Elements to add to a test fixture website

The test site should be a single deployable web app that **packs every failure mode above into one place** so we can run E2E healing/scaffolding agents against it deterministically and benchmark fixes. Pages are listed in roughly priority order (highest agent-cost patterns first).

Suggested name: `agent-torture-app` (or similar). Single React 18 + Vite SPA with optional satellite apps for cross-stack scenarios. Each page demonstrates one or more categories so we can A/B test agent improvements per category.

### 2.1 Page inventory

| # | Page / route | Patterns exercised | Required ingredients |
|---|---|---|---|
| 1 | `/login/2-step` | 2-step identity-server login | Page A: email field + Continue. Page B: password + Sign in. **No `aria-describedby` on disabled Continue.** Optional: 3rd step "Stay signed in?" prompt in a non-English string to force locale handling. |
| 2 | `/login/auth0` | Cross-origin Auth0 redirect | Real Auth0 tenant or a mock that lives on a different origin (e.g. `auth.torture-app.test`) and redirects back. Confirms the headless-shell-vs-full-Chromium decision. |
| 3 | `/login/microsoft-passkey` | WebAuthn / passkey OS prompt | Microsoft OAuth-style popup that requests passkey; agent must register virtual authenticator via CDP `addVirtualAuthenticator({protocol: "ctap2"})`. |
| 4 | `/login/locale` | Localization-toggle precondition | App default = German; English toggle in header. All subsequent role-based selectors only stable after switch. |
| 5 | `/forms/portal-dropdown` | Portal-rendered dropdown options | Modal containing a `react-select` with `menuPortalTarget={document.body}`. Same page also includes Radix Select + `@angular/cdk` overlay variants for cross-lib coverage. |
| 6 | `/forms/searchable-combobox` | Searchable combobox with stale options | Input with 300ms debounce → mock fetch with random latency 100–800ms. **No `aria-busy`** by default; also a variant page `/forms/searchable-combobox?ariaBusy=1` so we can prove fixed agents handle it. |
| 7 | `/forms/wizard-xstate` | Multi-tab modal wizard with disabled-until-valid Next | 4-tab modal driven by an XState machine. Each tab has hidden field validity that gates `Next`. Variant: `/forms/wizard-xstate?showReason=1` enables `aria-describedby="wizard-next-reason"` exposing why Next is disabled. |
| 8 | `/forms/conditional-fields` | Conditional fields tied to derived state | Form where field visibility depends on `derived_field × workflow_state × user_role × org_org_setting`. Toggle UI to flip each input. Optional `data-conditional-rule="…"` debug attribute (off by default; `?debug=1` to enable). |
| 9 | `/chat/prosemirror-drawer` | Drawer-scoped ProseMirror contenteditable | Slide-over drawer (Radix Dialog z-300) containing a TipTap editor. **No `data-testid` on the contenteditable element itself.** Also `@tiptap/suggestion` slash-command popup that teleports outside the drawer. Variant: `/chat/lexical-drawer` and `/chat/quill-drawer` for editor-flavor coverage. |
| 10 | `/admin/eventual-consistency-dropdown` | Eventual-consistency dropdown after save | Admin page that creates a list option via mocked POST; the dropdown that consumes the option does **not** invalidate cache. Toggle `?fixCache=1` to invalidate, so we can test both behaviors. |
| 11 | `/payment/stripe-iframe` | Multi-frame Stripe iframe + bot-detection throttling | Real Stripe Payment Element + Card Element side-by-side; mock backend rejects fast input (require `pressSequentially({ delay: 150 })`) until 3rd attempt. |
| 12 | `/payment/braintree-iframe` | Braintree drop-in (alternate iframe model) | Same pattern, different vendor. |
| 13 | `/canvas/seat-map` | True HTML5 canvas | Reuse `@ticketevolution/seatmaps-client` or build a small canvas grid where seats are clickable by pixel coords. Late-rendering totals below the canvas. |
| 14 | `/canvas/react-flow` | Pan/zoom DOM canvas (xyflow) | Tree of nodes with viewport transforms; agent must compute screen coords post-transform. |
| 15 | `/grid/ag-grid-virtualized` | Virtualized grid (cells not in DOM) | ag-Grid Enterprise–style 10k row grid. Test scenarios that need to find row #4500 (off-screen). |
| 16 | `/spa/offline-redirect` | SPA force-navigates after WebSocket disconnect | Long-running route that, after 8s, simulates Hasura WS disconnect → shows "You're offline" banner → redirects to lobby. |
| 17 | `/spa/multi-tenant-org` | Multi-tenant org-context state in localStorage | `/snips/{snipId}` requires `current_organization_id` set first; without it the page errors with "No organization selected" and crashes. Mirrors snipdesk failure exactly. |
| 18 | `/spa/yjs-collab` | Yjs collaborative "syncing" state distinct from "online/offline" | Editor that shows "Connected — syncing" before writes are accepted; tests that write before sync drop changes. |
| 19 | `/duplicates/responsive-buttons` | Hidden-but-present duplicate buttons (responsive variants) | "Donate now" rendered 3× (mobile/tablet/desktop) with `display:none` hiding all but one. `getByRole` returns 3; only one is visible. |
| 20 | `/consent/shadow-modal` | Closed shadow-root consent modal | Render a privacy banner inside `attachShadow({mode: "closed"})`. Agent must monkey-patch `Element.prototype.attachShadow` at `addInitScript` time to even see it. |
| 21 | `/rbac/multi-context` | Multi-context test (one test, two users) | "Verify access" page where a primary user creates a permission and a secondary user (separate `browser.newPage()`) verifies it appears. |
| 22 | `/streaming/sse-chat` | SSE-streamed reducer UI (Addison-style) | Chat that streams tokens via SSE into a Zustand-style reducer. `await waitFor(message)` resolves before the final frame. |
| 23 | `/legacy/angularjs-bridge` | AngularJS digest + `react2angular` mixed render | A page where AngularJS hosts React components via `react2angular`. Forces agents to handle both `ng-model` watchers and React state. |
| 24 | `/legacy/vue2-options` | Vue 2 Options API SFC (1k+ LOC) | Single Vue 2 calculator-style component with custom `VSelect`, `VInputNumber`, `VCardSelect` primitives over Ant Design Vue. |
| 25 | `/spa/quota-overflow` | localStorage quota overflow during login | App writes oversized session blob; without an init-script wrapper around `Storage.prototype.setItem`, an "Oops" modal blocks every test. |
| 26 | `/diagnose/runtime-crash` | App-bug masquerading as test-bug | Page randomly crashes the tab via a synthetic `window.onerror` after navigation. Tests should detect crash + skip + report blocker rather than retry selectors. |
| 27 | `/diagnose/backend-down` | Backend timeout masquerading as test-bug | Same UI as `/forms/wizard-xstate` but mocked backend returns 504 on every save. Tests should classify as "infra failure", not "selector wrong". |
| 28 | `/diagnose/eventual-vs-stale` | Tests should distinguish eventual consistency from "data lost" | Save creates the entity but the polling read returns it only after 2.5s ± 500ms jitter. Variant `?broken=1` never returns the entity (true bug). |
| 29 | `/i18n/late-mount-textids` | Test IDs only present after i18n bundle loads | Page renders with `data-testid` keys initially; i18n hook later swaps them to localized variants. Agents that grab early miss. |
| 30 | `/cross-stack/checkout` | Multi-frontend cross-domain flow | Iframe / cross-domain redirect chain: `checkout.torture-app.test` (Next.js) → `admin.torture-app.test` (AngularJS-style) for the verify step. Mirrors the gofundme 4-repo pattern in a single deployable. |

### 2.2 Cross-cutting test fixtures

These are **infrastructure additions**, not pages, but the testing site should ship them so agents can be benchmarked:

1. **A configurable backend** (NestJS / FastAPI is fine) where every endpoint has knobs for: latency, failure rate, eventual-consistency delay, cache invalidation behavior, and cross-tenant org-state requirements.
2. **A toggle panel at `/__debug`** to flip every variant on or off (`?showReason=1`, `?fixCache=1`, etc.) per session, so we can A/B agent runs.
3. **A "blocker" reporting endpoint** that the agent is expected to POST to when it detects an app-bug or backend-bug (rather than retrying). Tests measure: did the agent correctly classify the failure?
4. **A telemetry collector** that mirrors the cq.* and e2e-agent span shape so we can run the same Logfire dashboards against the test fixture as we do against real customer runs.
5. **A "scoring harness"** that runs the full E2E healer + CQ pipeline against each page and emits: tool-call count, stage retry count, success/failure, time-to-fix. Use this as the agent regression test.
6. **Pre-seeded `data-*` debug attributes** behind `?debug=1` for the patterns that need them: `data-conditional-rule`, `data-checkout-state`, `data-step="email|password"`, `data-busy`, `data-wizard-disabled-reason`. These let us prove "if the app exposes the right hint, the agent succeeds" — which directly motivates the recommendations we'd make to customers.

### 2.3 Reusable agent-side helpers to ship alongside the fixture

Building the fixture isn't useful unless we also codify the helpers it tests. The fixture's **success criterion** is that the agent passes every page using these helpers, and **regresses** if a helper is removed.

| Helper | What it does | Tests on |
|---|---|---|
| `loginViaIdentityServer(page, role)` | Handles 2-step email→password screens with the right `data-step` waits. | `/login/2-step`, `/login/auth0`, `/login/locale` |
| `loginViaAuth0Direct(page, {clientId, audience})` | Programmatic OAuth code-exchange via Node `https`, seeds tokens into `localStorage`, bypasses cross-origin redirect. | `/login/auth0` |
| `selectFromPortal(trigger, optionName)` | Opens a portaled dropdown and queries options at root scope. | `/forms/portal-dropdown` |
| `advanceWizardStep(modal, stepConfig)` | Knows each tab's required fields and the XState transition delays. | `/forms/wizard-xstate` |
| `typeIntoProseMirror(locator, text)` | Dispatches the right ProseMirror events. | `/chat/prosemirror-drawer` |
| `pollUntilOption(combobox, optionName, {timeout})` | `expect.poll(...).toContain(...)` with reload step on timeout. | `/admin/eventual-consistency-dropdown` |
| `fillStripeIframe(frame, {card, expiry, cvc})` | `pressSequentially({ delay: 150 })` + 3-attempt retry. | `/payment/stripe-iframe` |
| `bypassConsentShadow(page)` | `page.addInitScript()` that wraps `Element.prototype.attachShadow`. | `/consent/shadow-modal` |
| `registerVirtualAuthenticator(page)` | CDP `WebAuthn.addVirtualAuthenticator`. | `/login/microsoft-passkey` |
| `classifyFailure(error)` | Returns `'app-bug' | 'backend-bug' | 'eventual-consistency' | 'test-bug'` and POSTs to `/blocker` if not the last. | `/diagnose/*` |
| `assertUrlStability(page, ms)` | Waits N ms and confirms the URL hasn't changed. | `/spa/offline-redirect` |
| `setOrgContext(page, orgId)` | Seeds multi-tenant `current_organization_id` into `sessionStorage` before nav. | `/spa/multi-tenant-org` |
| `awaitYjsSync(page)` | Waits for the "Connected — syncing" → "Connected" transition. | `/spa/yjs-collab` |
| `firstVisible(locator)` | `.and(page.locator(":visible")).first()` shortcut. | `/duplicates/responsive-buttons` |
| `repoIndex(repoRoot)` | One-shot index of file paths + exports for multi-repo monorepos so the agent doesn't re-discover every iteration. | CQ-side helper for `/cross-stack/*` |

### 2.4 Anti-patterns the fixture should detect (negative tests)

We should also have pages that succeed only if the agent **stops doing** the documented anti-patterns:

- `/anti/newpage-shotgun`: page that succeeds on first navigation but fails on every subsequent `context.newPage()` for the same URL. Limit: ≤2 fresh pages.
- `/anti/full-rerun-debug`: large suite where running the full test takes 90s. Agent must read narrowed test output, not re-run.
- `/anti/snapshot-drift`: returns different `aria-ref` IDs every snapshot. Agent must re-snapshot before clicking, never reuse old refs.
- `/anti/timeout-bump`: selector that resolves in 200ms but is wrong. Agent must not bump timeouts; should change the selector.
- `/anti/path-not-dir`: file path that returns "not a directory" once for a valid file, then succeeds. Agent must not loop on `…/index.tsx` variants.

### 2.5 CQ-specific test scenarios

The CQ pipeline needs scenarios where the agent must produce code/MD artifacts. Build these as separate test repos under `submodules/torture-cq/`:

| Scenario | Tests |
|---|---|
| **`torture-cq/single-repo-typescript-strict`** | Strict TS, must regenerate types; no barrels. Verifies generated-type round-trip awareness. |
| **`torture-cq/multi-repo-monorepo`** | 3 repos to clone (frontend + backend + tests) with cross-repo references. Verifies multi-repo navigation. |
| **`torture-cq/no-source-test-repo`** | Only test repo, no app source. Verifies CQ has a no-source fallback (matching E2E). |
| **`torture-cq/agents-md-hard-rules`** | AGENTS.md with no-`any`, no-`as`, all-strings-via-`useText()`, no-direct-Radix-imports. Verifies rule compliance. |
| **`torture-cq/eventual-consistency-verify`** | `verify` step requires polling a backend that takes 3–8s to settle. Verifies CQ doesn't nudge `bug_report_md` prematurely. |
| **`torture-cq/infra-failure-recovery`** | Mock OpenAI / Anthropic backend returns 401 or 503 randomly. Verifies CQ detects + exits, doesn't burn budget. |
| **`torture-cq/state-machine-impl-review-loop`** | `impl` produces something `review` always finds one cosmetic nit on. Verifies the review-cycle compression work. |

---

## Part 3 — How to use this document

1. **Build the fixture incrementally** — the `Part 2.1` table is roughly priority-ordered; pages 1–10 cover ~80% of agent retries observed in production.
2. **Wire the scoring harness early.** Without `tool-call count + stage retry count + success/failure` per page, you can't tell if a fix helps.
3. **Treat each helper in `Part 2.3` as a self-contained PR.** Adding `selectFromPortal` alone would likely halve agent retries on dealpath, snipdesk, integral-de, readyon, gofundme, and xnow combined.
4. **Use `Part 1` as the "definition of done" for agent improvements.** Each gap should map to either: a new helper in the framework, a debug attribute customers should add, or a new diagnostic step in the agent's loop.
5. **Re-run this analysis monthly** against fresh Logfire data. The category list will evolve as customers ship new UI patterns and we ship agent improvements.
