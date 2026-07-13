# Product Requirements Document (PRD)
## Vehicle Passport Malaysia (VPM)

---

**Document Version:** 1.0  
**Date:** June 2026  
**Status:** Draft — For Review  
**Author:** Product Team  
**Confidentiality:** Internal Use Only

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision & Mission](#3-vision--mission)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [Market Context](#5-market-context)
6. [Target Users & Personas](#6-target-users--personas)
7. [User Stories](#7-user-stories)
8. [Product Architecture & Platform Overview](#8-product-architecture--platform-overview)
9. [Feature Specifications](#9-feature-specifications)
10. [Vehicle Passport Report](#10-vehicle-passport-report)
11. [Workshop CRM Module](#11-workshop-crm-module)
12. [Data Model Overview](#12-data-model-overview)
13. [Integrations & API Strategy](#13-integrations--api-strategy)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Monetisation Strategy](#15-monetisation-strategy)
16. [Go-to-Market Strategy](#16-go-to-market-strategy)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Roadmap](#18-roadmap)
19. [Appendix](#19-appendix)

---

## 1. Executive Summary

**Vehicle Passport Malaysia (VPM)** is a cloud-based SaaS platform that creates a lifelong, verifiable digital identity for every vehicle registered in Malaysia. The platform centralises vehicle service history, repair records, insurance and road tax data, and loan information into a single trusted source of truth — accessible by owners, workshops, used-car dealers, and insurance agents.

VPM targets a market of over **16 million registered vehicles** in Malaysia, serving a fragmented ecosystem where vehicle history is currently scattered across paper receipts, workshop systems, JPJ databases, and insurer portals. By bringing all stakeholders onto one platform, VPM increases transparency, reduces fraud, and creates a network-effect moat that grows stronger with every participant.

The platform will be offered as a **multi-sided SaaS** with tiered subscription plans for each user segment, supplemented by a pay-per-report model for one-time consumers.

---

## 2. Problem Statement

### 2.1 Current Pain Points

**Vehicle Owners**
- No single place to store or retrieve their vehicle's full history.
- Cannot easily prove service or maintenance history when reselling.
- Frequently miss renewal deadlines for road tax, insurance, and service schedules.
- Loan information is siloed at the bank with no consolidated view.

**Workshops**
- Customer vehicle history is locked in local desktop software or physical job cards.
- No easy way to access a vehicle's prior service record at intake.
- Customer retention is weak due to lack of automated follow-up tools.
- No digital proof-of-service to share with customers or third parties.

**Used-Car Dealers**
- Rely on verbal claims or incomplete paperwork to verify a vehicle's condition.
- High risk of purchasing or reselling vehicles with hidden accident or flood damage history.
- Manual verification of road tax and insurance validity is time-consuming.
- Lack a credible third-party report to justify asking price to buyers.

**Insurance Agents**
- No reliable digital source to verify a vehicle's actual mileage or accident history.
- Risk of insuring fraudulently described vehicles.
- Manual follow-ups for policy renewal are inefficient.
- Cannot easily cross-reference claims history across providers.

### 2.2 Root Cause

Malaysia lacks a **centralised, interoperable vehicle data ecosystem**. Existing data resides in isolated systems — JPJ, Puspakom, individual insurer databases, and workshop software — with no single API or platform connecting them for everyday stakeholders.

---

## 3. Vision & Mission

**Vision**
To become the trusted digital backbone of every vehicle's life in Malaysia — from first registration to final sale.

**Mission**
To empower every Malaysian vehicle stakeholder — owner, workshop, dealer, and insurer — with transparent, verifiable, and actionable vehicle intelligence.

---

## 4. Goals & Success Metrics

### 4.1 Business Goals

| Goal | 12-Month Target | 24-Month Target |
|---|---|---|
| Registered Vehicles on Platform | 50,000 | 300,000 |
| Active Workshops | 500 | 3,000 |
| Active Used-Car Dealers | 200 | 1,500 |
| Insurance Partners | 3 | 8 |
| Monthly Recurring Revenue (MRR) | RM 150,000 | RM 1,200,000 |
| Passport Reports Generated | 5,000/month | 50,000/month |

### 4.2 Product Success Metrics (KPIs)

| Metric | Definition | Target |
|---|---|---|
| Vehicle Records Created | New vehicles added per month | 10,000/month (Y1) |
| Record Completeness Score | % of fields filled per passport | > 70% |
| Workshop Monthly Active Users | Workshops logging at least 1 entry/month | 80% of subscribed |
| Report Conversion Rate | Visitors who purchase a report | > 12% |
| Net Promoter Score (NPS) | Owner segment | > 45 |
| Churn Rate | Monthly subscription churn | < 3% |

---

## 5. Market Context

### 5.1 Market Size

Malaysia has approximately **16.8 million registered motor vehicles** (JPJ 2023), growing at roughly 4% annually. The used-car market transacts over **600,000 vehicles per year**, with average transaction values between RM 30,000 and RM 80,000 — making vehicle history verification a high-value proposition.

The general insurance market in Malaysia is valued at over **RM 18 billion**, with motor insurance accounting for approximately 50% of all premiums. Fraud and misrepresentation cost the industry hundreds of millions annually.

### 5.2 Competitive Landscape

| Competitor / Alternative | Strength | Gap VPM Fills |
|---|---|---|
| Carsome / Mytukar (dealer platforms) | Strong B2C used-car brand | No independent history record; closed ecosystem |
| Puspakom Inspection Reports | Government authority | Point-in-time only; no ongoing history |
| AutoBest / Workshop POS Systems | Captures service records | Siloed per workshop; no cross-platform sharing |
| Bank Negara / Insurers' Own Portals | Policy data | Not accessible to owners or third parties easily |
| Singapore OneMotoring | Comprehensive government-backed | Not applicable to Malaysia; no private ecosystem |

**VPM's differentiation:** The only multi-stakeholder, multi-record-type platform in Malaysia that generates a living, cumulative digital passport for individual vehicles.

---

## 6. Target Users & Personas

### Persona 1 — Ahmad, the Vehicle Owner
- Age 34, executive in Shah Alam, drives a 2020 Honda HR-V
- Has three vehicles in the family including an older Proton Saga
- Pain: Lost his workshop receipts, struggles to remember when he last changed brake pads
- Needs: One app to track service history, get reminders, and prepare his car's history for resale

### Persona 2 — Pak Razif, the Independent Workshop Owner
- Age 48, owns a 4-bay workshop in Klang with 3 mechanics
- Uses WhatsApp to communicate with customers and a manual job card system
- Pain: Customers don't return because no follow-up system; can't see prior service history at intake
- Needs: Digital job cards, automated service reminders, a CRM to manage his 400+ customer base

### Persona 3 — Ling, the Used-Car Dealer
- Age 39, operates a used-car lot in Cheras with 25-40 units at any time
- Pain: Buys a car, discovers undisclosed accident history only after purchase; loses money
- Needs: A reliable history check before purchase, a verification report to attach to sale listings

### Persona 4 — Farah, the Insurance Agent
- Age 31, insurance agent handling 200+ motor policies
- Pain: Manual renewal reminders, clients dispute claims citing undisclosed modifications
- Needs: Verified mileage and modification history to underwrite accurately; renewal alerts

---

## 7. User Stories

### 7.1 Vehicle Owner

- As a vehicle owner, I want to register my vehicle by plate number and IC so that I can start building my digital passport immediately.
- As a vehicle owner, I want to log a service visit manually or have my workshop log it for me so that my history is always up to date.
- As a vehicle owner, I want to receive reminders for upcoming road tax and insurance renewals so that I never lapse on coverage or legality.
- As a vehicle owner, I want to generate a Vehicle Passport Report to share with a potential buyer so that I can justify my asking price with verified history.
- As an EV owner, I want to track battery health, charging history, and warranty claims so that I have a complete EV-specific record.
- As a vehicle owner, I want to view my active loan details including outstanding balance and monthly instalment so that I have a consolidated financial overview.

### 7.2 Workshop

- As a workshop owner, I want to look up a vehicle's prior service history when it comes in for a new job so that I can provide informed service recommendations.
- As a workshop owner, I want to create a digital job card that automatically updates the vehicle's passport so that my work is recorded without duplicate data entry.
- As a workshop owner, I want to send automated service reminders to customers via WhatsApp or SMS at 3-month intervals so that I increase return visits.
- As a workshop owner, I want to view monthly revenue, job count, and parts usage reports so that I can manage my business performance.
- As a workshop manager, I want to assign jobs to specific mechanics and track completion status so that I can manage my team's workload.

### 7.3 Used-Car Dealer

- As a used-car dealer, I want to request a full Vehicle Passport Report on any plate number I am considering purchasing so that I can make an informed buying decision.
- As a used-car dealer, I want to attach a VPM Verified Badge to my listings so that buyers trust the history of my stock.
- As a used-car dealer, I want to view alerts when a vehicle I am inspecting has outstanding loans or accident records flagged so that I avoid legal complications.
- As a used-car dealer, I want to bulk-check multiple vehicles at once so that I can efficiently evaluate a batch of trade-ins.

### 7.4 Insurance Agent

- As an insurance agent, I want to view verified mileage and service records for a vehicle I am quoting so that my pricing reflects actual risk.
- As an insurance agent, I want to receive automated renewal reminders 60 and 30 days before policy expiry for my entire client portfolio so that I do not lose renewals.
- As an insurance agent, I want to access a vehicle's claims history summary so that I can accurately assess risk for new policies.

---

## 8. Product Architecture & Platform Overview

### 8.1 Platform Modules

```
Vehicle Passport Malaysia Platform
│
├── Core Platform
│   ├── Vehicle Registry (Plate / VIN / MyKad linkage)
│   ├── Document Vault (photos, receipts, inspection certs)
│   └── Notification Engine (email, SMS, WhatsApp)
│
├── Owner Portal (Web + Mobile App)
│   ├── Dashboard & Vehicle Overview
│   ├── Service & Repair History Log
│   ├── Insurance & Road Tax Tracker
│   ├── Loan Tracker
│   ├── EV Module (battery, charge, warranty)
│   └── Report Generator
│
├── Workshop Module (Web App)
│   ├── Vehicle Lookup & History
│   ├── Job Card Management
│   ├── Customer CRM
│   ├── Parts Inventory Tracker
│   ├── Invoicing & Payments
│   └── Analytics Dashboard
│
├── Dealer Module (Web App)
│   ├── Vehicle History Check
│   ├── Batch Report Purchase
│   ├── VPM Verified Listing Badge
│   └── Trade-in Assessment Tools
│
├── Insurance Agent Module (Web App)
│   ├── Policy Portfolio Dashboard
│   ├── Vehicle Risk Profile View
│   ├── Renewal Reminder Management
│   └── Claims History Access
│
└── Admin & Integration Layer
    ├── API Gateway
    ├── JPJ / MyEG Integration
    ├── Insurance Partner API
    ├── Bank / HP Loan Feed
    └── Puspakom Data Feed
```

### 8.2 Technology Stack (Recommended)

| Layer | Technology |
|---|---|
| Frontend Web | React.js + TypeScript |
| Mobile App | React Native (iOS & Android) |
| Backend API | Node.js / NestJS (REST + GraphQL) |
| Database | PostgreSQL (relational) + Redis (cache) |
| File Storage | AWS S3 (documents, photos) |
| Authentication | Auth0 with MyKad / Singpass-style integration |
| Notifications | Twilio (SMS), WhatsApp Business API, SendGrid (email) |
| Infrastructure | AWS Malaysia Region (ap-southeast-1) |
| Analytics | Mixpanel + internal BI (Metabase) |

---

## 9. Feature Specifications

### 9.1 Vehicle Registry & Profile

**Description:** The foundational record for every vehicle on the platform.

**Fields:**
- Registration Number (plate number)
- Vehicle Identification Number (VIN / chassis number)
- Make, Model, Variant, Year of Manufacture
- Engine Capacity (cc) / Motor Power (kW for EV)
- Fuel Type: Petrol, Diesel, Hybrid (Mild/Full/PHEV), Battery Electric Vehicle (BEV), Hydrogen
- Colour
- Transmission Type
- Seating Capacity
- JPJ Registration Date
- Current Owner IC / Passport Number (encrypted)
- Odometer at Registration

**Rules:**
- One vehicle profile per VIN / plate number combination.
- Owner can transfer ownership to a new IC — prior owner's record is retained as historical.
- Vehicle type flags ICE, Hybrid, or EV and unlocks relevant sub-modules.

---

### 9.2 Service History Module

**Description:** Tracks all routine maintenance activities.

**Record Fields Per Entry:**
- Date of Service
- Workshop Name & VPM Workshop ID (if platform partner)
- Odometer Reading at Service
- Service Type (e.g., Full Service, Minor Service, Oil Change, Tyre Rotation)
- Items Serviced (checklist: oil filter, air filter, brake fluid, spark plugs, etc.)
- Parts Replaced (part name, brand, part number)
- Labour Cost (RM)
- Parts Cost (RM)
- Total Invoice Amount (RM)
- Technician Name
- Next Service Due (date or mileage)
- Attachments (invoice photo, job card scan)
- Data Source: Owner-entered / Workshop-logged / Imported

**Rules:**
- Entries logged directly by a verified VPM partner workshop carry a "Workshop Verified" badge.
- Owner-entered records are marked "Owner Declared."
- Entries cannot be deleted — only flagged as disputed.

---

### 9.3 Repair & Accident History Module

**Description:** Records non-routine repairs, bodywork, and accident-related work.

**Record Fields Per Entry:**
- Date of Repair
- Workshop / Panel Repairer Name
- Repair Type: Mechanical, Bodywork, Electrical, Accident Repair, Flood Damage Repair
- Description of Damage / Fault
- Parts Replaced
- Insurance Claim Reference (if applicable)
- Claim Amount (RM)
- Repair Cost (RM)
- Photos Before / After Repair
- Certifying Body (e.g., Puspakom, PIAM panel)
- Verified by Workshop: Yes / No

**Rules:**
- Accident repair entries trigger an "Accident Record" flag on the Vehicle Passport Report.
- Insurance-linked repairs auto-populate from insurer API (where integration exists).

---

### 9.4 Insurance Records Module

**Description:** Tracks all motor insurance policies linked to the vehicle.

**Record Fields Per Entry:**
- Insurance Provider Name
- Policy Number
- Policy Type: Comprehensive, Third-Party Fire & Theft, Third-Party
- Coverage Period (start and end date)
- Sum Insured (RM)
- Premium Amount (RM)
- No-Claim Discount (NCD) Percentage
- NCD Entitlement Number
- Named Drivers
- Endorsements / Riders
- Insured Agent Name & Contact
- Claims Under This Policy (linked to repair records)
- Policy Document (PDF attachment)
- Renewal Reminder: Yes / No, Preferred Channel

**Rules:**
- System sends renewal reminders at T-60 days and T-30 days automatically.
- NCD history is tracked across all policies for the vehicle.
- Lapsed periods are flagged in the Vehicle Passport Report.

---

### 9.5 Road Tax Records Module

**Description:** Tracks road tax (cukai jalan) renewal history.

**Record Fields Per Entry:**
- Renewal Date
- Expiry Date
- Amount Paid (RM)
- Renewal Channel: JPJ Counter, MyEG, Post Office, Online
- Receipt Number
- Attachment (receipt photo or PDF)

**Rules:**
- System sends renewal reminders at T-30 days and T-7 days.
- Integration with MyEG API pulls renewal status automatically where authorised.
- Expired road tax is prominently flagged in vehicle summary.

---

### 9.6 Vehicle Loan / Hire Purchase Module

**Description:** Tracks financing information for the vehicle.

**Record Fields:**
- Financier Name (e.g., Maybank, CIMB, RHB, MBSB)
- Loan Account Number (masked)
- Loan Commencement Date
- Loan Tenure (months)
- Loan Amount (RM)
- Monthly Instalment (RM)
- Outstanding Balance (RM) — manual entry or bank API feed
- Interest Rate (%)
- Loan Status: Active / Settled / Restructured
- Settlement Letter (PDF attachment — unlocks "Loan Clear" badge)

**Rules:**
- Outstanding loan status is flagged in the Vehicle Passport Report.
- "Loan Clear" badge is only shown when a settlement letter is uploaded and verified.
- Bank API integration is Phase 2; Phase 1 is owner-declared.

---

### 9.7 EV-Specific Module

**Description:** Additional data points relevant to Battery Electric Vehicles and PHEVs. Activated when vehicle fuel type is set to BEV or PHEV.

**Fields:**
- Battery Capacity (kWh)
- Battery Chemistry (e.g., LFP, NMC)
- Current State of Health (SoH %) — manual entry or OBD2 integration
- Charging History Log (date, charging type, kWh added, location)
- Battery Warranty Status and Expiry
- OTA Software Updates Log
- Manufacturer Recall Notices
- Charger Type Compatibility (AC Type 2, DC CCS2, CHAdeMO, GB/T)

**Rules:**
- Battery SoH history is charted over time on the dashboard.
- Battery warranty status is surfaced on the Vehicle Passport Report.
- Applicable to: Proton e.MAS, BYD range, BMW iX, Volvo EX series, Hyundai IONIQ, and others.

---

### 9.8 Document Vault

**Description:** Centralised secure storage for all vehicle-related documents.

**Supported Document Types:**
- Grant / Vehicle Registration Certificate (Geran Kenderaan)
- Road Tax Disc (Cukai Jalan)
- Insurance Cover Note / Certificate
- Puspakom Inspection Reports (B2, B5, B7)
- Purchase Invoice / Sales & Purchase Agreement
- Loan Agreement
- Settlement Letter
- Modification Approval (SIRIM / JPJ)
- Warranty Cards
- Service Invoices

**Rules:**
- Each document stored with upload date, document type, and expiry date (if applicable).
- OCR processing (Phase 2) auto-extracts key fields from uploaded PDFs.
- Shared access can be granted to specific parties (e.g., dealer, insurer) with time-limited links.

---

## 10. Vehicle Passport Report

### 10.1 Overview

The Vehicle Passport Report is the platform's flagship shareable product — a single-page (or multi-page) verified summary of a vehicle's history, generated on demand.

### 10.2 Report Sections

**Section A — Vehicle Identity**
- Plate number, make, model, year, colour, engine/motor specs, VIN (partial masked)
- Vehicle type badge: ICE / Hybrid / EV
- JPJ registration status

**Section B — Ownership History**
- Number of previous owners (count only, no IC details exposed)
- Duration of each ownership period

**Section C — Service History Summary**
- Total number of service records
- Date and mileage of last service
- Service regularity rating (Excellent / Good / Irregular / Minimal)
- Workshop-verified vs owner-declared ratio

**Section D — Accident & Repair History**
- Accident record flag: Clean / 1 Record / 2+ Records
- Type of repairs (bodywork, mechanical, flood — listed by category)
- Insurance claim count

**Section E — Insurance Status**
- Current policy validity
- NCD percentage
- Lapse history (if any)

**Section F — Road Tax Status**
- Current road tax validity
- Expiry date

**Section G — Loan Status**
- Active loan: Yes / No
- Loan clear badge (if settlement letter verified)

**Section H — EV Battery Health** (EV/PHEV only)
- Battery SoH % at last check
- Battery warranty status

**Section I — VPM Data Confidence Score**
- Percentage of data that is third-party verified vs owner-declared
- Number of contributing data sources

**Section J — QR Code & Verification Link**
- Tamper-evident QR code linking to live report on VPM platform
- Report generation timestamp and VPM Report ID

### 10.3 Report Access Models

| Access Type | Who | Mechanism |
|---|---|---|
| Owner generates for own vehicle | Owner subscriber | Included in subscription |
| One-time report purchase | Any user (dealer, buyer, public) | Pay-per-report (RM 15–RM 30) |
| Dealer bulk report | Dealer subscriber | Included in dealer plan (quota) |
| Shared report via link | Recipient of shared link | View-only, time-limited (7 days) |

---

## 11. Workshop CRM Module

### 11.1 Customer Management

- Customer profiles linked to IC / phone number
- Vehicle roster per customer (all vehicles they own or have owned)
- Contact preferences (WhatsApp, SMS, email)
- Customer lifetime value (total spend at this workshop)
- Visit frequency and recency scores
- Customer tags (VIP, Fleet, At-Risk, Inactive)

### 11.2 Job Card Management

- Digital job card creation at vehicle intake
- Automatic vehicle history pull when plate number entered
- Job status workflow: Intake → In Progress → QC → Awaiting Parts → Completed → Invoiced
- Mechanic assignment per job
- Real-time job status update visible to customer via SMS link
- Photo capture per job (before, during, after)
- Parts used log (linked to parts inventory)

### 11.3 Service Reminder Engine

- Configurable reminder rules:
  - Distance-based (e.g., every 5,000 km)
  - Time-based (e.g., every 3 or 6 months)
  - Custom (e.g., annual tyre rotation)
- Automated outbound messages via WhatsApp Business API and SMS
- Personalised message templates with vehicle and customer name merge fields
- Opt-out management and compliance (PDPA Malaysia)
- Reminder campaign performance tracking (sent, opened, converted)

### 11.4 Invoicing & Payments

- Digital invoice generation linked to job card
- Line items: labour, parts, sundries, tax
- SST (Sales and Service Tax) calculation
- Payment status tracking: Pending / Partial / Paid
- Integration with FPX, DuitNow QR (Phase 2)
- Invoice PDF export and WhatsApp share

### 11.5 Parts & Inventory Tracker

- Parts catalogue with VPM part number and supplier info
- Reorder level alerts
- Parts used per job (auto-deducts from inventory)
- Supplier purchase order management (Phase 2)

### 11.6 Workshop Analytics Dashboard

- Daily, weekly, monthly job count and revenue
- Revenue breakdown by service type
- Mechanic productivity (jobs completed, hours logged)
- Top customers by spend
- Parts usage and cost analysis
- Customer retention cohort view
- Export to Excel / PDF

---

## 12. Data Model Overview

### 12.1 Core Entities

```
Vehicle
├── id (UUID)
├── plate_number (unique)
├── vin (unique)
├── make, model, variant, year
├── fuel_type (ENUM: petrol, diesel, hybrid, bev, phev, hydrogen)
├── colour, transmission, engine_cc, motor_kw
└── created_at, updated_at

User
├── id (UUID)
├── ic_number (encrypted)
├── full_name, phone, email
├── role (ENUM: owner, workshop, dealer, insurer, admin)
└── created_at

VehicleOwnership
├── id
├── vehicle_id → Vehicle
├── owner_id → User
├── start_date, end_date (null = current owner)
└── transfer_type (new purchase, used purchase, inheritance, gift)

ServiceRecord
├── id
├── vehicle_id → Vehicle
├── workshop_id → Workshop (nullable)
├── date, odometer, service_type
├── items_serviced (JSON array)
├── parts_replaced (JSON array)
├── labour_cost, parts_cost, total_cost
├── verified_by_workshop (boolean)
└── attachments (S3 keys array)

RepairRecord
├── id
├── vehicle_id → Vehicle
├── repair_type (ENUM: mechanical, bodywork, electrical, accident, flood)
├── description, date
├── insurance_claim_ref (nullable)
├── claim_amount, repair_cost
└── photos (S3 keys array)

InsuranceRecord
├── id
├── vehicle_id → Vehicle
├── insurer_name, policy_number
├── policy_type, coverage_start, coverage_end
├── sum_insured, premium, ncd_pct
└── policy_doc_s3_key

RoadTaxRecord
├── id
├── vehicle_id → Vehicle
├── renewal_date, expiry_date
├── amount_paid, receipt_number
└── receipt_s3_key

LoanRecord
├── id
├── vehicle_id → Vehicle
├── financier, loan_account_masked
├── start_date, tenure_months
├── loan_amount, monthly_instalment, outstanding_balance
├── status (ENUM: active, settled, restructured)
└── settlement_letter_s3_key

EVBatteryRecord
├── id
├── vehicle_id → Vehicle
├── recorded_date
├── soh_pct, odometer
└── data_source (manual, obd2, manufacturer_api)

Workshop
├── id
├── name, address, postcode, state
├── ssm_number
├── contact_phone, contact_email
├── owner_id → User
└── verified (boolean)

PassportReport
├── id (UUID — used as public report ID)
├── vehicle_id → Vehicle
├── generated_by → User
├── generated_at
├── report_type (ENUM: owner, purchased, shared)
├── data_snapshot (JSON — frozen at generation time)
└── share_link_expiry
```

---

## 13. Integrations & API Strategy

### 13.1 Phase 1 Integrations (MVP)

| Integration | Purpose | Method |
|---|---|---|
| MyEG API | Road tax expiry status check | REST API |
| JPJ e-Services | Vehicle registration validation | REST API / scrape-fallback |
| Twilio | SMS notifications | REST API |
| WhatsApp Business Cloud API | Customer & reminder messaging | REST API |
| SendGrid | Transactional email | REST API |
| AWS S3 | Document and photo storage | AWS SDK |
| Stripe / iPay88 | Subscription payments and report purchases | REST API |

### 13.2 Phase 2 Integrations

| Integration | Purpose | Method |
|---|---|---|
| Puspakom | Inspection report data | Partner API / data feed |
| PIAM Motor Portal | Insurance claims data | Partner API |
| Bank APIs (Maybank, CIMB, RHB) | Loan balance data feed | Open Banking / partner |
| OBD2 / Telematics | Live mileage and diagnostics (EV SoH) | BLE / OBD2 dongle SDK |
| CarSome / Mudah / iCar | Listing verification badge | Webhook / embed |
| DuitNow QR / FPX | Workshop payment collection | PayNet API |

### 13.3 VPM Open API

VPM will publish a documented REST API (OpenAPI 3.0) to allow:
- Insurer partners to pull verified vehicle history for underwriting
- Dealers to query vehicle status programmatically
- Third-party workshop POS systems to push service records to VPM

API access requires OAuth 2.0 partner authentication and is priced per-call for enterprise tiers.

---

## 14. Non-Functional Requirements

### 14.1 Performance

- API response time: < 300ms for 95th percentile under normal load
- Vehicle Passport Report generation: < 5 seconds
- Platform availability: 99.9% uptime SLA (< 8.7 hours downtime per year)
- Support up to 100,000 concurrent users at peak (Y2 scale)

### 14.2 Security

- All PII (IC numbers, phone numbers) encrypted at rest (AES-256)
- All data in transit over TLS 1.3
- Role-based access control (RBAC) enforced at API layer
- SOC 2 Type II compliance target (Y2)
- Regular penetration testing (bi-annual)
- PDPA Malaysia compliance mandatory from Day 1

### 14.3 Data Privacy (PDPA Compliance)

- Users must consent to data collection at registration
- Data sharing with third parties (dealers, insurers) requires explicit per-request consent
- Right to data export (JSON / PDF) available to all users
- Right to deactivate account (data retained for statutory period, then anonymised)
- Data Processing Notice published and versioned

### 14.4 Accessibility & Localisation

- Platform available in Bahasa Malaysia and English
- Mobile-first responsive design
- Minimum WCAG 2.1 AA compliance
- Supports Android 9.0+ and iOS 14+

### 14.5 Scalability

- Microservices architecture to allow independent scaling of modules
- Database read replicas for report generation workloads
- CDN for static assets and report PDF delivery
- Horizontal auto-scaling on AWS ECS / EKS

---

## 15. Monetisation Strategy

### 15.1 Subscription Plans

**Plan 1 — Owner Basic (Free)**

- 1 vehicle
- Manual entry for service and repair records
- Road tax and insurance expiry reminders
- 1 Passport Report per year

**Plan 2 — Owner Plus (RM 9.90 / month or RM 99 / year)**

- Up to 5 vehicles
- Full document vault (5 GB)
- Unlimited Passport Report generation
- Loan tracker with bank integration (Phase 2)
- EV module access
- Priority support

**Plan 3 — Workshop Starter (RM 99 / month)**

- Up to 500 customer records
- Digital job cards and CRM
- Service reminder messaging (500 messages/month)
- Basic analytics
- 5 Passport Report credits/month
- VPM Workshop Partner badge

**Plan 4 — Workshop Professional (RM 249 / month)**

- Unlimited customer records
- Parts inventory tracker
- Invoicing module
- Unlimited service reminder messages
- Full analytics dashboard
- 20 Passport Report credits/month
- WhatsApp Business API integration
- Multi-staff logins (up to 10)

**Plan 5 — Dealer (RM 399 / month)**

- 30 Passport Report credits/month (additional RM 15 each)
- Batch vehicle lookup (up to 50 plates/month)
- VPM Verified Dealer badge for listings
- Trade-in assessment toolkit
- API access for listing integration

**Plan 6 — Insurance Partner (Custom / Enterprise)**

- White-label vehicle risk profile API
- Portfolio renewal management
- Bulk report access
- Claims data cross-reference
- Dedicated account manager

### 15.2 Transactional Revenue

- Pay-per-report (non-subscribers): RM 25 per report
- Bulk report packs: RM 200 for 10 reports, RM 350 for 20 reports
- Document storage upgrade: RM 15/month for additional 10 GB

### 15.3 Revenue Projections (Conservative)

| Revenue Stream | Month 12 | Month 24 |
|---|---|---|
| Owner subscriptions | RM 35,000 | RM 180,000 |
| Workshop subscriptions | RM 60,000 | RM 400,000 |
| Dealer subscriptions | RM 25,000 | RM 200,000 |
| Insurance enterprise | RM 15,000 | RM 150,000 |
| Pay-per-report | RM 20,000 | RM 150,000 |
| **Total MRR** | **RM 155,000** | **RM 1,080,000** |

---

## 16. Go-to-Market Strategy

### 16.1 Phase 1 — Anchor the Workshop Network (Months 1–6)

Workshops are the highest-value growth lever. Each workshop onboarded brings with it hundreds of vehicle owners and their service data. Strategy:

- Target independent workshops in the Klang Valley, Penang, and Johor Bahru first.
- Offer a 3-month free trial for Workshop Starter plan.
- Deploy a field sales team and partner with workshop associations (PEKA, MVMA, and independent mechanics' guilds).
- For every service record logged by a workshop, the vehicle owner receives a free VPM Owner Basic account with that record pre-populated — creating a viral owner acquisition loop.
- Partner with workshop POS vendors (AutoSoft, myWorkshop) to offer VPM integration plugins.

### 16.2 Phase 2 — Activate the Dealer Channel (Months 4–9)

- Partner with used-car dealer associations (PAAB, PEDA).
- Offer a free "Dealer Report Pack" (5 free reports) to any dealer who registers.
- Launch a "VPM Verified" listing badge integration with Mudah.my, CarList.my, and iCar.

### 16.3 Phase 3 — Insurance & Institutional Partnerships (Months 7–18)

- Engage the top 5 general insurers (Allianz, Etiqa, AXA Affin, Zurich, Berjaya Sompo) with a data partnership proposal.
- Position VPM vehicle history as an underwriting tool — reduce fraud and improve pricing accuracy.
- Explore co-branding with insurer renewal portals.

### 16.4 Digital & Content Marketing

- SEO content targeting "semak sejarah kereta Malaysia", "cara jual kereta second hand", "workshop near me" queries.
- YouTube tutorial series in Bahasa Malaysia covering how to use VPM.
- TikTok and Instagram short-form videos targeting younger car buyers.
- Google and Meta paid ads targeting car owners aged 25–50.
- Referral programme: Owner earns 1 month free for each friend who subscribes.

---

## 17. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| JPJ / government API access denied or delayed | Medium | High | Build manual entry fallback; engage MITI/MDEC for GovTech facilitation |
| Low workshop adoption due to tech resistance | High | High | Offer WhatsApp-based job card submission as ultra-simple onboarding; deploy in-person training |
| Data accuracy concerns from dealers / insurers | Medium | High | Implement data confidence score and source tagging; clear disclaimers on owner-declared data |
| PDPA non-compliance or data breach | Low | Critical | Engage legal counsel early; build PDPA consent framework into MVP; annual security audit |
| Competitor (e.g., Carsome) replicates feature set | Medium | Medium | Build network-effect moat fast; exclusive workshop partnerships; lock in insurer API deals |
| Vehicle owner reluctance to share IC-linked data | High | Medium | Offer IC-free registration (plate + phone only) for basic tier; transparent privacy policy |
| Slow monetisation from free tier heavy users | Medium | Medium | Cap free tier features aggressively; time-limit free trial for workshop plan |

---

## 18. Roadmap

### Phase 0 — Discovery & Foundation (Month 0–2)

- Finalise PRD and technical architecture
- Complete branding and design system
- Secure 10 pilot workshops for co-design sessions
- Apply for MyEG and JPJ API access
- Register company and engage PDPA legal counsel
- Hire: CTO, 2 full-stack engineers, 1 UI/UX designer, 1 BD executive

### Phase 1 — MVP Launch (Month 3–6)

**Deliverables:**
- Vehicle profile creation (plate, make, model, year, fuel type)
- Manual service record entry (owner and workshop)
- Road tax and insurance expiry reminders (email + SMS)
- Digital job card (workshop module)
- Basic CRM (customer list, vehicle roster)
- Vehicle Passport Report generation (PDF, sections A–G)
- Owner Basic (free) and Workshop Starter plans live
- Mobile-responsive web app (iOS and Android PWA)

**Launch Goal:** 50 workshops onboarded, 2,000 vehicles registered

### Phase 2 — Growth & Enrichment (Month 7–12)

**Deliverables:**
- Native iOS and Android apps (React Native)
- EV Module (battery SoH, charge log, OTA updates)
- Dealer module and bulk report purchase
- WhatsApp Business API reminders
- Service reminder engine with campaign analytics
- Parts inventory tracker
- MyEG road tax integration (live status pull)
- Puspakom data feed (pilot)
- Owner Plus and Workshop Professional plans live
- VPM Verified listing badge (Mudah.my integration)

**Launch Goal:** 500 workshops, 30,000 vehicles, 200 dealers

### Phase 3 — Intelligence & Expansion (Month 13–24)

**Deliverables:**
- Insurance partner module (Allianz / Etiqa pilot)
- Loan tracker with bank API (Maybank pilot)
- OCR document auto-extraction
- VPM Open API for enterprise partners
- OBD2 telematics integration (EV SoH real-time)
- Multi-language support (Mandarin)
- Fleet management module (for corporate clients)
- Advanced workshop analytics and forecasting

**Launch Goal:** 3,000 workshops, 300,000 vehicles, 3 insurer partners, RM 1M+ MRR

---

## 19. Appendix

### 19.1 Glossary

| Term | Definition |
|---|---|
| VPM | Vehicle Passport Malaysia — the platform name |
| VIN | Vehicle Identification Number — unique chassis identifier |
| NCD | No-Claim Discount — insurance benefit for claim-free years |
| SoH | State of Health — battery capacity as % of original rating (EV) |
| ICE | Internal Combustion Engine |
| BEV | Battery Electric Vehicle |
| PHEV | Plug-in Hybrid Electric Vehicle |
| JPJ | Jabatan Pengangkutan Jalan — Malaysia's Road Transport Department |
| Puspakom | Pusat Pemeriksaan Kenderaan Berkomputer — vehicle inspection authority |
| PIAM | Persatuan Insurans Am Malaysia — General Insurance Association |
| PDPA | Personal Data Protection Act 2010 (Malaysia) |
| SST | Sales and Service Tax |
| OBD2 | On-Board Diagnostics (Generation 2) — vehicle diagnostics port |
| OTA | Over-the-Air — remote software updates for EVs |

### 19.2 Regulatory References

- Personal Data Protection Act (PDPA) 2010 — Malaysia
- Road Transport Act 1987 — Malaysia
- Financial Services Act 2013 — Malaysia
- Insurance Act 1996 / Islamic Financial Services Act 2013
- Motor Vehicle (Construction and Use) Rules 1959

### 19.3 Key Stakeholder References

- Jabatan Pengangkutan Jalan (JPJ): www.jpj.gov.my
- Puspakom: www.puspakom.com.my
- MyEG Services: www.myeg.com.my
- PIAM: www.piam.org.my
- MDEC (Malaysia Digital Economy Corporation): www.mdec.my

### 19.4 Assumptions

- MyEG API access can be obtained through commercial partnership or government facilitation.
- At least 10 workshops agree to pilot the platform pre-launch.
- VPM does not store or process JPJ MyKad biometric data — only IC number as an identifier.
- All financial data (loan balances) in Phase 1 is owner-declared, with no direct bank connectivity.
- Platform will be hosted in AWS ap-southeast-1 (Singapore) until AWS Malaysia Region capacity permits primary deployment locally.

---

*Document prepared by the Vehicle Passport Malaysia Product Team.*  
*For enquiries, contact: product@vehiclepassport.my*  
*Version 1.0 — June 2026*
