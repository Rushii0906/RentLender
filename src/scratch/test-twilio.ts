import { sendTwilioMessage } from "../lib/messaging";
import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function runTest() {
  console.log("=== DIAGNOSING TWILIO MESSAGE DISPATCH ===");
  console.log("Environment variables loaded:");
  console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "Found" : "Missing");
  console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Found" : "Missing");
  console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER || "Missing");
  console.log("TWILIO_WHATSAPP_NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER || "Missing");

  const testMobile = "+919011439112";

  console.log("\nAttempting to send test SMS to:", testMobile);
  const smsResult = await sendTwilioMessage({
    to: testMobile,
    body: "Test SMS from Samarth Services RentLender",
    channel: "sms",
  });
  console.log("SMS Result:", smsResult);

  console.log("\nAttempting to send test WhatsApp to:", testMobile);
  const whatsappResult = await sendTwilioMessage({
    to: testMobile,
    body: "Test WhatsApp message from Samarth Services RentLender",
    channel: "whatsapp",
  });
  console.log("WhatsApp Result:", whatsappResult);
}

runTest().catch((err) => {
  console.error("Unhandled test error:", err);
});
