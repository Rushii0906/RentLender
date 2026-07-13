import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AgreementDetailClient from "@/components/agreements/AgreementDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgreementDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const agreement = await db.agreement.findUnique({
    where: { id },
    include: {
      reminders: true
    }
  });

  if (!agreement) {
    notFound();
  }

  return <AgreementDetailClient agreement={agreement} />;
}
