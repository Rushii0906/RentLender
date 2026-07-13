import { db } from "@/lib/db";
import AgreementsListClient from "@/components/agreements/AgreementsListClient";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export const revalidate = 0; // Disable server cache for live list view filtering

export default async function AgreementsPage({ searchParams }: PageProps) {
  const { search, status } = await searchParams;

  const today = new Date();
  // Set today to start of day UTC for database query stability
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const where: any = {};

  // 1. Search Query mapping
  if (search) {
    where.OR = [
      { tenantName: { contains: search } },
      { tenantMobile: { contains: search } },
      { ownerName: { contains: search } },
      { ownerMobile: { contains: search } },
    ];
  }

  // 2. Status Date mapping
  if (status === "expired") {
    where.expiryDate = {
      lt: todayStart,
    };
  } else if (status === "expiring_soon") {
    const thirtyDaysLater = new Date(todayStart);
    thirtyDaysLater.setUTCDate(todayStart.getUTCDate() + 30);
    where.expiryDate = {
      gte: todayStart,
      lte: thirtyDaysLater,
    };
  } else if (status === "active") {
    const thirtyDaysLater = new Date(todayStart);
    thirtyDaysLater.setUTCDate(todayStart.getUTCDate() + 30);
    where.expiryDate = {
      gt: thirtyDaysLater,
    };
  }

  const agreements = await db.agreement.findMany({
    where,
    orderBy: { expiryDate: "asc" },
  });

  return <AgreementsListClient agreements={agreements} />;
}
