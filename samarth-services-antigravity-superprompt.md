# SUPER PROMPT — Samarth Services (Direct Implementation)
### Paste this entire document into Antigravity IDE as your build instruction

> **Note on scope change:** The original brief called this a "UI/UX prototype" with no backend. This prompt assumes you now want a **real, working web application** (data actually persists, calculations actually run, CRUD actually works) — not just a visual mockup. Reminder *sending* (WhatsApp/SMS) and Festival Greeting *sending* remain **UI-only simulations** (no real messages sent), since that requires paid third-party APIs and business account approval. Everything else should be fully functional. If you actually want zero backend, tell the agent to swap the "Data Layer" section for local component state only.

---

## 1. ROLE & OBJECTIVE

You are a senior full-stack engineer and product designer. Build **Samarth Services**, a rent agreement (Leave & License) management web application for small agencies, legal consultants, and property offices. The app replaces Excel/paper tracking with a centralized system that stores agreements, auto-calculates expiry dates, and visually manages renewal follow-ups.

Build this as a **fully functional web application**, not a static mockup. Every screen listed below must be wired to real, working logic (add/edit/delete/search/filter/calculate), backed by a real data layer.

---

## 2. TECH STACK (final — do not substitute without a stated reason)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)**, TypeScript, strict mode | One deployable project, server + client in one codebase, easy to host (Vercel or any Node host) |
| Styling | **Tailwind CSS** + **shadcn/ui** primitives (unstyled-then-themed, not used as-is) | Fast to build with, but must be re-skinned per §3 — see the "no AI-slop" rules below |
| Icons | **lucide-react only** — no emojis anywhere in the UI | Consistent stroke weight, scalable, recolorable via CSS |
| Font | **Self-hosted variable font**, not a default Tailwind/shadcn pairing (see §3) | Avoid the "every AI app looks the same" font problem |
| Data layer | **Supabase** (Postgres + auto REST + realtime) | Real persistence with minimal backend code. Fallback: local SQLite via Prisma, or browser `localStorage`-backed store if the user explicitly wants zero backend |
| Forms & validation | **react-hook-form + zod** | Real inline validation, not just visual form fields |
| Dates | **date-fns** | Reliable calendar-month math for expiry calculation |
| Data fetching/cache | **TanStack Query** | Real loading/error states, not fake skeletons over static data |
| Charts | **recharts** | Dashboard trend chart only — keep charts minimal, not decorative |
| Export | **papaparse** (CSV) + browser-native `Blob` download, plus a simple PDF export via **jspdf + jspdf-autotable** for a printable agreement summary | Covers "download data whenever required" (see §6.8) |

Single deployable Next.js project. No microservices. Auth is simple email/password (Supabase Auth) — agencies are small single-tenant businesses, but design the schema so multiple staff logins can share one agency's data.

---

## 3. UI/UX PHILOSOPHY — READ BEFORE STYLING ANYTHING

**Function first, always.** Every screen must work correctly before it looks polished. Do not spend effort on decorative animation, gradients, glassmorphism, or illustration if the underlying CRUD/calculation logic isn't solid. If a tradeoff has to be made, choose the uglier-but-working version.

**Explicitly avoid "AI-generated app" tells:**
- No purple-to-blue or pastel-rainbow gradients anywhere.
- No default shadcn look left unstyled ("theme: zinc" out of the box) — retheme it per the tokens below.
- No emoji used as UI elements (status, buttons, empty states, nav) — **use lucide-react icons exclusively.** e.g. `CheckCircle2` for Active, `Clock`/`AlertTriangle` for Expiring Soon, `XCircle` for Expired.
- No generic "Inter/Roboto everywhere" look with oversized rounded-full buttons and floating card shadows on every element. Use shadow and radius selectively — mainly on primary content cards, not on every chip, badge, and input.
- No filler illustration/hero graphics on functional screens (dashboard, forms, lists). Illustration, if any at all, belongs only on the empty-state or login screen, and should be simple line art, not stock AI-image style art.
- No stock marketing copy ("Empower your business," "Seamless experience") in the actual product UI — labels should be plain and task-specific ("Add Agreement," not "Get Started Effortlessly").

**Interactivity requirements (the app should feel alive, not static):**
- Inline, real-time feedback: expiry date recalculates and displays as the user types the start date/duration, before they submit.
- Optimistic UI updates on add/edit/delete (update the list immediately, roll back on error) rather than full-page reloads.
- Hover and focus states on every interactive element (not just buttons — table rows, cards, filter chips too).
- Keyboard support: forms fully tabbable, Escape closes dialogs, Enter submits.
- Toasts for confirmations (save, delete, export, simulated send) — small, dismissible, not blocking modals for routine actions.
- Filter chips and search should update results live (debounced), not require a "Search" button click.
- Skeleton loaders that match the real layout shape, not generic spinners, for any data fetch.

**Visual tokens (concrete, not vibes):**
- **Background:** White (`#FFFFFF`)
- **Surface / cards:** Soft gray (`#F7F7F8` / `#F1F1F3`), border `#E5E5E7`, not just shadow-only cards
- **Accent (brand):** Warm yellow (`#F5B301`) — buttons, active nav item, focus rings, key highlights only. Never as a large background fill; check contrast (WCAG AA) for any text on yellow.
- **Status colors (paired with icons, never color-alone):**
  - Active → green `#16A34A` + `CheckCircle2` icon
  - Expiring Soon → amber `#D97706` + `Clock` icon
  - Expired → red `#DC2626` + `XCircle` icon
- **Typography:** Self-host a distinctive but highly readable variable font — e.g. **Public Sans, Source Sans 3, or IBM Plex Sans** rather than the default Inter/Geist pairing every AI-built app reaches for. Establish a real type scale (e.g. 12/14/16/20/28/36px) and use it consistently — don't eyeball sizes per component.
- **Cards:** `rounded-xl` (not maximally rounded), subtle 1px border over heavy shadow, consistent padding scale (8/12/16/24px).
- **Icons:** lucide-react only, consistent 20px/24px sizing, consistent stroke width (1.5 or 2, pick one and keep it everywhere).
- **Whitespace:** Generous but not wasteful — dense enough that a staff member managing 200+ agreements isn't scrolling excessively; switch to cards only where it genuinely helps (mobile), keep an efficient table on desktop.
- **Motion:** Fast (150–200ms), purposeful transitions only on state change (open/close, hover, status change) — never animate purely for show.

Build a `theme.ts`/Tailwind config with these as design tokens so colors, spacing, and type scale are consistent app-wide, not hardcoded per component.

---

## 4. INFORMATION ARCHITECTURE (Screens)

1. **Login** (simple email/password)
2. **Dashboard** (home)
3. **Agreements List** (with search & filter)
4. **Agreement Detail / Customer Details view**
5. **Add / Edit Agreement** (form)
6. **Reminders** (upcoming reminders queue — UI simulation of sending)
7. **Festival Greetings** (broadcast composer — UI simulation of sending)
8. **Settings** (agency profile, basic — optional if time allows)

Persistent layout: left sidebar nav on desktop/tablet, bottom nav or hamburger drawer on mobile. Top bar with search + "Add Agreement" quick action visible from every screen.

---

## 5. DATA MODEL

```
Agreement
- id (uuid)
- tenant_name (string, required)
- tenant_mobile (string, required, validated as phone)
- owner_name (string, required)
- owner_mobile (string, required, validated as phone)
- property_address (text, required)
- rent_amount (number, required)
- security_deposit (number, required)
- start_date (date, required)
- duration_months (number, required, default 11)
- expiry_date (date, AUTO-CALCULATED = start_date + duration_months, stored for query performance but recomputed on edit)
- status (enum: active | expiring_soon | expired — DERIVED, not manually set, see logic below)
- created_at, updated_at

ReminderLog (UI-only simulation, but still store the log for realism)
- id
- agreement_id (fk)
- type (30_day | 7_day | on_expiry)
- channel (whatsapp | sms)
- recipient (tenant | owner)
- sent_at (timestamp)
- status (simulated_sent) -- no real message is sent

GreetingLog (UI-only simulation)
- id
- occasion (string, e.g. "Diwali")
- channel (whatsapp | sms)
- recipient_group (all | active_only | custom_selection)
- sent_at (timestamp)
```

**Expiry calculation logic (must be real, not decorative):**
```
expiry_date = start_date + duration_months (calendar months, not 30-day blocks)
```
Example: Start 15 Jan 2026, Duration 11 months → Expiry 14 Dec 2026 (last day before the 15th of the 12th month).

**Status derivation logic (recompute on every read, don't trust a stale stored value):**
```
today = current date
if today > expiry_date            → "expired"
else if expiry_date - today <= 30 days → "expiring_soon"
else                                → "active"
```

---

## 6. FEATURE SPECS

### 6.1 Dashboard
- Summary cards: Total Agreements, Active, Expiring Soon (≤30 days), Expired — all counts computed live from real data, not hardcoded.
- Recent Agreements list (last 5–10 added/edited), clickable to detail view.
- A simple chart (recharts) showing agreements by status or agreements expiring over the next 90 days by week/month.
- Clicking a summary card filters the Agreements List accordingly.

### 6.2 Agreement Management
- **List view:** card or table layout (responsive: table on desktop, cards on mobile) showing tenant name, owner name, property (truncated), expiry date, status badge.
- **Add Agreement:** form with all required fields, client-side validation (zod), auto-preview of calculated expiry date as the user types start date + duration.
- **Edit Agreement:** same form pre-filled; recalculates expiry on save.
- **Delete Agreement:** confirmation dialog before delete.
- **Detail view:** full customer info, property details, agreement timeline (visual: start → today → expiry, e.g. a progress bar), reminder history (from ReminderLog), status badge, edit/delete actions.

### 6.3 Status Badges
- Active / Expiring Soon / Expired — each shown as a colored pill with its paired **lucide-react icon** (`CheckCircle2` / `Clock` / `XCircle`, see §3), never emoji, never color-only (for accessibility). Computed live per §5, shown consistently across dashboard, list, and detail views. Never let the badge be manually overridden by a user — it's always derived from dates.

### 6.4 Reminder System (UI simulation, but functionally wired to real data)
- A "Reminders" screen listing agreements needing a reminder today, grouped by 30-day / 7-day / on-expiry buckets — computed live from real expiry dates.
- Each row has "Send via WhatsApp" / "Send via SMS" buttons. Clicking one writes a row to `ReminderLog` (simulated_sent) and shows a success toast — but does **not** call any real messaging API.
- Reminder history shows in the Agreement Detail view, pulled from `ReminderLog`.
- Clearly label this section "Reminder simulation — no real messages are sent" somewhere visible, so it's not mistaken for live functionality later.

### 6.5 Festival Greetings (UI simulation)
- Screen to compose a greeting: pick occasion (preset list: Diwali, Ganesh Chaturthi, New Year, Holi, custom), pick recipient group (All / Active only / custom multi-select from agreement list), pick channel (WhatsApp/SMS), write/edit message text (with a default template per occasion).
- "Send" button logs to `GreetingLog` and shows a success summary ("Simulated send to 42 contacts") — no real send.

### 6.6 Search & Filter
- Real, functional search box (debounced) across tenant name, owner name, mobile number — filters the Agreements List live.
- Filter chips/tabs: All / Active / Expiring Soon / Expired — combinable with search.
- URL should reflect filter/search state (query params) so it's shareable/bookmarkable.

### 6.8 Data Export / Download
- On the **Agreements List**, a persistent "Export" button (with a `Download` lucide icon) that exports the **currently filtered/searched view** — not always all data — so a user can filter to "Expiring Soon" then export just that subset.
- Export formats: **CSV** (all fields from §5, for use in Excel) and **PDF** (a clean printable table, via jspdf-autotable) — offered as a small dropdown from the Export button, not a separate page.
- On the **Agreement Detail** view, a "Download Summary" action that exports a single-agreement PDF (tenant/owner/property/dates/status) — useful for printing or sharing with a customer.
- No login-gated "request export" flow — it's an instant client-side download, since this is core, frequently-needed functionality, not a premium feature.
- File names should be descriptive and dated, e.g. `samarth-agreements-expiring-soon-2026-07-13.csv`.

### 6.7 Responsive Design
- Must genuinely work at mobile (375px), tablet (768px), and desktop (1280px+) breakpoints — test each screen at each size, not just the dashboard.
- Sidebar collapses to bottom nav or drawer on mobile.
- Tables convert to stacked cards on small screens.

---

## 7. NON-FUNCTIONAL REQUIREMENTS

- Form validation errors shown inline, not just alerts.
- Loading states (skeletons) for data fetches, not blank screens.
- Empty states designed (e.g. "No agreements yet — add your first one") — not just blank lists.
- Basic accessibility: proper labels, sufficient color contrast (especially yellow accent on white — check WCAG AA), keyboard-navigable forms.
- No console errors; type-safe end to end (TypeScript strict mode).

---

## 8. BUILD ORDER (tell the agent to work in this sequence)

1. Scaffold Next.js + TypeScript + Tailwind + shadcn/ui project, set up design tokens from §3.
2. Set up data layer (Supabase project + schema from §5, or fallback per §2).
3. Build layout shell: sidebar/nav + top bar, responsive breakpoints.
4. Build Agreement CRUD (list, add, edit, delete, detail) with real expiry-calculation and status-derivation logic — this is the core; get it fully correct before moving on.
5. Build Dashboard (depends on step 4's data being real).
6. Build Search & Filter on the Agreements List.
7. Build Reminders screen (simulation, but reads real expiry data).
8. Build Festival Greetings screen (simulation).
9. Build Data Export (CSV + PDF, list-level and single-agreement) per §6.8.
10. Polish: empty states, loading states, mobile pass on every screen, accessibility pass, remove any leftover default-shadcn/emoji/gradient artifacts per §3.
11. Final QA: test the expiry-calculation edge cases (month-end dates, leap years, durations other than 11 months).

---

## 9. ACCEPTANCE CHECKLIST

- [ ] Adding an agreement with Start Date + Duration correctly auto-calculates and displays Expiry Date
- [ ] Status badge changes correctly as dates pass (test by adding agreements with past/near/far expiry dates)
- [ ] Editing an agreement recalculates expiry and status
- [ ] Deleting an agreement asks for confirmation and actually removes it
- [ ] Dashboard counts match actual data, live
- [ ] Search returns correct results across tenant/owner/mobile fields
- [ ] Filters (Active/Expiring/Expired/All) work and combine correctly with search
- [ ] Reminder screen correctly buckets agreements into 30-day/7-day/on-expiry groups
- [ ] Sending a simulated reminder logs to history and appears in Agreement Detail
- [ ] Festival Greeting composer sends to the correct recipient group (simulated) and logs it
- [ ] All screens usable at 375px, 768px, and 1280px+ widths
- [ ] No hardcoded/fake dashboard numbers — everything derived from real stored data
- [ ] Export button on Agreements List respects current filter/search and produces a correct CSV and PDF
- [ ] Single-agreement PDF download works from Detail view
- [ ] No emojis anywhere in the UI — only lucide-react icons
- [ ] No default/unstyled shadcn look, no purple-blue gradients, no stock illustration on functional screens
- [ ] Font is a deliberately chosen readable sans-serif, not left as default Inter/Geist
- [ ] Expiry date live-updates in the Add/Edit form as start date/duration change, before submit
- [ ] List/table updates optimistically on add/edit/delete without a full page reload

---

*End of super prompt. Paste as-is into Antigravity IDE, or trim the Data Layer section in §2 if you'd rather start local-only.*
