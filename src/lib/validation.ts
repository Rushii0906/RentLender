import { z } from "zod";

// Phone regex for valid Indian mobile numbers (starts with 6,7,8,9 and is 10 digits)
const mobileRegex = /^[6-9]\d{9}$/;

export const agreementFormSchema = z.object({
  tenantName: z
    .string()
    .min(2, "Tenant name must be at least 2 characters")
    .max(100, "Tenant name must not exceed 100 characters")
    .transform((val) => val.trim()),
  tenantMobile: z
    .string()
    .regex(mobileRegex, "Please enter a valid 10-digit Indian mobile number"),
  ownerName: z
    .string()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Owner name must not exceed 100 characters")
    .transform((val) => val.trim()),
  ownerMobile: z
    .string()
    .regex(mobileRegex, "Please enter a valid 10-digit Indian mobile number"),
  propertyAddress: z
    .string()
    .min(5, "Property address must be at least 5 characters")
    .transform((val) => val.trim()),
  rentAmount: z.coerce
    .number()
    .positive("Rent amount must be greater than 0"),
  securityDeposit: z.coerce
    .number()
    .nonnegative("Security deposit cannot be negative"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid start date",
    }),
  durationMonths: z.coerce
    .number()
    .int("Duration must be a whole number of months")
    .min(1, "Duration must be at least 1 month")
    .max(120, "Duration cannot exceed 120 months"),
});

export type AgreementFormValues = z.infer<typeof agreementFormSchema>;
