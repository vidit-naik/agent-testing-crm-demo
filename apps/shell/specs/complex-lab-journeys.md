# Complex Lab Journeys

Concise benchmark candidates for validating agent behavior across long-running, stateful, product-facing workflows. Each journey should exercise realistic ambiguity, multi-step UI control, document interpretation, and final deliverable quality.

## Primary Journey: Blueprint Takeoff E2E

**Journey:** Run a Togal.ai-like construction takeoff from upload to client-ready estimate. The user uploads a multi-page blueprint set, identifies scale and drawing discipline, selects rooms/areas to measure, applies assemblies and pricing rules, reviews detected quantities, resolves low-confidence regions, exports a takeoff report, and saves the project for later revision.

**Hard-to-test mechanics:**
- Reading dense plan sheets with symbols, legends, callouts, scale bars, revisions, and page-specific context.
- Switching between automated extraction, manual correction, and audit review without losing state.
- Handling ambiguous or conflicting measurements, including partial rooms, curved areas, rotated sheets, and repeated floor plans.
- Maintaining traceability from final quantities back to source sheet, region, assembly, and user correction.
- Producing a polished output while preserving intermediate assumptions and exceptions.

**Suggested assertions:**
- Correctly detects sheet list, active scale, and target measurement scope before starting takeoff.
- Extracted quantities stay within configured tolerance for known benchmark fixtures.
- User corrections update dependent totals, pricing, and report summaries consistently.
- Low-confidence measurements are surfaced with clear review affordances instead of silently accepted.
- Exported report includes quantities, units, pricing assumptions, exceptions, and source references.
- Saved project reloads with measurements, annotations, filters, and unresolved review items intact.

## Additional High-Complexity Full Journey Ideas

### 1. Multi-Carrier Insurance Claim Triage

**Journey:** Intake a property damage claim with photos, policy documents, adjuster notes, and repair invoices; classify coverage, identify missing evidence, draft a claimant response, and route the claim for approval.

**Hard-to-test mechanics:** Document comparison across policy language and evidence, image-grounded damage assessment, jurisdiction-specific exclusions, human approval routing, and stateful claim notes.

**Suggested assertions:** Flags missing required evidence, cites policy clauses, preserves claim timeline, calculates recommended payout within rules, and routes edge cases to the right reviewer queue.

### 2. Enterprise Renewal Negotiation Workspace

**Journey:** Prepare a complex SaaS renewal by reviewing usage, support tickets, contract terms, procurement history, expansion opportunities, and risk signals; then generate a negotiation plan and renewal quote.

**Hard-to-test mechanics:** Cross-object CRM reasoning, contract clause extraction, pricing waterfall logic, account health synthesis, and role-specific deliverables for sales, legal, and finance.

**Suggested assertions:** Identifies renewal deadline and notice period, applies discount guardrails, separates upsell from renewal value, surfaces risk drivers, and produces quote terms matching policy.

### 3. Clinical Prior Authorization Packet

**Journey:** Assemble a prior authorization request from patient history, diagnosis codes, medication history, payer rules, lab results, and provider notes; detect gaps and produce a submission-ready packet.

**Hard-to-test mechanics:** Medical terminology normalization, rule-based payer criteria, missing-data detection, privacy-sensitive document handling, and evidence-to-requirement mapping.

**Suggested assertions:** Maps criteria to supporting evidence, identifies unmet requirements, avoids unsupported clinical claims, redacts irrelevant sensitive data, and preserves submission checklist status.

### 4. Financial Close Variance Investigation

**Journey:** Investigate monthly close variances across ledger exports, budget files, invoices, accrual schedules, and department comments; reconcile discrepancies and draft controller-ready explanations.

**Hard-to-test mechanics:** Spreadsheet ingestion, account hierarchy traversal, time-period alignment, exception handling, formula validation, and narrative generation tied to numeric evidence.

**Suggested assertions:** Reconciles totals to source data, explains material variances only above threshold, links each explanation to transactions, preserves audit trail, and flags unreconciled balances.

### 5. Supply Chain Disruption Replan

**Journey:** Respond to a supplier delay by identifying affected purchase orders, inventory coverage, customer commitments, substitute parts, logistics options, and margin impact; recommend a recovery plan.

**Hard-to-test mechanics:** Multi-hop dependency tracing, constraint optimization, partial shipment logic, customer prioritization, and tradeoffs across cost, time, and service-level obligations.

**Suggested assertions:** Identifies all impacted orders, respects inventory and substitution constraints, ranks mitigation options, calculates delivery and margin impact, and records approval requirements.

### 6. Legal Contract Redline Review

**Journey:** Compare a counterparty redline against the approved template and playbook, classify risky deviations, propose fallback language, and prepare a partner-facing markup summary.

**Hard-to-test mechanics:** Clause-level diffing, legal playbook interpretation, fallback hierarchy, negotiation context retention, and precise citation without overclaiming legal advice.

**Suggested assertions:** Detects material deviations, labels risk severity, chooses approved fallback language, preserves unchanged clauses, and generates a concise issue list for counsel review.

### 7. Incident Commander Postmortem Builder

**Journey:** Convert alert history, logs, Slack-style incident notes, status page updates, and deployment records into a postmortem with timeline, root cause, customer impact, and follow-up actions.

**Hard-to-test mechanics:** Timestamp normalization, event deduplication, causal inference boundaries, ownership assignment, severity policy mapping, and action item lifecycle tracking.

**Suggested assertions:** Builds a chronologically correct timeline, distinguishes facts from hypotheses, aligns severity with policy, assigns follow-ups to owners, and preserves links to source evidence.

### 8. Public Sector Grant Application Review

**Journey:** Review a grant application package against program rules, budget constraints, eligibility criteria, attachments, scoring rubric, and reviewer comments; produce a funding recommendation.

**Hard-to-test mechanics:** Eligibility rule interpretation, budget math, rubric scoring consistency, attachment completeness, conflict-of-interest checks, and explainable recommendation writing.

**Suggested assertions:** Finds missing or invalid attachments, calculates eligible budget totals, applies scoring rubric consistently, cites disqualifying criteria, and separates reviewer notes from final rationale.

### 9. Automotive Service Diagnostic Flow

**Journey:** Diagnose a vehicle issue from customer symptoms, scan codes, service history, warranty status, technical service bulletins, and technician inspection results; create an estimate and repair plan.

**Hard-to-test mechanics:** Hierarchical diagnostic logic, parts/labor catalog lookup, warranty eligibility, conflicting symptom interpretation, and dependency ordering for recommended repairs.

**Suggested assertions:** Prioritizes likely causes, does not recommend parts without supporting evidence, applies warranty coverage correctly, calculates estimate totals, and records declined optional work separately.

### 10. Data Warehouse Migration Cutover

**Journey:** Plan and execute a warehouse migration cutover by validating schema mappings, backfill status, dashboard dependencies, data quality checks, access grants, and rollback criteria.

**Hard-to-test mechanics:** Schema diffing, dependency graph traversal, asynchronous job monitoring, data quality thresholding, permission propagation, and go/no-go decision support.

**Suggested assertions:** Blocks cutover on failed critical checks, confirms row counts and freshness, identifies broken downstream assets, verifies access parity, and produces rollback-ready runbook status.
