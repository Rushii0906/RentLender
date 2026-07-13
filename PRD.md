# Product Requirements Document (PRD) - Samarth Services

## 1. Executive Summary
**Samarth Services** is a Leave & License rent agreement management web application designed for small real estate agencies, legal consultants, and property office staff. It replaces manual paper-based tracking and spreadsheet management with a structured, automated system that keeps track of active leases, calculates expiration dates, and coordinates renewal outreach.

---

## 2. Problem Statement
Small real estate agencies and legal consultants in India manage hundreds of leave and license rent agreements. 
- **Inefficient Tracking**: Excel spreadsheets require manual updates and are prone to date-calculation errors.
- **Missed Renewals**: Without proactive alerts, agents miss agreement expirations, leading to lost brokerage/service fee opportunities.
- **Manual Communication**: Staff manually check dates, construct individual SMS/WhatsApp messages, and search contacts for outreach.
- **No Consolidated PDF Summaries**: Generating a clean summary sheet of an agreement to print or share with owners/tenants requires re-typing details.

---

## 3. Core Objectives
1. **Centralize Data**: Store tenant, landlord, property, financial, and date parameters in a relational model.
2. **Automate Dates & Status**: Calculate contract expirations reliably using standard calendar-month rules and derive active/expiring/expired statuses automatically.
3. **Streamline Renewal Follow-ups**: Provide a unified queue where agents can quickly trigger simulated messages to landlords/tenants.
4. **Enable Instant Exports**: Support filtered CSV exports for office records and PDF layout exports (both tabular and single agreement summaries) for direct printing or sharing.

---

## 4. User Personas
### Primary User: Agency Operations Staff / Consultant
- **Needs**: Simple database entry, fast search by name or mobile number, clear alerts on what is expiring within the next 30 days, quick tools to notify parties.
- **Tech Literacy**: Moderate. Prefers straightforward, dense layouts (tables on desktop) where they can see many rows at once, over heavily padded designs.

---

## 5. Functional Requirements

### 5.1 Authentication
- Simple email/password sign-in.
- Multi-user capability (different staff logins sharing a single agency's database).

### 5.2 Dashboard
- **Live Metrics**: Total Agreements, Active Agreements, Expiring Soon (≤30 days), Expired Agreements.
- **Trend Visual**: Recharts-based timeline showing agreements expiring over the next 90 days.
- **Quick Links**: Clickable summary cards to filter the main agreements list.
- **Recent Activity**: List of the latest 5-10 added or modified agreements.

### 5.3 Agreement Management (CRUD)
- **Data Capture**: Tenant details, owner details, monthly rent, deposit, start date, and duration (defaulting to 11 months).
- **Automated Validation**: Inline checks for required fields and valid Indian phone numbers (10 digits).
- **Date Automation**: Live calculation of expiry date in the form prior to submission.
- **Optimistic UI Updates**: List items update immediately on add/edit/delete.

### 5.4 Live Expiry & Status Engine
- **Calendar Months Math**: Add duration to start date minus 1 day.
- **Derived Status**:
  - `expired` if current date > expiry date.
  - `expiring_soon` if expiry date - current date ≤ 30 days.
  - `active` otherwise.

### 5.5 Reminders Queue (Simulated)
- Aggregated list of upcoming expirations categorized by 30-day, 7-day, and on-expiry thresholds.
- Direct quick-action buttons: "Send via WhatsApp" and "Send via SMS".
- Real logging to `ReminderLog` database table for audit history, and display in the Agreement Detail view.

### 5.6 Festival Greetings Broadcast (Simulated)
- Visual template-based composer allowing text customisation.
- Recipient group targets: All contacts, Active only, or multi-select custom items.
- simulated log created in `GreetingLog`.

### 5.7 Search, Filtering, and Deep Linking
- Real-time text search matches tenant name, owner name, or mobile numbers.
- Filter filters by status: Active / Expiring Soon / Expired / All.
- URL state synchronization enables bookmarking and sharing pre-filtered list pages.

### 5.8 Data Portability
- **Filtered CSV Export**: Instant browser download containing all fields for the currently filtered set of agreements.
- **Filtered PDF Grid**: Tabular PDF summary of current list view via `jspdf-autotable`.
- **Single Agreement Summary PDF**: Formatted clean page layout downloadable directly from the agreement's detail view.

---

## 6. Non-Functional & UI/UX Requirements
- **Responsive Layout**: Table grids on desktop (≥1280px), collapsible sidebar and stacked card layouts on mobile (375px).
- **Clean Aesthetic**: White backgrounds, gray surfaces (`#F7F7F8`), and a warm yellow primary accent (`#F5B301`). 
- **Accessibility (a11y)**: Focus rings, standard HTML forms, and status badges that combine both color AND specific icons (`CheckCircle2`, `Clock`, `XCircle`) to ensure readability.
- **Zero AI-slop Indicators**: No random gradients, no unstyled generic components, and no emojis in user interfaces.
- **Keyboard Support**: Fully navigable forms via Tab/Enter and closable dialogs via Escape.
