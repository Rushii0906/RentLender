import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditAgreementForm from "@/components/agreements/EditAgreementForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgreementPage({ params }: PageProps) {
  const { id } = await params;
  
  const agreement = await db.agreement.findUnique({
    where: { id },
  });

  if (!agreement) {
    notFound();
  }

  return <EditAgreementForm initialData={agreement} />;
}
