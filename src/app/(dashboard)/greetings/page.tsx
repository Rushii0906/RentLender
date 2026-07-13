import { db } from "@/lib/db";
import GreetingsComposerClient from "@/components/greetings/GreetingsComposerClient";

export const revalidate = 0; // Disable server cache for real-time history logging

export default async function GreetingsPage() {
  const agreements = await db.agreement.findMany({
    orderBy: { tenantName: "asc" },
  });

  const logs = await db.greetingLog.findMany({
    orderBy: { sentAt: "desc" },
  });

  return (
    <GreetingsComposerClient
      agreements={agreements}
      logs={logs}
    />
  );
}
