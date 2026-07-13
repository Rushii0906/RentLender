import { calculateExpiryDate, getAgreementStatus } from "../lib/expiry";

function runTests() {
  console.log("=== RUNNING EXPIRY DATE CALCULATION TESTS ===");
  
  const expiryTests = [
    { start: "2026-01-15", duration: 11, expected: "2026-12-14" },
    { start: "2024-02-29", duration: 12, expected: "2025-02-28" },
    { start: "2023-03-01", duration: 12, expected: "2024-02-29" },
    { start: "2026-10-31", duration: 4,  expected: "2027-02-28" },
    { start: "2026-06-01", duration: 1,  expected: "2026-06-30" },
  ];

  let passed = true;

  for (const t of expiryTests) {
    const result = calculateExpiryDate(new Date(t.start), t.duration);
    const resultStr = result.toISOString().split("T")[0];
    if (resultStr === t.expected) {
      console.log(`✅ SUCCESS: Start ${t.start} + ${t.duration} months -> Expiry ${resultStr}`);
    } else {
      console.log(`❌ FAILED: Start ${t.start} + ${t.duration} months. Expected ${t.expected}, got ${resultStr}`);
      passed = false;
    }
  }

  console.log("\n=== RUNNING STATUS DERIVATION TESTS ===");
  const today = new Date("2026-07-13T12:00:00Z");

  const statusTests = [
    { expiry: "2026-07-10", expected: "expired" },
    { expiry: "2026-07-13", expected: "expiring_soon" },
    { expiry: "2026-08-10", expected: "expiring_soon" },
    { expiry: "2026-08-12", expected: "expiring_soon" },
    { expiry: "2026-08-13", expected: "active" },
    { expiry: "2027-06-01", expected: "active" },
  ];

  for (const t of statusTests) {
    const status = getAgreementStatus(new Date(t.expiry), today);
    if (status === t.expected) {
      console.log(`✅ SUCCESS: Expiry ${t.expiry} relative to 2026-07-13 -> ${status}`);
    } else {
      console.log(`❌ FAILED: Expiry ${t.expiry} relative to 2026-07-13. Expected ${t.expected}, got ${status}`);
      passed = false;
    }
  }

  if (passed) {
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.log("\n🚨 SOME TESTS FAILED!");
    process.exit(1);
  }
}

runTests();
