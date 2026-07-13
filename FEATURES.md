# FEATURES.md
## Vehicle Passport Malaysia (VPM)

**Version:** 1.0  
**Based on:** PRD, UI Wireframe, and Database Specification  
**Purpose:** Feature classification by release phase

---

## Release Philosophy

VPM should launch with a narrow but trusted vehicle-history loop:

1. Owners create vehicles and add records.
2. Workshops create verified service records.
3. Owners receive renewal/service reminders.
4. Buyers can view a credible Passport Report.

Later versions deepen the network effect by adding dealer workflows, EV intelligence, insurer integrations, richer automation, mobile apps, and enterprise APIs.

---

## MVP

MVP is the first public launch. It should prove the core trust loop between owners, vehicles, workshops, and reports.

### Public Website

- Landing page
- Pricing page
- Login and sign-up entry
- OTP verification flow
- Public shared Passport Report page
- Basic unauthenticated plate check teaser

### Authentication & Account

- Phone-based OTP login
- User profile creation
- Full name capture
- Phone and email capture
- Encrypted IC/passport number storage
- PDPA consent capture
- Basic account settings
- Reminder channel preferences
- Owner, workshop, and admin roles

### Owner Portal

- Owner dashboard
- My Vehicles list
- Add first vehicle flow
- Vehicle detail overview
- Vehicle completeness score
- Missing-data prompts
- Vehicle header with plate, make, model, year, fuel type, odometer, and status badges
- Mobile-responsive web app / PWA
- Bottom navigation on mobile

### Vehicle Registry

- Vehicle profile creation by plate number
- Manual vehicle identity fields: make, model, variant, year, fuel type, colour
- VIN/chassis number storage where available
- Engine capacity and motor power fields
- Transmission and seating capacity fields
- Odometer at registration
- Current ownership linkage
- Owner, co-owner, and watcher roles
- Ownership transfer history foundation

### Service History

- Manual service record entry by owner
- Workshop-logged service record entry
- Service date
- Odometer reading
- Service type
- Items serviced checklist
- Parts replaced
- Labour cost, parts cost, and total invoice amount
- Technician/mechanic name
- Next service due date or mileage
- Workshop Verified badge for partner-created records
- Owner Declared badge for owner-entered records
- Dispute flag instead of delete
- Service timeline view
- Service history filters

### Repair & Accident History

- Manual repair record entry
- Repair date
- Repair type
- Damage/fault description
- Parts replaced
- Repair cost
- Insurance claim reference field
- Accident record flag
- Flood damage flag
- Repair photos metadata support

### Insurance Tracker

- Insurance policy record entry
- Insurer name
- Policy number
- Policy type
- Coverage start and end date
- Sum insured
- Premium amount
- NCD percentage
- Named drivers
- Endorsements/riders
- Agent name and contact
- Policy document upload
- Lapse detection for reports

### Road Tax Tracker

- Road tax record entry
- Renewal date
- Expiry date
- Amount paid
- Renewal channel
- Receipt number
- Receipt upload
- Expired and expiring status flags

### Loan Tracker

- Owner-declared loan record entry
- Financier name
- Masked loan account number
- Loan start date
- Tenure
- Loan amount
- Monthly instalment
- Outstanding balance
- Interest rate
- Loan status
- Settlement letter upload
- Loan Clear badge foundation
- Active loan flag in Passport Report

### Document Vault

- Upload vehicle documents
- Store document metadata
- Link documents to vehicle records
- Document type classification
- Expiry date where applicable
- Private file storage
- Basic document list by vehicle
- Supported document types for insurance, road tax, service invoice, loan agreement, settlement letter, vehicle grant, and photos

### Reminders & Alerts

- Road tax expiry reminders
- Insurance expiry reminders
- Service due reminders
- Reminder list screen
- Reminder status: scheduled, sent, dismissed, completed, failed
- Email and SMS support
- Basic toast notifications
- Reminder preferences by channel

### Workshop Module

- Workshop dashboard
- Workshop profile
- Workshop verification badge
- Workshop member access
- Vehicle lookup by plate
- Limited vehicle summary during lookup
- Customer CRM list
- Customer profile
- Customer phone and contact preferences
- Vehicle roster per customer
- Digital job card creation
- Job status workflow: intake, in progress, QC, awaiting parts, completed, invoiced
- Mechanic assignment
- Odometer capture at intake
- Service type selection
- Job notes
- Job card detail screen
- Publish completed job as verified service record
- Owner notification after completed workshop service
- Basic workshop analytics: jobs today, completed jobs, revenue, pending jobs

### Passport Reports

- Generate Vehicle Passport Report
- PDF generation
- Report Sections A-G:
  - Vehicle identity
  - Ownership history summary
  - Service history summary
  - Accident and repair history
  - Insurance status
  - Road tax status
  - Loan status
- Data confidence score
- Report generation timestamp
- Report ID
- QR/verification link foundation
- Time-limited shared report link
- Owner-generated report history

### Monetisation

- Owner Basic plan
- Workshop Starter plan
- Pay-per-report foundation
- Report credit accounting foundation
- Payment provider reference storage

### Admin

- Admin dashboard foundation
- User management
- Workshop verification
- Integration status screen foundation
- Audit log foundation
- Basic support visibility into organizations, users, vehicles, and reports

### MVP Integrations

- SMS provider for OTP and reminders
- Email provider for transactional mail
- File storage
- Payment gateway for report purchases and subscriptions
- JPJ/MyEG integration placeholders with manual fallback

### Security & Compliance

- Row Level Security on application tables
- Role-based access control
- Organization-scoped access
- Encrypted sensitive identifier storage
- Private document storage
- Public report access via token and expiry
- PDPA consent logging
- Audit logging for sensitive actions

---

## Version 2

Version 2 expands growth channels and paid plan value after the core passport loop is validated.

### Native Mobile Apps

- Native iOS app
- Native Android app
- Push notification support
- Mobile-first document/photo upload
- Improved offline-tolerant entry for service records and job intake

### Owner Plus

- Owner Plus subscription
- Up to 5 vehicles per owner
- Expanded document storage quota
- Unlimited owner-generated Passport Reports
- Priority support flag
- Enhanced completeness prompts
- Estimated resale value feature stub

### EV Module

- EV/PHEV battery dashboard
- Battery capacity
- Battery chemistry
- State of Health percentage tracking
- Battery health arc visual
- SoH threshold labels: excellent, good, fair, poor
- Battery warranty status
- Battery warranty expiry
- Charging history log
- Charger type badges
- kWh added
- Charging location
- OTA software update log
- Manufacturer recall notice log
- EV degradation warning when SoH falls below threshold
- EV-specific Passport Report Section H

### Dealer Module

- Dealer dashboard
- Dealer organization accounts
- Vehicle history check workflow
- Free teaser summary by plate
- Purchase full report flow
- Dealer report credit usage
- Dealer report purchase history
- Bulk report purchase
- Batch plate lookup
- Dealer plan
- VPM Verified Dealer badge
- VPM Verified listing records
- Dealer listings page
- Share report via link, PDF, and WhatsApp

### Workshop Professional

- Workshop Professional plan
- Multi-staff logins
- Expanded customer limits
- Parts inventory tracker
- Parts catalogue
- SKU and part number tracking
- Supplier fields
- Reorder level alerts
- Parts usage per job
- Auto-deduct inventory from completed jobs
- Invoicing module
- Invoice line items
- SST calculation
- Payment status tracking
- Invoice PDF export
- WhatsApp invoice sharing
- Full workshop analytics dashboard
- Mechanic productivity metrics
- Revenue breakdown by service type
- Top customers by spend
- Parts usage and cost analysis

### Service Reminder Engine

- Configurable reminder rules
- Distance-based reminders
- Time-based reminders
- Custom reminder rules
- Reminder campaign builder
- WhatsApp Business reminders
- SMS reminder campaigns
- Message templates with merge fields
- Opt-out management
- Campaign performance tracking: sent, opened, converted

### Integrations

- MyEG road tax live status pull
- Puspakom pilot data feed
- WhatsApp Business Cloud API
- Listing badge integration pilot for marketplaces such as Mudah.my
- Dealer payment and report-credit automation

### Document Intelligence

- OCR processing status
- OCR extracted metadata foundation
- Auto-detect document expiry dates
- Document sharing with specific parties
- Time-limited document access links

### Report Enhancements

- Full report Sections A-J
- EV battery section
- Data confidence score refinement
- Verified vs owner-declared ratio
- QR verification link in generated PDFs
- Shared report validity messaging
- Dealer report snapshot access

---

## Version 3

Version 3 turns VPM into a partner data platform for insurers, banks, large workshops, and enterprise integrations.

### Insurance Partner Module

- Insurer dashboard
- Vehicle risk profile view
- Insurance portfolio dashboard
- Renewal management
- Policy portfolio imports
- Verified mileage summary for underwriting
- Service history summary for underwriting
- Accident and repair risk flags
- Claims history summary
- Insurance renewal campaigns
- Insurer organization member roles
- Enterprise pricing and access controls

### Bank & Loan Integrations

- Bank API loan balance feed pilot
- Automated outstanding balance updates
- Official settlement figure request workflow
- Settlement verification workflow
- Loan Clear badge automation
- Early settlement calculator
- Amortisation preview
- Bank integration event logging

### Advanced Integrations

- PIAM motor claims data integration
- Puspakom production data feed
- OBD2/telematics integration
- Real-time EV SoH ingestion
- Third-party workshop POS import
- Partner API authentication
- Webhooks for report generation and listing badge status

### VPM Open API

- Public API documentation
- OAuth 2.0 partner authentication
- Dealer vehicle status API
- Insurer vehicle risk API
- Workshop service-record push API
- Report generation API
- API usage tracking
- API billing foundation
- Partner sandbox environment

### Intelligence & Analytics

- Advanced workshop analytics
- Forecasting for workshop revenue and service demand
- Customer retention cohort analysis
- Vehicle data confidence scoring improvements
- Service regularity rating
- Accident risk scoring
- Insurance lapse history scoring
- Dealer trade-in assessment tools
- Bulk analytics exports to Excel/PDF

### Localisation & Accessibility

- Mandarin language support
- Bahasa Malaysia and English refinement
- WCAG 2.1 AA audit
- Report PDF accessibility improvements

### Fleet Management

- Corporate fleet accounts
- Fleet vehicle roster
- Fleet service compliance dashboard
- Fleet document expiry dashboard
- Fleet reminders
- Fleet report generation
- Organization-level permissions for fleet managers

### Compliance & Operations

- Data export workflow
- Account deactivation workflow
- Data anonymisation workflow
- Consent versioning
- Advanced audit review tools
- SOC 2 readiness controls
- Admin integration monitoring

---

## Future

Future features are strategically valuable but should wait until VPM has strong data density, partner traction, and operational maturity.

### Government & Ecosystem Expansion

- Deeper JPJ integration
- JPJ registration status automation
- MyKad-linked ownership verification improvements
- Government-backed vehicle identity verification
- Cross-agency data exchange
- Formal Puspakom certificate verification
- SIRIM/JPJ modification approval verification

### Marketplace & Resale

- Public buyer marketplace
- Verified used-car listing pages hosted by VPM
- Resale value calculator
- Dealer stock acquisition tools
- Trade-in pricing intelligence
- Marketplace syndication to multiple listing platforms
- Buyer lead capture
- Escrow or transaction support

### Payments & Finance

- FPX payment integration
- DuitNow QR payment integration
- Workshop payment collection
- Recurring subscription billing optimisation
- Buy-now-pay-later for workshop invoices
- Insurance renewal payment handoff
- Road tax renewal handoff

### AI & Automation

- OCR auto-extraction for all vehicle documents
- AI-assisted service record parsing from receipts
- AI fraud/anomaly detection
- Odometer rollback suspicion scoring
- Predictive maintenance recommendations
- Smart reminder timing
- Automated report narrative summaries
- AI support assistant for owners and workshops

### Telematics & Connected Vehicle

- Live odometer updates
- Driving behaviour telemetry
- EV charging efficiency analytics
- Battery degradation prediction
- Diagnostic trouble code ingestion
- Maintenance alerts from OBD2 data
- Manufacturer API integrations

### Insurance Intelligence

- Dynamic underwriting scores
- Claims fraud detection signals
- Usage-based insurance support
- White-label insurer portals
- Automated quote prefill
- Claims intake workflow

### Workshop Ecosystem

- Supplier purchase orders
- Supplier marketplace
- Parts procurement automation
- Mechanic time tracking
- Bay scheduling
- Workshop capacity planning
- Warranty claim handling
- Workshop POS plugin marketplace

### Enterprise & Platform

- Multi-region deployment
- Data warehouse
- BI dashboards for partners
- Enterprise SSO
- SCIM provisioning
- Advanced rate limiting and API monetisation
- Partner developer portal
- Data clean room for insurers and institutions

### Trust, Legal & Data Governance

- Tamper-evident event ledger
- Blockchain/notarised report verification exploration
- Legal-grade vehicle history certificate
- Consent-based third-party data sharing marketplace
- Long-term statutory data retention workflows
- Automated PDPA data subject request handling

---

## Phase Summary

| Phase | Product Theme | Primary Users | Main Outcome |
|---|---|---|---|
| MVP | Trusted vehicle passport loop | Owners, workshops, admins | Create vehicles, log verified service, track renewals, generate reports. |
| Version 2 | Growth and monetisation | Owners, workshops, dealers | Add EV, dealer, inventory, invoices, WhatsApp, report credits, and richer paid plans. |
| Version 3 | Partner intelligence platform | Insurers, banks, enterprises, fleets | Add APIs, insurer/bank integrations, telematics, advanced analytics, and fleet workflows. |
| Future | Ecosystem dominance | Whole vehicle market | Build marketplace, AI, government-grade verification, payments, and data network products. |
---

## P0 MVP Alignment Addendum

This addendum resolves the cross-document MVP boundary. MVP must include trust foundations that were previously described as architectural gaps, because they are necessary for a credible vehicle passport product.

### Added To MVP

- Vehicle claim verification and claim proof upload.
- Ownership transfer foundation.
- Consent/access grants for third-party access.
- Record dispute and admin moderation workflow.
- Report generation jobs and async PDF generation.
- Revocable report shares with expiry and view audit.
- Payment checkout and signed webhook confirmation for pay-per-report.
- Credit transaction ledger for report credits.
- Organization invitations for workshop staff onboarding.
- Document access grants and signed download lifecycle.
- Notification templates and normalized opt-out preferences.
- Data subject request foundation for PDPA export and deactivation.
- Public plate teaser rate limits and abuse monitoring.

### Explicitly Not MVP

- Full dealer dashboard and batch checks.
- Full insurer dashboard and portfolio/risk module.
- EV battery dashboard unless included in a pilot exception.
- Inventory stock audit and workshop invoicing beyond basic job-card totals.
- OCR document intelligence.
- Partner Open API.
- Bank, PIAM, Puspakom, telematics, and fleet integrations.

### MVP Exit Criteria Update

The MVP is development-ready only when each added MVP item has a corresponding database model, API contract, UI flow, admin operation, audit event, and security rule.

