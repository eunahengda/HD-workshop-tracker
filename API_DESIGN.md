# API_DESIGN.md
## Vehicle Passport Malaysia (VPM)

**Version:** 1.0  
**Role:** CTO-reviewed API design  
**Scope:** REST-first product API, public API, partner API, webhooks  
**Code generation:** Not included

---

## 1. API Design Principles

- REST-first for MVP; GraphQL is unnecessary until partner aggregation needs are proven.
- All mutating workflows go through backend APIs, not direct client writes to tables.
- Public APIs expose snapshots and teasers only.
- Partner APIs are separate from user APIs and use scoped OAuth/API keys.
- Every payment and integration callback is idempotent.
- API responses must avoid leaking raw PII.
- Every sensitive action writes an audit event.
- Long-running tasks return job IDs.

---

## 2. API Surface Areas

| Area | Audience | Purpose |
|---|---|---|
| Public API | Anonymous users | Landing page, pricing, public report, teaser lookup. |
| App API | Owners, workshops, dealers, insurers | Authenticated product workflows. |
| Admin API | Internal admins | Verification, moderation, support, integration monitoring. |
| Partner API | External partners | Future dealer, insurer, workshop POS, and listing integrations. |
| Webhook API | Providers | Payments, messaging, and external integration callbacks. |

---

## 3. Cross-Cutting Standards

### Authentication

- User APIs: Supabase JWT.
- Admin APIs: Supabase JWT plus admin role and optional MFA.
- Partner APIs: OAuth 2.0 client credentials or signed API keys.
- Webhooks: provider signature verification.

### Authorization

- Owner/co-owner/watcher permissions.
- Organization membership permissions.
- Admin permissions.
- Consent/access grants.
- Report purchase entitlements.
- Plan limits and subscription status.

### Idempotency

Required for:

- Payment checkout creation.
- Payment webhook handling.
- Report generation request.
- Credit consumption.
- Job-card completion.
- Notification sending.
- External integration imports.

Use an `Idempotency-Key` header for client-initiated workflows and provider event IDs for webhooks.

### Pagination

Use cursor pagination for timelines and lists:

```text
?limit=50&cursor=...
```

### Error Shape

```json
{
  "error": {
    "code": "vehicle_not_found",
    "message": "Vehicle not found or access denied.",
    "request_id": "req_123",
    "details": {}
  }
}
```

### Versioning

- MVP internal API: `/api/v1`
- Partner API: `/partner/v1`
- Webhooks: `/webhooks/{provider}`

---

## 4. Public API

### Pricing

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/public/plans` | List public plan names, prices, and limits. |

### Plate Teaser

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/public/plate-check` | Return limited teaser summary for unauthenticated lookup. |

Rules:

- Rate-limited by IP/device.
- Return no owner identity, VIN, IC, policy, loan account, document details, or exact private history.
- Response should be coarse: vehicle identity if public/known, total flag count, and whether a full report may exist.

### Public Report

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/public/reports/{share_token}` | Read valid shared report snapshot. |
| `GET` | `/api/v1/public/reports/{share_token}/pdf` | Return signed PDF URL if valid. |

Rules:

- Validate token, expiry, revocation, and rate limit.
- Return report snapshot only.
- Never return source table records.

---

## 5. Auth & Profile API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/me` | Current profile, roles, organizations, plan summary. |
| `PATCH` | `/api/v1/me` | Update profile fields. |
| `PATCH` | `/api/v1/me/preferences` | Update notification and locale preferences. |
| `POST` | `/api/v1/me/pdpa-consent` | Record consent version and timestamp. |
| `POST` | `/api/v1/me/data-export` | Request PDPA data export. |
| `POST` | `/api/v1/me/deactivate` | Request account deactivation. |

Missing from current docs:

- Consent versioning.
- Data export.
- Deactivation/anonymisation workflow.

---

## 6. Vehicle API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles` | List vehicles accessible to current user. |
| `POST` | `/api/v1/vehicles` | Create or start a vehicle claim. |
| `GET` | `/api/v1/vehicles/{vehicle_id}` | Vehicle overview. |
| `PATCH` | `/api/v1/vehicles/{vehicle_id}` | Update owner-editable fields. |
| `GET` | `/api/v1/vehicles/{vehicle_id}/timeline` | Unified timeline. |
| `GET` | `/api/v1/vehicles/{vehicle_id}/summary` | Dashboard summary cards. |
| `GET` | `/api/v1/vehicles/{vehicle_id}/completeness` | Completeness score and missing fields. |

### Vehicle Claims

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/vehicle-claims` | Claim vehicle ownership/watch access. |
| `GET` | `/api/v1/vehicle-claims` | List current user's claims. |
| `GET` | `/api/v1/vehicle-claims/{claim_id}` | Claim status. |
| `POST` | `/api/v1/vehicle-claims/{claim_id}/documents` | Attach proof documents. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/transfer` | Start ownership transfer. |
| `POST` | `/api/v1/ownership-transfers/{transfer_id}/accept` | Accept transfer. |
| `POST` | `/api/v1/ownership-transfers/{transfer_id}/reject` | Reject transfer. |

Missing from current docs:

- Claim state machine.
- Transfer approval.
- Duplicate vehicle resolution.

---

## 7. Passport Record APIs

### Service Records

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles/{vehicle_id}/service-records` | List service records. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/service-records` | Create owner-declared service record. |
| `GET` | `/api/v1/service-records/{record_id}` | Read record detail. |
| `PATCH` | `/api/v1/service-records/{record_id}` | Update owner-declared draft/editable fields. |
| `POST` | `/api/v1/service-records/{record_id}/dispute` | Dispute record. |

### Repair Records

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles/{vehicle_id}/repair-records` | List repair records. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/repair-records` | Create repair record. |
| `POST` | `/api/v1/repair-records/{record_id}/dispute` | Dispute repair record. |

### Insurance Records

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles/{vehicle_id}/insurance-records` | List policies. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/insurance-records` | Create policy record. |
| `GET` | `/api/v1/vehicles/{vehicle_id}/insurance-status` | Current insurance status. |

### Road Tax Records

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles/{vehicle_id}/road-tax-records` | List road tax renewals. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/road-tax-records` | Create road tax record. |
| `GET` | `/api/v1/vehicles/{vehicle_id}/road-tax-status` | Current road tax status. |

### Loan Records

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles/{vehicle_id}/loan-records` | List loans. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/loan-records` | Create owner-declared loan. |
| `POST` | `/api/v1/loan-records/{record_id}/settlement-letter` | Attach settlement letter. |
| `POST` | `/api/v1/loan-records/{record_id}/verify-settlement` | Admin/bank verification. |

### EV Records

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles/{vehicle_id}/ev/battery-records` | List SoH records. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/ev/battery-records` | Create battery record. |
| `GET` | `/api/v1/vehicles/{vehicle_id}/ev/charging-logs` | List charging logs. |
| `POST` | `/api/v1/vehicles/{vehicle_id}/ev/charging-logs` | Create charging log. |

---

## 8. Document API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles/{vehicle_id}/documents` | List documents. |
| `POST` | `/api/v1/documents/upload-url` | Create signed upload URL. |
| `POST` | `/api/v1/documents` | Create document metadata after upload. |
| `GET` | `/api/v1/documents/{document_id}/download-url` | Create signed download URL. |
| `PATCH` | `/api/v1/documents/{document_id}` | Update metadata. |
| `POST` | `/api/v1/documents/{document_id}/access-grants` | Share document with party. |
| `DELETE` | `/api/v1/document-access-grants/{grant_id}` | Revoke access. |

Missing from current docs:

- Direct upload signing.
- Per-document access grants.
- OCR job lifecycle.

---

## 9. Reminder & Notification API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/reminders` | List reminders for user or organization. |
| `POST` | `/api/v1/reminders` | Create custom reminder. |
| `PATCH` | `/api/v1/reminders/{reminder_id}` | Update reminder. |
| `POST` | `/api/v1/reminders/{reminder_id}/dismiss` | Dismiss reminder. |
| `POST` | `/api/v1/reminders/{reminder_id}/complete` | Mark complete. |
| `GET` | `/api/v1/notification-events` | Delivery log. |
| `GET` | `/api/v1/notification-templates` | List templates. |
| `PATCH` | `/api/v1/notification-templates/{template_id}` | Update template. |

---

## 10. Workshop API

### Workshop Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/workshops/{organization_id}/dashboard` | Stats, active jobs, reminders due. |
| `GET` | `/api/v1/workshops/{organization_id}/analytics` | Workshop analytics. |

### Customers

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/workshops/{organization_id}/customers` | List customers. |
| `POST` | `/api/v1/workshops/{organization_id}/customers` | Create customer. |
| `GET` | `/api/v1/workshop-customers/{customer_id}` | Customer profile. |
| `PATCH` | `/api/v1/workshop-customers/{customer_id}` | Update customer. |

### Job Cards

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/workshops/{organization_id}/job-cards` | List job cards. |
| `POST` | `/api/v1/workshops/{organization_id}/job-cards` | Create job card. |
| `GET` | `/api/v1/job-cards/{job_card_id}` | Job card detail. |
| `PATCH` | `/api/v1/job-cards/{job_card_id}` | Update job card. |
| `POST` | `/api/v1/job-cards/{job_card_id}/status` | Transition status. |
| `POST` | `/api/v1/job-cards/{job_card_id}/complete` | Complete job card. |
| `POST` | `/api/v1/job-cards/{job_card_id}/publish-service-record` | Publish verified service record. |

### Inventory & Invoices

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/workshops/{organization_id}/inventory-parts` | List parts. |
| `POST` | `/api/v1/workshops/{organization_id}/inventory-parts` | Create part. |
| `POST` | `/api/v1/inventory-parts/{part_id}/movements` | Stock movement. |
| `GET` | `/api/v1/workshops/{organization_id}/invoices` | List invoices. |
| `POST` | `/api/v1/job-cards/{job_card_id}/invoice` | Generate invoice. |
| `POST` | `/api/v1/invoices/{invoice_id}/send` | Send/share invoice. |

---

## 11. Report & Dealer API

### Report Generation

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/vehicles/{vehicle_id}/reports` | Request report generation. |
| `GET` | `/api/v1/report-jobs/{job_id}` | Check generation status. |
| `GET` | `/api/v1/reports/{report_id}` | Read owned/purchased report snapshot. |
| `GET` | `/api/v1/reports/{report_id}/pdf` | Get signed PDF URL. |
| `POST` | `/api/v1/reports/{report_id}/shares` | Create share link. |
| `DELETE` | `/api/v1/report-shares/{share_id}` | Revoke share. |

### Dealer

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/dealers/{organization_id}/dashboard` | Dealer dashboard summary. |
| `POST` | `/api/v1/dealers/{organization_id}/plate-checks` | Dealer authenticated check. |
| `POST` | `/api/v1/dealers/{organization_id}/report-purchases` | Purchase/unlock full report. |
| `GET` | `/api/v1/dealers/{organization_id}/report-purchases` | Purchase history. |
| `POST` | `/api/v1/dealers/{organization_id}/batch-checks` | Bulk check plates. |
| `GET` | `/api/v1/dealer-batch-checks/{batch_id}` | Batch check status. |
| `GET` | `/api/v1/dealers/{organization_id}/listings` | Dealer listings. |
| `POST` | `/api/v1/dealers/{organization_id}/listings` | Create verified listing. |

---

## 12. Billing API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/plans` | Authenticated plan list. |
| `GET` | `/api/v1/subscription` | Current user/org subscription. |
| `POST` | `/api/v1/checkout/subscription` | Create subscription checkout. |
| `POST` | `/api/v1/checkout/report` | Create pay-per-report checkout. |
| `POST` | `/api/v1/checkout/credits` | Purchase report credit pack. |
| `GET` | `/api/v1/credit-transactions` | Credit ledger. |

Rules:

- Never grant credits or report access until signed webhook confirmation.
- Store all provider events.
- Credit consumption must be atomic and idempotent.

---

## 13. Admin API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Platform overview. |
| `GET` | `/api/v1/admin/users` | User management. |
| `PATCH` | `/api/v1/admin/users/{user_id}` | Update role/status. |
| `GET` | `/api/v1/admin/organizations` | Organization list. |
| `POST` | `/api/v1/admin/organizations/{organization_id}/verify` | Verify organization. |
| `GET` | `/api/v1/admin/vehicle-claims` | Review claims. |
| `POST` | `/api/v1/admin/vehicle-claims/{claim_id}/approve` | Approve claim. |
| `POST` | `/api/v1/admin/vehicle-claims/{claim_id}/reject` | Reject claim. |
| `GET` | `/api/v1/admin/disputes` | Review record disputes. |
| `POST` | `/api/v1/admin/disputes/{dispute_id}/resolve` | Resolve dispute. |
| `GET` | `/api/v1/admin/integration-events` | Integration monitoring. |
| `GET` | `/api/v1/admin/audit-log` | Audit trail. |
| `GET` | `/api/v1/admin/data-subject-requests` | PDPA queue. |

---

## 14. Partner API

Version 3 target surface:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/partner/v1/oauth/token` | Partner token issue. |
| `GET` | `/partner/v1/vehicles/{plate}/teaser` | Scoped vehicle teaser. |
| `POST` | `/partner/v1/reports` | Generate/purchase report by partner entitlement. |
| `GET` | `/partner/v1/reports/{report_id}` | Read report snapshot. |
| `POST` | `/partner/v1/service-records` | Workshop POS pushes service record. |
| `POST` | `/partner/v1/webhook-subscriptions` | Register webhook target. |

Partner API requirements:

- OAuth scopes.
- Per-client rate limits.
- Audit and usage events.
- Contracted data minimization.
- Sandbox and production environments.

---

## 15. Webhook API

| Provider | Endpoint | Required Controls |
|---|---|---|
| Payment gateway | `/webhooks/payments/{provider}` | Signature verification, idempotency, replay protection. |
| SMS/WhatsApp/email | `/webhooks/messaging/{provider}` | Delivery event validation. |
| JPJ/MyEG/Puspakom/PIAM/banks | `/webhooks/integrations/{provider}` | Source authentication, payload validation, idempotency. |

---

## 16. Missing API Priority

### Must Define Before MVP Build

- Vehicle claims.
- Report generation jobs.
- Payment checkout/webhooks.
- Credit transactions.
- Document upload/download signing.
- Consent/access grants.
- Admin verification and disputes.

### Can Define During Version 2

- Dealer batch checks.
- Reminder campaigns.
- Inventory movements.
- OCR jobs.
- WhatsApp template management.

### Can Define During Version 3

- Partner OAuth.
- Partner report API.
- Insurer risk API.
- Bank loan API.
- Telematics ingestion.

---

## 17. API Acceptance Criteria

- No workflow requires direct client writes to sensitive tables.
- Every mutating endpoint validates plan entitlement and actor permission.
- Every sensitive mutation creates an audit log entry.
- Every external callback is idempotent.
- Public endpoints return minimized data.
- Report generation is asynchronous.
- File uploads use signed URLs.
- Dealer and insurer reads use report snapshots or explicit access grants.
---

## 18. P0 API Contract Addendum

This section makes the API document consistent with `FINAL_GAP_ANALYSIS.md`, `DATABASE.md`, `SYSTEM_ARCHITECTURE.md`, `FEATURES.md`, and `DEVELOPMENT_ROADMAP.md`.

### 18.1 MVP API Boundary

MVP APIs cover owner, workshop, admin, report, billing, document, reminder, and public teaser/report workflows. Dealer and insurer product APIs are designed but remain Version 2 and Version 3 respectively unless the roadmap is revised.

### 18.2 Required P0 State Machines

The following state machines must be specified in the implementation API contract before coding:

| Workflow | Required States |
|---|---|
| Vehicle claim | `draft`, `submitted`, `proof_requested`, `under_review`, `approved`, `rejected`, `duplicate_review`, `cancelled` |
| Ownership transfer | `initiated`, `pending_acceptance`, `accepted`, `rejected`, `expired`, `disputed`, `admin_resolved` |
| Access grant | `active`, `revoked`, `expired` |
| Record dispute | `open`, `under_review`, `resolved_upheld`, `resolved_rejected`, `record_revoked`, `record_superseded` |
| Report job | `queued`, `processing`, `completed`, `failed`, `cancelled`, `refunded` |
| Report share | `active`, `revoked`, `expired` |
| Payment | `checkout_created`, `pending`, `paid`, `failed`, `expired`, `refunded`, `partially_refunded`, `disputed` |
| Credit transaction | `granted`, `consumed`, `refunded`, `expired`, `adjusted` |
| Organization invitation | `sent`, `accepted`, `revoked`, `expired` |
| Data subject request | `submitted`, `verifying_identity`, `processing`, `completed`, `rejected`, `cancelled` |

### 18.3 Required P0 Endpoint Coverage

Before development, the detailed API contract must include request/response payloads, authorization rules, idempotency behavior, audit events, and error codes for:

- Vehicle claims and claim proof documents.
- Ownership transfers.
- Consent and vehicle access grants.
- Document access grants.
- Record disputes and admin dispute resolution.
- Report generation jobs, report shares, report view logs, and report revocation.
- Checkout creation, payment webhooks, payment status, refunds, and reconciliation.
- Credit transactions and atomic credit consumption.
- Organization invitations and member role management.
- Notification templates and normalized notification preferences.
- Data subject requests.
- Public plate teaser with rate-limit and abuse responses.
- Admin duplicate vehicle resolution and support operations.

### 18.4 Required P0 Security Rules

- No direct client writes to trusted ownership, credit, payment, report snapshot, or admin resolution tables.
- All mutating endpoints require permission checks beyond RLS.
- All sensitive mutations write audit events.
- All external callbacks are signature-checked and idempotent.
- Public endpoints expose only minimized teaser data or report snapshots.
- Public report and PDF endpoints validate share token, expiry, revocation, recipient scope where applicable, and rate limits.
- Dealer and insurer reads must use purchased snapshots or explicit access grants, never raw private source tables.

### 18.5 Required P0 Error Codes

The API contract must standardize at least these error codes:

- `access_denied`
- `auth_required`
- `rate_limited`
- `vehicle_not_found`
- `vehicle_claim_required`
- `claim_under_review`
- `ownership_transfer_invalid`
- `consent_required`
- `grant_expired`
- `report_job_failed`
- `report_share_expired`
- `payment_pending`
- `payment_failed`
- `insufficient_credits`
- `subscription_limit_exceeded`
- `document_access_denied`
- `record_disputed`
- `idempotency_conflict`
- `webhook_signature_invalid`

