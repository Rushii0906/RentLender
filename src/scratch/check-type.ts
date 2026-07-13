import { agreementFormSchema } from "../lib/validation";
import { z } from "zod";

type Inferred = z.infer<typeof agreementFormSchema>;
console.log("Inferred keys and types:");
// print type keys
const mock: Inferred = {
  tenantName: "A",
  tenantMobile: "9876543210",
  ownerName: "B",
  ownerMobile: "9876543210",
  propertyAddress: "C",
  rentAmount: 10,
  securityDeposit: 20,
  startDate: "2026-01-01",
  durationMonths: 11,
};

console.log("Mock object matches Inferred type perfectly!", mock);
