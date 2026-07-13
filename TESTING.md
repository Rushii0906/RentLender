# Test Strategy and Verification Documentation

This document describes the validation strategy, test cases, and quality checks for **Samarth Services**.

---

## 1. Expiry Calculation Test Matrix (Unit Tests)

The core business logic of date-based expiry and contract state derivation must be tested thoroughly.

### 1.1 Expiry Date Calculations
We calculate the expiry date as:
$$\text{Expiry Date} = \text{StartDate} + \text{DurationMonths} - 1\text{ Day}$$

| Scenario | Input Start Date | Input Duration | Expected Expiry Date | Reasoning |
|---|---|---|---|---|
| **Standard 11 Months** | 2026-01-15 | 11 months | **2026-12-14** | Last day of the 11th calendar month (calculated as 15th of Dec minus 1 day). |
| **Full Year Leap Year** | 2024-02-29 | 12 months | **2025-02-28** | Standard 12-month extension ending on non-leap year February's last day. |
| **Leap Year Crossing** | 2023-03-01 | 12 months | **2024-02-29** | Ends on leap day since the next year is a leap year. |
| **Month-End Boundary** | 2026-10-31 | 4 months | **2027-02-27** or **2027-02-28** | Adding 4 months reaches Feb 31 (which is corrected to Feb 28). |
| **Short Duration** | 2026-06-01 | 1 month | **2026-06-30** | Last day of June. |

### 1.2 Derived Status Calculations
Based on Today = **2026-07-13**:

| Expiry Date | Expected Status | Reasoning |
|---|---|---|
| **2026-07-10** | `expired` | Expiry date is in the past. |
| **2026-07-13** | `expiring_soon` | Expires today. |
| **2026-08-10** | `expiring_soon` | Expires in 28 days (≤ 30 days). |
| **2026-08-12** | `expiring_soon` | Expires in 30 days (≤ 30 days). |
| **2026-08-13** | `active` | Expires in 31 days (> 30 days). |
| **2027-06-01** | `active` | Far in the future. |

---

## 2. Form & Validation Checks

### 2.1 Zod Schema Constraints (`src/lib/validation.ts`)
- **Tenant Name / Owner Name**: String, minimum 2 characters, maximum 100 characters. No trailing spaces.
- **Tenant Mobile / Owner Mobile**: Validated using regex `^[6-9]\d{9}$` (Valid Indian phone number format: starts with 6, 7, 8, or 9 and is exactly 10 digits).
- **Rent / Deposit**: Positive numeric values. Rent > 0, Deposit ≥ 0.
- **Start Date**: Must be a valid date.
- **Duration**: Positive integer between 1 and 60 (months).

---

## 3. Interactive UI Integration Flow Tests

### 3.1 Expiry Live Preview
- **Trigger**: Change Start Date value to `2026-08-01` and Duration to `11`.
- **Expected Outcome**: Expiry Date field under the input updates instantly to `2026-07-31` (greyed out or marked as preview).

### 3.2 Search and Multi-Filtering
- **Action**: Input `98765` in search. Select "Expiring Soon" chip.
- **Expected Outcome**: Agreements where tenant or owner mobile contains `98765` AND status is `expiring_soon` are filtered. URL matches `/agreements?search=98765&status=expiring_soon`.

### 3.3 Reminder Logs Persistence
- **Action**: On the reminders queue, click "Send via SMS" for Agreement UUID `ABC`.
- **Expected Outcome**: A `ReminderLog` record is inserted:
  - `agreement_id`: `ABC`
  - `type`: Matches the bucket the agreement is in (e.g. `30_day`)
  - `channel`: `sms`
  - `recipient`: `tenant`
  - `status`: `simulated_sent`
- **Result Verification**: Navigate to `/agreements/ABC`. The reminder log timeline section must now render a new row: "SMS reminder (30-day alert) sent on [Current Date]".

---

## 4. Manual QA Test Procedure

To verify the app is ready for production, follow this protocol:

1. **Clean DB State Setup**: Run `npx prisma db seed` or clear tables.
2. **Add Agreement Verification**:
   - Create Tenant: "Amit Sharma", Landlord: "Sunita Patil".
   - Start: Today, Duration: `11`. Expiry should preview `Today + 11 Months - 1 Day`.
   - Save. Verify Toast notification appears. Redirects to details page.
3. **Filter & Search Verification**:
   - Go to list page. Add text "Amit". Confirm "Amit Sharma" is listed.
   - Change filter tabs. Verify page does not reload fully but list updates dynamically.
4. **Data Exports Verification**:
   - Filter to "Active" status. Click "Export" -> "Export CSV". Open CSV file in Excel/text editor. Verify only active items are included.
   - Click "Export" -> "Export PDF List". Verify a clean PDF table downloading.
5. **Mobile Viewport Test**:
   - Open browser developer tools. Toggle device emulation to Mobile (e.g. iPhone 12 Pro - 390px).
   - Verify sidebar collapses and becomes bottom/drawer menu.
   - Verify agreements table changes to stacked cards.
