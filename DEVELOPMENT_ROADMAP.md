# DEVELOPMENT_ROADMAP.md
## Vehicle Passport Malaysia (VPM)

**Version:** 1.0  
**Role:** CTO-reviewed development roadmap  
**Scope:** Sequenced product, platform, security, and engineering plan  
**Code generation:** Not included

---

## 1. Roadmap Principles

- Build the trust foundation before growth features.
- Keep MVP narrow but production-grade in security, consent, audit, and billing.
- Push async workloads into workers from the start.
- Use service-layer APIs for business workflows.
- Build admin recovery paths early.
- Avoid native apps, AI, telematics, and broad partner APIs until the core passport loop works.

---

## 2. CTO Gap Backlog

### Highest Priority Gaps

| Gap | Risk | Roadmap Action |
|---|---|---|
| Consent/access grants missing | Dealers/workshops/insurers may access data unlawfully or too broadly. | Add consent and access-grant model in Foundation. |
| Payment and credit ledger missing | Cannot safely sell reports or plans. | Add checkout, webhooks, payments, and credit transactions before MVP launch. |
| Report generation not async | 5-second target and high load will fail. | Add report job queue and worker in MVP. |
| Vehicle claim workflow missing | Anyone could claim a vehicle too easily. | Add claims and admin review workflow. |
| Public lookup controls missing | Plate enumeration and data leakage risk. | Add teaser minimization, rate limits, and abuse controls. |
| Dispute/moderation missing | Trust breaks when incorrect records cannot be challenged. | Add record disputes and admin resolution. |
| Storage RLS and signed URL lifecycle not detailed | Document leakage risk. | Add direct upload and document grants. |
| Reminder/template logic underdefined | Messaging becomes brittle and non-compliant. | Add templates, preferences, and opt-out. |
| Score algorithms undefined | UI/report metrics will be inconsistent. | Define completeness and confidence scoring before frontend build. |

---

## 3. Phase 0: Architecture & Foundation

**Target duration:** 4-6 weeks  
**Goal:** Turn product docs into buildable technical contracts.

### Product Decisions

- Finalize MVP scope.
- Decide Supabase plus backend API architecture.
- Decide payment provider for Malaysia launch.
- Decide SMS/WhatsApp/email providers.
- Decide whether JPJ/MyEG is live in MVP or manual fallback only.
- Define support and admin operating model.

### Technical Design

- Create final ERD update with missing tables.
- Create API contract from `API_DESIGN.md`.
- Define RLS policy matrix.
- Define storage bucket policies.
- Define score algorithms:
  - Completeness score.
  - Data confidence score.
  - Service regularity rating.
  - Accident/loan/insurance/road tax flags.
- Define report snapshot format.
- Define report PDF layout requirements.
- Define audit event taxonomy.
- Define background job architecture.

### Compliance

- Draft PDPA consent text and data processing notice.
- Define data export and deactivation process.
- Define retention and anonymisation rules.
- Define public report disclaimer.
- Define dealer/insurer access terms.

### Deliverables

- Updated database spec.
- Final API specification.
- Architecture decision records.
- Security/RLS matrix.
- MVP acceptance criteria.
- Engineering estimate.

---

## 4. Phase 1: MVP Build

**Target duration:** 12-16 weeks  
**Goal:** Launch the owner/workshop/report trust loop.

### Sprint 1: Project Setup & Core Platform

- Repository setup.
- Environment setup.
- Supabase project setup.
- Auth configuration.
- Database migrations.
- Storage buckets.
- Backend API shell.
- Observability setup.
- CI/CD pipeline.

### Sprint 2: Identity, Organizations & Access

- Profile onboarding.
- Phone OTP login.
- PDPA consent capture.
- Organization model.
- Workshop organization creation.
- Organization member roles.
- Staff invitations.
- Admin role management.
- RLS baseline.

### Sprint 3: Vehicle Registry & Claims

- Add vehicle flow.
- Plate normalization.
- Vehicle claim creation.
- Claim proof document upload.
- Current owner/co-owner/watcher access.
- Admin claim approval/rejection.
- Vehicle dashboard summary.
- Ownership transfer foundation.

### Sprint 4: Passport Records

- Service records.
- Repair records.
- Insurance records.
- Road tax records.
- Loan records.
- Record attachments.
- Record dispute flow.
- Timeline API.
- Completeness score.
- Basic confidence score.

### Sprint 5: Document Vault

- Signed upload URLs.
- Document metadata.
- Signed download URLs.
- Vehicle document list.
- Document record attachments.
- Storage RLS.
- Basic document access grants.

### Sprint 6: Reminders & Notifications

- Reminder generation rules.
- Road tax reminders.
- Insurance reminders.
- Service reminders.
- Notification preferences.
- SMS/email send worker.
- Notification event log.
- Reminder list screen.

### Sprint 7: Workshop MVP

- Workshop dashboard.
- Customer CRM list and profile.
- Vehicle lookup with limited summary.
- Job card creation.
- Job card status transitions.
- Mechanic assignment.
- Complete job card.
- Publish verified service record.
- Notify owner.
- Basic job/revenue metrics.

### Sprint 8: Reports, Payments & Credits

- Report entitlement checks.
- Owner report generation.
- Report generation job.
- Report snapshot builder.
- PDF renderer.
- Shared report token and expiry.
- Public report page.
- Pay-per-report checkout.
- Payment webhook handler.
- Credit transaction ledger.

### Sprint 9: Admin & Operations

- Admin dashboard.
- User management.
- Workshop verification.
- Vehicle claim review.
- Dispute review.
- Integration event view.
- Audit log view.
- Support tooling for duplicate/incorrect records.

### Sprint 10: Hardening & Launch

- Security review.
- RLS test suite.
- Rate-limit public endpoints.
- Load test report generation.
- Backup/restore verification.
- Payment reconciliation test.
- End-to-end QA.
- Pilot workshop onboarding.
- Production launch checklist.

### MVP Exit Criteria

- 50 pilot workshops can create job cards and publish verified service records.
- 2,000 vehicles can be registered without data leakage.
- Public report sharing works through expiring snapshots.
- Pay-per-report or report credits cannot be double-spent.
- No public endpoint exposes PII.
- Report generation completes asynchronously and reliably.
- Admins can resolve claims and disputes.
- Reminders send and record delivery events.

---

## 5. Phase 2: Growth & Monetisation

**Target duration:** 4-6 months after MVP  
**Goal:** Expand paid value for owners, workshops, and dealers.

### Owner Plus

- Multi-vehicle support up to plan limit.
- Expanded storage quota.
- Unlimited reports by entitlement.
- Enhanced document vault.
- EV module.
- Push notifications if mobile apps are active.

### Dealer Module

- Dealer onboarding.
- Dealer dashboard.
- Authenticated vehicle checks.
- Credit usage dashboard.
- Bulk checks.
- Dealer report purchase history.
- VPM Verified listing badges.
- Listing integration pilot.

### Workshop Professional

- Inventory management.
- Inventory movements.
- Reorder alerts.
- Invoicing.
- Invoice PDF export.
- WhatsApp invoice sharing.
- Full analytics.
- Multi-staff permissions.

### Reminder Campaigns

- Reminder rules.
- Campaign builder.
- WhatsApp Business templates.
- SMS/WhatsApp campaign sending.
- Campaign performance analytics.
- Opt-out management.

### Document Intelligence

- OCR job pipeline.
- Extract document expiry dates.
- Suggest record creation from documents.
- Document access links.

### Integrations

- MyEG road tax live pull.
- Puspakom pilot feed.
- Payment credit-pack automation.
- Marketplace badge pilot.

### Version 2 Exit Criteria

- Dealer users can buy and consume report credits safely.
- Workshop Pro customers can manage job-card-to-invoice flow.
- EV owners can track SoH and charging history.
- WhatsApp campaigns are compliant and measurable.
- OCR improves document workflow without corrupting source records.

---

## 6. Phase 3: Partner Intelligence Platform

**Target duration:** 6-12 months after Version 2  
**Goal:** Turn VPM from SaaS app into a vehicle data platform.

### Insurance Partner Module

- Insurer organization onboarding.
- Portfolio dashboard.
- Vehicle risk profiles.
- Renewal management.
- Claims summary.
- Consent-based vehicle access.
- Enterprise reporting.

### Bank & Loan Integrations

- Bank API pilot.
- Loan balance refresh.
- Settlement verification.
- Early settlement estimate.
- Automated Loan Clear badge.

### Partner APIs

- OAuth/API client model.
- API key management.
- Usage metering.
- Partner sandbox.
- Vehicle teaser API.
- Report API.
- Workshop POS push API.
- Webhook subscriptions.

### Advanced Analytics

- Workshop forecasting.
- Customer retention cohorts.
- Dealer trade-in assessments.
- Risk scoring.
- Data warehouse or BI layer.

### Fleet Management

- Fleet accounts.
- Fleet vehicle roster.
- Fleet service compliance.
- Fleet document expiry dashboard.
- Fleet reports.

### Version 3 Exit Criteria

- Insurer pilot can underwrite from consented risk profiles.
- Partner API is metered, scoped, and audited.
- Bank pilot can update loan status without exposing sensitive account details.
- Fleet accounts can manage vehicles at organization scale.

---

## 7. Future Roadmap

### Marketplace

- VPM-hosted verified used-car listings.
- Buyer lead capture.
- Resale value calculator.
- Trade-in pricing intelligence.
- Marketplace syndication.

### Telematics & AI

- OBD2 device onboarding.
- Diagnostic event ingestion.
- Odometer rollback detection.
- Predictive maintenance.
- EV battery degradation prediction.
- AI receipt parsing.

### Government-Grade Verification

- Deeper JPJ partnership.
- Formal Puspakom verification.
- Modification approval verification.
- Legal-grade history certificate.

### Enterprise Platform

- Data warehouse.
- Partner developer portal.
- Enterprise SSO.
- SCIM provisioning.
- Multi-region architecture.
- Data clean room.

---

## 8. Team Plan

### MVP Core Team

| Role | Count | Notes |
|---|---:|---|
| CTO/Tech Lead | 1 | Architecture, security, vendor decisions. |
| Full-stack engineers | 2-3 | Frontend, backend APIs, Supabase. |
| Backend/platform engineer | 1 | Workers, integrations, payments, RLS. |
| Product designer | 1 | UX and responsive web implementation support. |
| QA engineer | 1 | Manual and automated test coverage. |
| Product manager | 1 | Scope control and pilot coordination. |
| Field/onboarding specialist | 1-2 | Workshop pilot support. |

### Version 2 Additions

- Mobile engineer or React Native specialist.
- Data/analytics engineer.
- Integration engineer.
- Customer success lead.

### Version 3 Additions

- Security/compliance lead.
- Partner solutions engineer.
- Data platform engineer.
- Enterprise sales/support function.

---

## 9. Engineering Milestones

| Milestone | Target | Outcome |
|---|---|---|
| M0 | Week 0 | Architecture docs approved. |
| M1 | Week 2 | Database/API/RLS contracts finalized. |
| M2 | Week 4 | Auth, profiles, organizations, base UI shell ready. |
| M3 | Week 7 | Vehicle registry and claims working. |
| M4 | Week 10 | Passport records and documents working. |
| M5 | Week 12 | Workshop job-card flow working. |
| M6 | Week 14 | Reports, payments, and sharing working. |
| M7 | Week 16 | Admin, security, QA, and pilot launch ready. |

---

## 10. Non-Negotiable Launch Checklist

- RLS tested for owner, workshop, dealer, insurer, admin, and anonymous paths.
- Public report cannot reveal raw PII.
- Public plate check is rate-limited and minimized.
- Payment webhooks are signature-checked and idempotent.
- Credits cannot be double-spent.
- Report generation is asynchronous and retryable.
- Document downloads use signed URLs.
- Admin can revoke report shares.
- Admin can resolve disputes.
- Audit log captures sensitive actions.
- Backups are enabled and restore has been tested.
- Error monitoring and uptime monitoring are active.
- PDPA consent text is approved.
- Terms and report disclaimers are visible.

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Scope creep before MVP | High | High | Freeze MVP around owner/workshop/report loop. |
| JPJ/MyEG delay | Medium | High | Manual fallback and clear source labels. |
| Data trust disputes | High | High | Record disputes, audit logs, source labels, admin moderation. |
| Public data leakage | Medium | Critical | Snapshot-only public report, rate limits, PII masking. |
| Payment reconciliation errors | Medium | High | Payment events, idempotency, credit ledger. |
| Workshop adoption friction | High | High | Keep job-card flow simple, add training, support WhatsApp notification early. |
| Report generation load | Medium | Medium | Async workers, caching, materialized summaries. |
| Compliance gaps | Medium | Critical | PDPA counsel review before production launch. |

---

## 12. Roadmap Recommendation

The recommended launch strategy is to build MVP as a production-grade trust foundation, not as a disposable prototype. Keep the feature count controlled, but include consent, claims, payments, reports, audit, storage security, and admin operations from the start. These are not "enterprise extras" for VPM; they are the core mechanics that make the vehicle passport credible.
---

## 13. P0 Completion Criteria

P0 is complete only when the following artifacts are aligned:

- `PRD.md` exists as the canonical PRD.
- `API_DESIGN.md` contains API design only and no duplicated roadmap body.
- `DATABASE.md` includes the required P0 schema alignment models.
- `FEATURES.md` marks P0 trust foundations as MVP requirements.
- `UI-WIREFRAME.md` includes missing MVP non-happy-path flows.
- `SYSTEM_ARCHITECTURE.md` remains the canonical technical architecture direction.
- `DOCUMENT_INDEX.md` records ownership, phase, and readiness status for every project document.

Development may start only after the detailed Phase 0 contracts are produced: final ERD, endpoint payloads, RLS matrix, storage policy, state machines, score algorithms, audit taxonomy, payment provider decision, and report snapshot schema.

