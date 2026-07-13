# DOCUMENT_INDEX.md
## Vehicle Passport Malaysia (VPM)

**Status:** P0 documentation alignment completed  
**Last updated:** June 2026  
**Purpose:** Canonical index for project documents and development readiness.

---

## 1. Canonical Documents

| Document | Status | Purpose | Phase Coverage |
|---|---|---|---|
| `PRD.md` | Canonical | Product requirements, market, users, features, monetisation, and P0 readiness addendum. | MVP, V2, V3, Future |
| `UI-WIREFRAME.md` | Updated | Visual sitemap, screen wireframes, responsive behavior, and P0 missing-flow addendum. | MVP, V2, V3 |
| `DATABASE.md` | Updated | Supabase/PostgreSQL data model, RLS intent, storage, and P0 schema alignment. | MVP, V2, V3 |
| `FEATURES.md` | Updated | Feature classification by release phase plus P0 MVP alignment. | MVP, V2, V3, Future |
| `SYSTEM_ARCHITECTURE.md` | Updated | CTO architecture, security, scalability, async workloads, and P0 alignment status. | MVP, V2, V3 |
| `API_DESIGN.md` | Updated | REST-first API design, endpoint surface, P0 API state machines, and security rules. | MVP, V2, V3 |
| `DEVELOPMENT_ROADMAP.md` | Updated | Build sequence, team plan, milestones, launch checklist, and P0 completion criteria. | Phase 0, MVP, V2, V3 |
| `FINAL_GAP_ANALYSIS.md` | Reference | Gap analysis that drove this P0 alignment pass. | Validation |

---

## 2. Deprecated / Source Documents

| Document | Status | Note |
|---|---|---|
| `vehicle-passport-malaysia-prd (1).md` | Superseded source | Original PRD source. `PRD.md` is now the canonical PRD. Keep for audit/history or archive later. |

---

## 3. P0 Alignment Summary

The project documents now consistently recognize these MVP-required trust foundations:

- Vehicle claim verification.
- Ownership transfer foundation.
- Consent and access grants.
- Record disputes and admin moderation.
- Async report generation jobs.
- Revocable report shares and view audit.
- Payments, payment events, and credit transaction ledger.
- Organization invitations.
- Document access grants.
- Notification templates and normalized preferences.
- Data subject request foundation.
- Public lookup abuse controls.

---

## 4. MVP Boundary

### MVP

Owner, workshop, report, document, reminder, payment, admin, security, and trust-foundation workflows.

### Version 2

Dealer module, EV dashboard, Workshop Professional, inventory, invoicing, WhatsApp campaigns, OCR, and marketplace badge pilots.

### Version 3

Insurer module, bank integrations, partner APIs, telematics, fleet management, and enterprise analytics.

---

## 5. Remaining Phase 0 Work Before Development

The documentation is aligned at the product-contract level, but development should not begin until these detailed implementation contracts are produced:

1. Final ERD with column-level definitions for all P0 tables.
2. API request/response schemas for every MVP endpoint.
3. RLS policy matrix and RLS test plan.
4. Storage bucket policy and signed URL lifecycle.
5. State-machine diagrams for claims, transfers, disputes, reports, payments, credits, invitations, and data requests.
6. Score algorithms for completeness, confidence, service regularity, and report flags.
7. Report snapshot schema, PDF layout contract, and PII masking rules.
8. Audit event taxonomy.
9. Payment provider decision and webhook verification specification.
10. Public lookup rate-limit and abuse-detection policy.

---

## 6. Development Readiness Status

**Current status:** Not yet development-ready.

The P0 documentation inconsistencies have been addressed, but the project still needs the detailed Phase 0 implementation contracts listed above before application development should start.
