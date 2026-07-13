import { db } from "@/lib/db";
import { getAgreementStatus } from "@/lib/expiry";
import RemindersQueueClient from "@/components/reminders/RemindersQueueClient";

export const revalidate = 0; // Disable server cache to ensure real-time calculations

export default async function RemindersPage() {
  const agreements = await db.agreement.findMany({
    orderBy: { expiryDate: "asc" },
  });

  const today = new Date();
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const onExpiryList: any[] = [];
  const sevenDayList: any[] = [];
  const thirtyDayList: any[] = [];

  for (const ag of agreements) {
    const status = getAgreementStatus(ag.expiryDate, todayStart);
    if (status !== "expired") {
      const timeDiff = new Date(ag.expiryDate).getTime() - todayStart.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (daysRemaining === 0) {
        onExpiryList.push(ag);
      } else if (daysRemaining >= 1 && daysRemaining <= 7) {
        sevenDayList.push(ag);
      } else if (daysRemaining >= 8 && daysRemaining <= 30) {
        thirtyDayList.push(ag);
      }
    }
  }

  return (
    <RemindersQueueClient
      onExpiryList={onExpiryList}
      sevenDayList={sevenDayList}
      thirtyDayList={thirtyDayList}
    />
  );
}
