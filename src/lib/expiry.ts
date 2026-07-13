import { addMonths, subDays, differenceInCalendarDays, startOfDay } from "date-fns";

/**
 * Calculates the expiry date of an agreement:
 * Start Date + Duration Months - 1 Day (using calendar months).
 * 
 * Example:
 * Start: 2026-01-15, Duration: 11 months -> Expiry: 2026-12-14
 */
export function calculateExpiryDate(startDate: Date | string, durationMonths: number): Date {
  const start = new Date(startDate);
  
  // Normalize to UTC values to prevent timezone shifts
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth();
  const d = start.getUTCDate();
  
  const utcStart = new Date(Date.UTC(y, m, d));
  
  // Check if it is the last day of its month in UTC
  const nextDay = new Date(Date.UTC(y, m, d + 1));
  const isStartLastDayOfMonth = nextDay.getUTCMonth() !== utcStart.getUTCMonth();

  const targetDate = addMonths(utcStart, durationMonths);

  if (isStartLastDayOfMonth) {
    const targetYear = targetDate.getUTCFullYear();
    const targetMonth = targetDate.getUTCMonth();
    // Setting day to 0 in UTC gets the last day of targetMonth
    return new Date(Date.UTC(targetYear, targetMonth + 1, 0));
  } else {
    return subDays(targetDate, 1);
  }
}

/**
 * Derives the agreement status based on the current date relative to the expiry date:
 * - If current date is strictly after expiry -> expired
 * - If expiry date is within 30 days of today -> expiring_soon
 * - Otherwise -> active
 */
export function getAgreementStatus(expiryDate: Date | string, relativeToDate: Date = new Date()): 'active' | 'expiring_soon' | 'expired' {
  const expiry = startOfDay(new Date(expiryDate));
  const today = startOfDay(relativeToDate);

  if (today > expiry) {
    return 'expired';
  }
  
  const daysDifference = differenceInCalendarDays(expiry, today);
  if (daysDifference <= 30) {
    return 'expiring_soon';
  }
  
  return 'active';
}
