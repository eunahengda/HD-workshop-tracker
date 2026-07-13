# FINAL_GAP_ANALYSIS.md
## Vehicle Passport Malaysia (VPM)

**Review role:** CTO, Product Architect, Senior Engineer  
**Review date:** June 2026  
**Documents reviewed:**

- `vehicle-passport-malaysia-prd (1).md` used as the PRD because `PRD.md` is missing.
- `UI-WIREFRAME.md`
- `DATABASE.md`
- `FEATURES.md`
- `SYSTEM_ARCHITECTURE.md`
- `API_DESIGN.md`
- `DEVELOPMENT_ROADMAP.md`

---

## 1. Executive CTO Verdict

VPM is conceptually strong and commercially coherent, but it is not yet ready for development as-is. The product documents describe the right trust platform, but several critical trust, consent, billing, verification, moderation, and operational mechanics are either missing from the database, only partially represented in the API, or not reflected in the UI flows.

The most important architectural conclusion is this:

> VPM cannot be treated as a simple CRUD SaaS. It is a vehicle trust, evidence, consent, and entitlement platform.

Before engineering starts, the project needs a final alignment pass across database, API, UI, roadmap, and product scope. The current `SYSTEM_ARCHITECTURE.md`, `API_DESIGN.md`, and `DEVELOPMENT_ROADMAP.md` already identify many of the correct gaps, but `DATABASE.md`, `FEATURES.md`, and `UI-WIREFRAME.md` have not fully absorbed those decisions.

### Go / No-Go Recommendation

**Recommendation:** Conditional go after Phase 0 hardening.

Do not start feature development until the following are resolved:

1. Rename or create the expected `PRD.md`.
2. Remove accidental duplicate roadmap content from `API_DESIGN.md`.
3. Update `DATABASE.md` with missing trust, billing, consent, report-sharing, dispute, and queue tables.
4. Update `UI-WIREFRAME.md` with missing flows for consent, claims, payments, disputes, organization invitations, and admin moderation.
5. Freeze MVP scope around owner + workshop + report trust loop.
6. Define scoring, entitlement, masking, and report-generation rules before UI implementation.

---

## 2. Document Integrity Issues

| Issue | Severity | Finding | Required Action |
|---|---:|---|---|
| Missing expected PRD filename | High | The requested `PRD.md` does not exist. The PRD is currently named `vehicle-passport-malaysia-prd (1).md`. | Rename to `PRD.md` or add a canonical copy. |
| `API_DESIGN.md` contains roadmap content | High | `API_DESIGN.md` appears to include `*** Add File: DEVELOPMENT_ROADMAP.md` and a duplicated roadmap section after the API content. | Clean the file so it contains API design only. |
| Encoding artifacts in UI/PRD | Medium | Several documents show mojibake characters for arrows, bullets, and symbols. | Normalize documents to UTF-8 before development handoff. |
| Scope inconsistency | High | UI includes insurer, dealer, EV, inventory, invoices, and advanced dashboards as screens, while MVP scope says several are Version 2 or Version 3. | Label each UI screen as MVP, V2, V3, or Future. |
| Architecture decisions not propagated | High | `SYSTEM_ARCHITECTURE.md` and `API_DESIGN.md` add critical models not reflected in `DATABASE.md`. | Update database and feature docs to match. |

---

## 3. Missing Features

### Critical Before MVP

| Missing Feature | Why It Matters | Current Coverage | Recommendation |
|---|---|---|---|
| Vehicle claim verification | Prevents users from claiming vehicles they do not own. | Mentioned in architecture/API/roadmap, not in database core schema or UI flow. | Add full claim lifecycle: pending, proof requested, approved, rejected, duplicate review. |
| Consent/access grants | Required for PDPA-safe dealer, insurer, workshop, and document access. | Mentioned conceptually, not fully modeled in database/UI. | Add user-facing consent grants and revocation flows. |
| Ownership transfer workflow | Vehicle lifecycle depends on accurate ownership changes. | PRD mentions transfer, but flow and tables are incomplete. | Add transfer request, accept/reject, previous-owner access rules, dispute handling. |
| Record dispute and moderation | Trust breaks if incorrect records cannot be challenged. | PRD says records cannot be deleted, only disputed; database has limited inline dispute fields. | Add central `record_disputes` model and admin resolution UI. |
| Report revocation and share lifecycle | Shared reports need expiry, revocation, and recipient audit. | `passport_reports` has public token and expiry only. | Add `report_shares` with token hash, expiry, revoked status, recipient, view log. |
| Payment checkout and reconciliation | Pay-per-report and subscriptions cannot safely launch without it. | Plans/subscriptions exist; payment state is too thin. | Add checkout sessions, payments, payment events, refund handling, reconciliation. |
| Credit ledger | Report credits must be auditable and reversible. | `subscriptions.report_credits_remaining` is not enough. | Add `credit_transactions`; consume credits atomically and idempotently. |
| Organization invitations | Workshops/dealers/insurers need staff onboarding. | Organization members exist, invitation workflow is missing. | Add invitation, acceptance, expiry, role assignment, resend, revoke. |
| Admin recovery operations | Trust product needs human intervention. | Admin screens are high level. | Add claim review, duplicate vehicle merge, dispute resolution, report revocation, account lockout, org verification. |
| Public lookup abuse controls | Plate lookup can leak vehicle existence and enable enumeration. | Mentioned in architecture/API, not in UI/product acceptance. | Add throttling, CAPTCHA/risk scoring, coarse responses, monitoring. |
| Notification opt-out and template management | PDPA and WhatsApp compliance require consent and opt-out. | Basic preferences exist. | Add per-channel/per-purpose preferences, template approval, delivery logs, unsubscribe flows. |
| Data subject request workflow | PDPA export/deactivation/anonymisation cannot be manual forever. | API mentions data export/deactivate, database lacks operational queue. | Add `data_subject_requests` and admin workflow. |

### Important After MVP

| Missing Feature | Recommendation |
|---|---|
| Workshop invoice payment collection | Move to V2 unless workshop monetisation requires it in MVP. |
| Inventory stock movement audit | Add `inventory_movements`; current stock quantity alone is insufficient. |
| Campaign builder | Required before WhatsApp reminder campaigns scale. |
| Dealer batch checks | Model as async jobs with quota controls. |
| OCR lifecycle | Add OCR jobs, review state, and confidence flags before auto-creating records. |
| API client management | Required before partner/open API launch. |
| Fleet module | Keep V3/Future unless enterprise is a launch priority. |

---

## 4. Missing Database Tables

`DATABASE.md` is a solid first schema, but it is missing several core trust-platform tables.

### Must Add Before MVP

| Table | Purpose |
|---|---|
| `vehicle_claims` | Tracks vehicle claim requests before granting ownership or watcher access. |
| `ownership_transfers` | Handles transfer request, acceptance, rejection, expiry, and audit. |
| `vehicle_access_grants` | Consent-based access for workshops, dealers, insurers, buyers, and temporary viewers. |
| `record_disputes` | Central dispute model for service, repair, insurance, road tax, loan, ownership, and document records. |
| `report_shares` | Separates immutable report snapshot from revocable share links. |
| `report_view_events` | Logs public/shared report access for audit and abuse detection. |
| `report_generation_jobs` | Supports async report and PDF generation. |
| `payments` | Stores payment intent/checkout/payment status. |
| `payment_events` | Stores signed webhook events for idempotency and reconciliation. |
| `credit_transactions` | Ledger for report credit grants, usage, refunds, expiry, and adjustments. |
| `subscription_events` | Billing lifecycle history separate from current subscription state. |
| `organization_invitations` | Staff invitation and acceptance workflow. |
| `notification_templates` | Versioned SMS, email, and WhatsApp templates. |
| `notification_preferences` | Normalized per-user/per-channel/per-purpose preferences. |
| `document_access_grants` | Time-limited file sharing independent of vehicle access. |
| `data_subject_requests` | PDPA export, deactivation, deletion, and anonymisation workflow. |
| `rate_limit_events` or `abuse_events` | Public plate-check/report anti-enumeration tracking. |

### Add In V2

| Table | Purpose |
|---|---|
| `reminder_rules` | Configurable time/mileage/custom reminder rules. |
| `campaigns` | Workshop reminder campaigns. |
| `campaign_recipients` | Campaign recipient state, opt-out, delivery, conversion. |
| `inventory_movements` | Stock-in, stock-out, adjustment, return, audit trail. |
| `invoice_items` | Proper invoice lines independent of job card items. |
| `dealer_batch_checks` | Bulk plate-check jobs and quotas. |
| `ocr_jobs` | OCR processing queue, status, confidence, review. |
| `recall_notices` | Manufacturer recall notices for EV and non-EV vehicles. |
| `software_update_logs` | EV OTA update history. |

### Add In V3

| Table | Purpose |
|---|---|
| `api_clients` | Partner app registration. |
| `api_keys` | Scoped machine credentials. |
| `oauth_tokens` | OAuth token tracking if not delegated entirely to auth provider. |
| `api_usage_events` | API metering, quotas, billing, anomaly detection. |
| `webhook_subscriptions` | Partner webhook delivery configuration. |
| `webhook_delivery_events` | Delivery attempts, retries, failures. |
| `fleet_accounts` | Corporate fleet tenant. |
| `fleet_members` | Fleet user roles. |
| `telematics_devices` | OBD2 or connected-car device registrations. |
| `telematics_events` | Odometer, diagnostic, battery, and telemetry events. |

---

## 5. Missing API Endpoints

`API_DESIGN.md` is directionally strong. The gap is less about endpoint names and more about the missing state machines, request/response contracts, and backend-owned business workflows.

### Must Define Before MVP

| API Area | Missing or Underdefined Endpoints |
|---|---|
| Vehicle claims | Claim create, proof upload, status, cancel, admin approve/reject, duplicate resolution. |
| Ownership transfer | Start transfer, accept, reject, expire, dispute, admin override. |
| Consent grants | Grant access, list grants, revoke grant, verify grant scope, audit grant usage. |
| Document sharing | Create download URL, create document grant, revoke grant, view grant access logs. |
| Report jobs | Request generation, get job status, retry failed job, cancel job, release credit on failure. |
| Report sharing | Create share, revoke share, extend expiry, view access logs. |
| Payments | Create checkout, payment status, webhook, refund, reconciliation, payment failure recovery. |
| Credits | Credit ledger, consume credit, refund credit, expire credit, admin adjust credit. |
| Organization invitations | Invite member, accept invite, revoke invite, resend invite. |
| Record disputes | Create dispute, upload evidence, admin resolve, mark record disputed/revoked/superseded. |
| Public lookup | Plate teaser with abuse/rate-limit response codes and minimum data contract. |
| Admin operations | Duplicate vehicle merge, report revoke, user/org suspend, unlock, audit search. |
| PDPA | Data export request, download export, deactivate, anonymisation status. |

### API Contract Gaps

- No full request/response payload schemas.
- No state machine definitions for claims, disputes, payments, reports, reminders, and job cards.
- No idempotency behavior examples.
- No error code catalog beyond a generic shape.
- No rate-limit response standard.
- No audit event taxonomy tied to endpoints.
- No plan entitlement matrix per endpoint.
- No field-level PII masking standard.
- No webhook signature verification details per provider.

---

## 6. Missing User Flows

`UI-WIREFRAME.md` is visually comprehensive, but it focuses on the happy path. A trust product needs recovery, consent, and exception paths.

### Owner Flows Missing

- Claim vehicle ownership with pending verification.
- Upload vehicle claim proof document.
- Claim rejected or duplicate claim resolution.
- Transfer vehicle to a new owner.
- Accept or reject incoming ownership transfer.
- Grant temporary access to dealer, buyer, workshop, or insurer.
- Revoke access grant.
- Dispute a workshop-created service record.
- View dispute status and admin resolution.
- Generate report, wait for async generation, handle failed generation.
- Revoke a shared report link.
- Request PDPA data export.
- Deactivate account and understand data retention.
- Manage notification opt-outs by channel and purpose.

### Workshop Flows Missing

- Workshop onboarding and verification.
- Staff invitation and role assignment.
- Vehicle lookup requiring owner consent for deeper history.
- Owner approval when workshop wants to publish a verified record.
- Correct/supersede a published service record.
- Resolve job-card-to-invoice mismatch.
- Customer opt-out from workshop reminders.
- Inventory adjustment/audit flow.
- Failed owner notification handling.

### Dealer Flows Missing

- Dealer organization verification.
- Report purchase checkout and payment failure.
- Credit balance and credit consumption history.
- Consent-based access vs purchased snapshot distinction.
- Batch check upload, processing, partial failure, result export.
- Verified listing badge expiry/revocation.
- Buyer-facing report disclaimer.

### Insurer Flows Missing

- Insurer onboarding and organization verification.
- Portfolio import.
- Consent request to vehicle owner.
- View risk profile from consented snapshot only.
- Renewal campaign opt-out handling.
- Claims-data dispute or correction process.

### Admin Flows Missing

- Vehicle claim review queue.
- Duplicate vehicle/plate/VIN resolution.
- Record dispute moderation.
- Report share revocation.
- Organization verification checklist.
- Payment reconciliation and manual credit adjustment.
- Abuse/rate-limit monitoring.
- Data subject request handling.
- Integration incident dashboard.
- Audit log investigation workflow.

---

## 7. Security Issues

### Critical

| Issue | Risk | Required Fix |
|---|---|---|
| Vehicle claiming is too weak if implemented as direct ownership creation | Fraudulent ownership claims and unauthorized access. | Add claim verification and admin/manual fallback. |
| Public report token on `passport_reports` is insufficient | Token leakage gives broad access until expiry. | Add `report_shares`, token hashing, revocation, recipient metadata, access logs, and rate limits. |
| Public plate lookup can leak vehicle existence | Enables scraping and targeted social engineering. | Return coarse teaser only; add rate limits, bot detection, monitoring. |
| Dealer/insurer raw access risk | Violates PDPA if they can access source records without explicit consent. | Use snapshots or scoped access grants only. |
| Supabase Storage policies are not fully specified | Private documents may leak even if table RLS is correct. | Define storage RLS and short-lived signed URL lifecycle. |
| Admin role stored on profile without assignment controls | Privilege escalation risk. | Add admin assignment workflow, MFA, audit, least privilege roles. |
| Payment webhook controls underdefined | Fake or replayed payment events may grant reports/credits. | Signature verification, idempotency, replay protection, reconciliation. |
| IC encryption is underspecified | Sensitive identity data may be overexposed internally. | Define key custody, rotation, decrypt permissions, and audit. |

### High

- RLS helper functions use `security definer`; ownership, grants, and `search_path` must be locked down.
- Audit log should be append-only with no normal update/delete path.
- API must enforce workflow permissions in addition to RLS.
- Public report PDFs must mask VIN, IC, policy number, loan account, owner identity, and raw documents.
- Workshop access to vehicle history must be consented or limited to coarse summary.
- Notification opt-out must be honored across SMS, WhatsApp, and email.
- File uploads need MIME validation, virus scanning strategy, size limits, and private buckets.
- Session security needs MFA for admins and possibly organization owners.

---

## 8. Scalability Concerns

| Concern | Why It Matters | Recommendation |
|---|---|---|
| Report generation target under 5 seconds | PDF rendering and summary computation will be slow under load. | Make report generation async from MVP. |
| Reminder sending at scale | Renewal/service reminders can spike daily. | Use queues, retries, delivery logs, and rate-limited workers. |
| Public report traffic | Shared reports may be viewed by buyers/dealers/public. | Cache report snapshots and PDFs until expiry/revocation. |
| Public plate lookup abuse | Enumeration load and privacy risk. | Add edge rate limits, monitoring, and coarse cache. |
| Dashboard queries on timeline tables | Vehicle and workshop dashboards will become heavy. | Use summary tables or materialized views. |
| Analytics on OLTP | Workshop and platform analytics will slow production DB. | Add event pipeline/BI layer before scale. |
| `jsonb` overuse risk | Flexible data can become hard to query. | Keep snapshots in JSON, but operational data normalized. |
| Event table growth | Audit, integration, notification, API usage will grow quickly. | Partition high-volume event tables by time. |
| Multi-tenant organization access | Workshops/dealers/insurers need strict tenant boundaries. | Standardize organization-scoped access checks and tests. |
| Large document uploads | Backend proxy uploads will bottleneck. | Use signed direct-to-storage uploads. |

---

## 9. Business Logic Gaps

### Scoring

The documents mention completeness score, confidence score, service regularity, and flags, but the algorithms are not defined.

Must define before frontend build:

- Completeness score formula.
- Data confidence score formula.
- Service regularity rating.
- Accident/flood/loan/insurance/road-tax flag derivation.
- Verified vs owner-declared weighting.
- Dispute/revoked-record penalty.
- EV battery health thresholds and warranty display logic.

### Entitlements

Plan and credit rules are not precise enough.

Must define:

- Owner Basic annual report allowance reset logic.
- Owner Plus unlimited report abuse limits.
- Workshop/dealer monthly credit reset.
- Purchased report validity period.
- Failed report generation refund/retry rules.
- Report access after subscription cancellation.
- Storage quota enforcement.
- Staff seat limits.
- SMS/WhatsApp message quota enforcement.

### Record Trust

Must define:

- Who can create each record type.
- Which records are editable and for how long.
- When a record becomes immutable.
- How amendments are handled.
- How a disputed record appears in reports.
- How admin verification changes source trust.
- Whether owner approval is needed for workshop-published records.

### Ownership

Must define:

- Plate normalization and duplicate handling.
- VIN/chassis uniqueness rules when VIN is missing.
- Current owner verification levels.
- Previous owner access after transfer.
- Watcher permissions.
- Co-owner permissions.
- Deceased owner/inheritance support as a future edge case.

### Report Snapshot

Must define:

- Exact report snapshot schema.
- Field masking rules.
- Report disclaimer.
- Report expiration semantics.
- Revocation behavior.
- PDF regeneration behavior.
- Whether old reports update when source records change.

### Payments

Must define:

- Provider choice for Malaysia launch.
- Checkout state model.
- Webhook idempotency.
- Failed/expired payment handling.
- Refund policy.
- Credit purchase packs.
- Subscription renewal failure grace period.
- SST/tax treatment for subscriptions and reports.

---

## 10. Cross-Document Mismatch Matrix

| Area | PRD | UI | Database | Features | API | Roadmap | Gap |
|---|---|---|---|---|---|---|---|
| Vehicle claim verification | Light | Missing | Missing | Partial | Present | Present | DB/UI need update. |
| Consent/access grants | Mentioned | Missing | Missing | Partial | Present | Present | Core compliance gap. |
| Report shares | Basic shared link | Public report shown | Token on report only | Present | Present | Present | Need separate table and UI revocation. |
| Payments | Monetisation described | Pricing shown | Too thin | Foundation | Present | Present | DB state model missing. |
| Credit ledger | Plans mention credits | Pricing shown | Missing | Foundation | Present | Present | Must add before selling reports. |
| Disputes | Mentioned | Missing | Inline service dispute only | Present | Present | Present | Need central model and admin flow. |
| Organization invitations | Not detailed | Missing | Missing | Partial | Missing/partial | Present | Needed for workshop MVP. |
| Document access grants | Mentioned | Missing | Missing | V2 | Present | Present | Needed for secure sharing. |
| Dealer module | Phase 2 | Full screens present | Partial | V2 | Present | V2 | UI should label as V2. |
| Insurer module | Phase 3 | Full screen present | No portfolio tables | V3 | V3 | V3 | UI should label as V3. |
| EV module | Phase 2 | Full screens present | Partial | V2 | Present | V2 | MVP/V2 boundary unclear in UI. |
| Inventory/invoices | V2 for full value | Workshop screens present | Partial | V2 | Present | V2 | MVP scope needs clarity. |
| Data subject requests | PDPA described | Missing | Missing | V3 compliance | Present | Present | Move operational foundation earlier. |
| Rate limiting | Security concern | Missing | Missing | Security mention | Present | Launch checklist | Add operational model. |

---

## 11. MVP Scope Correction

### Recommended MVP

The MVP should include only what is needed to prove the trust loop:

1. Owner onboarding, PDPA consent, and profile.
2. Vehicle creation through claim workflow.
3. Vehicle passport core records: service, repair, insurance, road tax, loan.
4. Document vault with private storage and signed URLs.
5. Workshop onboarding, vehicle lookup, job cards, verified service publishing.
6. Reminders for service, insurance, and road tax.
7. Passport report async generation, snapshot, PDF, share link, revocation.
8. Pay-per-report or report credits with payment ledger.
9. Admin claim/dispute/org verification.
10. RLS, audit logs, rate limits, and public data minimization.

### Move Out Of MVP

- Native mobile apps.
- Full dealer dashboard.
- Full insurer dashboard.
- EV dashboard unless EV owners are part of pilot.
- Inventory and invoices unless workshop Pro is part of launch.
- OCR.
- Partner Open API.
- Bank/PIAM/Puspakom live integrations.
- Fleet module.
- AI and telematics.

---

## 12. Required Pre-Development Decisions

### Product

- Is the launch wedge owner-first, workshop-first, or balanced owner/workshop?
- Is pay-per-report in MVP, or only owner-generated shared reports?
- Are dealer users allowed in MVP or held until V2?
- Will workshop-published service records require owner approval?
- What is the minimum verification level for a "trusted" report?

### Technical

- Backend architecture: NestJS API vs Supabase Edge Functions for workflow endpoints.
- Queue technology for report generation, notifications, webhooks, OCR later.
- Payment provider for Malaysia launch.
- SMS/WhatsApp/email providers.
- PDF rendering approach.
- Key management approach for IC/passport encryption.
- Rate-limiting layer.

### Compliance

- PDPA consent text.
- Data Processing Notice.
- Consent withdrawal behavior.
- Data retention period.
- Report disclaimer.
- Dealer/insurer data access terms.
- Public lookup privacy policy.

---

## 13. Prioritized Remediation Plan

### P0 - Blockers Before Build

1. Fix document naming and remove duplicated roadmap content from `API_DESIGN.md`.
2. Freeze MVP/V2/V3 scope across all documents.
3. Update database schema with P0 tables:
   - `vehicle_claims`
   - `ownership_transfers`
   - `vehicle_access_grants`
   - `record_disputes`
   - `report_shares`
   - `report_generation_jobs`
   - `payments`
   - `payment_events`
   - `credit_transactions`
   - `organization_invitations`
   - `document_access_grants`
   - `notification_templates`
   - `data_subject_requests`
4. Define scoring and flag algorithms.
5. Define report snapshot schema and masking rules.
6. Define consent, claim, dispute, payment, and report state machines.
7. Update UI wireframes with missing non-happy-path flows.

### P1 - Needed During MVP Build

1. RLS policy matrix and test plan.
2. Storage RLS and signed URL policy.
3. Audit event taxonomy.
4. Public lookup rate-limit policy.
5. Admin moderation screens.
6. Payment reconciliation workflow.
7. Backup/restore and incident response plan.
8. Observability and alerting plan.

### P2 - Version 2 Preparation

1. Dealer batch-check model.
2. Inventory movement audit.
3. Invoice item model.
4. Campaign builder.
5. WhatsApp template approval workflow.
6. OCR job lifecycle.
7. EV recall/OTA tables.

### P3 - Version 3 Preparation

1. API client and OAuth model.
2. API usage metering.
3. Partner sandbox.
4. Insurer portfolio import.
5. Bank integration workflow.
6. Fleet account model.
7. Telematics ingestion model.

---

## 14. Final Validation Checklist

Before development starts, the system is validated only when all answers are "yes":

- Is there a canonical `PRD.md`?
- Are all documents free from accidental duplicated content and encoding artifacts?
- Is every MVP UI screen tied to a database model and API endpoint?
- Does every sensitive workflow go through backend API logic?
- Can a vehicle not be claimed without an auditable claim path?
- Can dealer/insurer/workshop access be granted and revoked?
- Can reports be generated asynchronously, shared, expired, and revoked?
- Can credits and payments be reconciled without double-spend?
- Can incorrect records be disputed and resolved?
- Can admins recover from duplicate vehicle, bad claim, bad record, and leaked report scenarios?
- Are public reports snapshots only, with no raw PII or raw documents?
- Are IC/passport values encrypted with a defined key-management approach?
- Are document downloads signed, short-lived, and audited?
- Are public plate checks rate-limited and minimized?
- Are score algorithms documented and testable?
- Are PDPA export, deactivation, consent withdrawal, and retention workflows defined?

---

## 15. Final CTO Recommendation

The product is viable, and the architecture direction is mostly correct. The main risk is not market logic or UI ambition; it is launching a trust product without the evidence, consent, payment, and moderation machinery that makes the trust defensible.

Treat Phase 0 as a real architecture and product hardening phase, not paperwork. Once the P0 items above are folded back into `DATABASE.md`, `API_DESIGN.md`, `UI-WIREFRAME.md`, and `DEVELOPMENT_ROADMAP.md`, VPM will be in a much stronger position to begin engineering with confidence.
