import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioSmsNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Initialize Twilio client if keys are provided
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface MessagePayload {
  to: string;
  body: string;
  channel: "sms" | "whatsapp";
}

export interface SendMessageResult {
  success: boolean;
  simulated: boolean;
  error?: string;
}

/**
 * Sends a message via Twilio or falls back to simulation mode if credentials are not configured.
 */
export async function sendTwilioMessage({ to, body, channel }: MessagePayload): Promise<SendMessageResult> {
  if (!client) {
    console.log(`[SIMULATION MODE ACTIVE]
Channel: ${channel.toUpperCase()}
To: ${to}
Body: "${body}"
`);
    return { success: true, simulated: true };
  }

  try {
    const cleanTo = to.replace(/\s+/g, "");
    const formattedTo = channel === "whatsapp" ? `whatsapp:${cleanTo}` : cleanTo;
    
    // Set standard WhatsApp sandbox/sender or SMS sender
    const rawFrom = channel === "whatsapp" ? twilioWhatsAppNumber : twilioSmsNumber;
    if (!rawFrom) {
      throw new Error(`Twilio sender number for ${channel} is not configured in environment variables.`);
    }
    const cleanFrom = rawFrom.replace(/\s+/g, "");
    const fromNumber = channel === "whatsapp" ? `whatsapp:${cleanFrom}` : cleanFrom;

    await client.messages.create({
      body: body,
      from: fromNumber,
      to: formattedTo,
    });

    console.log(`[REAL MESSAGE SENT] Channel: ${channel.toUpperCase()}, To: ${cleanTo}`);
    return { success: true, simulated: false };
  } catch (error: any) {
    console.error(`Failed to send message via Twilio:`, error);
    return { success: false, simulated: false, error: error.message || "Failed to send message" };
  }
}

/**
 * Formats a standardized reminder message based on the recipient, reminder type, and agreement details.
 */
export function formatReminderMessage({
  recipientName,
  propertyAddress,
  expiryDate,
  type,
}: {
  recipientName: string;
  propertyAddress: string;
  expiryDate: Date;
  type: string;
}): string {
  const formattedDate = new Date(expiryDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const baseAddress = propertyAddress.length > 50 
    ? `${propertyAddress.substring(0, 47)}...` 
    : propertyAddress;

  switch (type) {
    case "on_expiry":
      return `Dear ${recipientName}, this is a reminder from Samarth Services that the Leave and License rent agreement for "${baseAddress}" expires today (${formattedDate}). Please contact us to initiate the renewal process.`;
    case "7_day":
      return `Dear ${recipientName}, this is a reminder from Samarth Services that the Leave and License rent agreement for "${baseAddress}" will expire in 7 days on ${formattedDate}. Please contact us to initiate the renewal process.`;
    case "30_day":
    default:
      return `Dear ${recipientName}, this is a reminder from Samarth Services that the Leave and License rent agreement for "${baseAddress}" will expire in 30 days on ${formattedDate}. Please contact us to initiate the renewal process.`;
  }
}
