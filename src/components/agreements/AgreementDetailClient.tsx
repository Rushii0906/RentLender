"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAgreement, logSimulatedReminder } from "@/app/actions";
import { getAgreementStatus } from "@/lib/expiry";
import { useToast } from "@/components/ui/Toast";
import { 
  User, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Download, 
  Send,
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ArrowLeft,
  Bell
} from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ReminderLog {
  id: string;
  type: string;
  channel: string;
  recipient: string;
  sentAt: Date;
  status: string;
}

interface Agreement {
  id: string;
  tenantName: string;
  tenantMobile: string;
  ownerName: string;
  ownerMobile: string;
  propertyAddress: string;
  rentAmount: number;
  securityDeposit: number;
  startDate: Date;
  durationMonths: number;
  expiryDate: Date;
  reminders: ReminderLog[];
}

export default function AgreementDetailClient({ agreement }: { agreement: Agreement }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const status = getAgreementStatus(agreement.expiryDate);
  const start = new Date(agreement.startDate);
  const expiry = new Date(agreement.expiryDate);
  const today = new Date();

  // Expiry timeline calculation
  const totalDays = Math.max(1, Math.round((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  // Format currencies and dates
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteAgreement(agreement.id);
    if (res.success) {
      toast("Agreement deleted successfully.");
      router.push("/agreements");
    } else {
      toast(res.error || "Failed to delete agreement", "error");
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleSimulateReminder = async (recipient: "tenant" | "owner", channel: "whatsapp" | "sms", type: string) => {
    setSendingReminder(true);
    const res = await logSimulatedReminder({
      agreementId: agreement.id,
      type,
      channel,
      recipient,
    });

    if (res.success) {
      toast(`Simulated ${channel.toUpperCase()} logged for ${recipient === "tenant" ? agreement.tenantName : agreement.ownerName}`);
      router.refresh();
    } else {
      toast("Failed to log simulated reminder", "error");
    }
    setSendingReminder(false);
  };

  // Generate Agreement Summary PDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header Section
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(17, 24, 39); // Gray 900
      doc.text("SAMARTH SERVICES", 20, 20);
      
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(107, 114, 128); // Gray 500
      doc.text("Rent Agreement leaves & License Summary", 20, 25);
      doc.line(20, 28, 190, 28);

      // Info Grid
      doc.setFontSize(12);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(55, 65, 81); // Gray 700
      doc.text("Agreement Summary Details", 20, 38);

      const tableData = [
        ["Tenant Name", agreement.tenantName, "Owner Name", agreement.ownerName],
        ["Tenant Mobile", agreement.tenantMobile, "Owner Mobile", agreement.ownerMobile],
        ["Start Date", formatDate(agreement.startDate), "Expiry Date", formatDate(agreement.expiryDate)],
        ["Duration", `${agreement.durationMonths} Months`, "Status", status.toUpperCase().replace("_", " ")],
        ["Monthly Rent", formatCurrency(agreement.rentAmount), "Security Deposit", formatCurrency(agreement.securityDeposit)],
      ];

      autoTable(doc, {
        startY: 42,
        head: [],
        body: tableData,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [107, 114, 128], cellWidth: 35 },
          1: { textColor: [17, 24, 39], cellWidth: 50 },
          2: { fontStyle: "bold", textColor: [107, 114, 128], cellWidth: 35 },
          3: { textColor: [17, 24, 39], cellWidth: 50 },
        },
      });

      // Property Address Section
      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont("Helvetica", "bold");
      doc.text("Property Address", 20, finalY);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      
      const splitAddress = doc.splitTextToSize(agreement.propertyAddress, 170);
      doc.text(splitAddress, 20, finalY + 6);

      // Signatures Placeholder
      const sigY = finalY + 45;
      doc.line(20, sigY, 70, sigY);
      doc.line(140, sigY, 190, sigY);
      doc.setFontSize(9);
      doc.text("Tenant Signature", 20, sigY + 5);
      doc.text("Owner Signature", 140, sigY + 5);

      // Save PDF
      doc.save(`summary-${agreement.tenantName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`);
      toast("PDF Summary downloaded successfully.");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast("Failed to generate PDF.", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/agreements"
            className="p-2 border border-surface-border bg-surface-bg hover:bg-surface-bg-alt rounded-xl text-gray-600 transition-colors focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {agreement.tenantName}
              </h1>
              {/* Status Badge */}
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0
                ${status === "active" ? "bg-green-50 text-status-active border border-green-200" : ""}
                ${status === "expiring_soon" ? "bg-amber-50 text-status-expiring border border-amber-200" : ""}
                ${status === "expired" ? "bg-red-50 text-status-expired border border-red-200" : ""}
              `}>
                {status === "active" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {status === "expiring_soon" && <AlertTriangle className="h-3.5 w-3.5" />}
                {status === "expired" && <XCircle className="h-3.5 w-3.5" />}
                <span>{status.replace("_", " ")}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Agreement Details File</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 border border-surface-border bg-white text-gray-700 hover:bg-surface-bg rounded-xl text-sm font-semibold transition-colors focus:outline-none"
          >
            <Download className="h-4 w-4" />
            <span>Download Summary</span>
          </button>
          
          <Link
            href={`/agreements/${agreement.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-surface-border bg-white text-gray-700 hover:bg-surface-bg rounded-xl text-sm font-semibold transition-colors focus:outline-none"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-semibold transition-colors focus:outline-none"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Details) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Expiry Slider */}
          <div className="bg-surface-bg border border-surface-border p-6 rounded-xl">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Contract Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Start: <span className="font-semibold text-gray-800">{formatDate(agreement.startDate)}</span></span>
                <span>Expiry: <span className="font-semibold text-gray-800">{formatDate(agreement.expiryDate)}</span></span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300
                    ${status === "active" ? "bg-status-active" : ""}
                    ${status === "expiring_soon" ? "bg-status-expiring" : ""}
                    ${status === "expired" ? "bg-status-expired" : ""}
                  `}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{elapsedDays} days elapsed</span>
                <span>{progressPercent}% elapsed</span>
                <span>{Math.max(0, totalDays - elapsedDays)} days remaining</span>
              </div>
            </div>
          </div>

          {/* Details Overview Card */}
          <div className="bg-white border border-surface-border rounded-xl divide-y divide-surface-border">
            
            {/* Parties Info */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-brand-yellow-dark" />
                  Tenant Information
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{agreement.tenantName}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {agreement.tenantMobile}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-brand-yellow-dark" />
                  Owner Information
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{agreement.ownerName}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {agreement.ownerMobile}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-brand-yellow-dark" />
                  Rent Amount
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(agreement.rentAmount)}
                  <span className="text-sm font-normal text-gray-500"> / month</span>
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-brand-yellow-dark" />
                  Security Deposit
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(agreement.securityDeposit)}
                </p>
              </div>
            </div>

            {/* Property Address */}
            <div className="p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-yellow-dark" />
                Licensed Property Address
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                {agreement.propertyAddress}
              </p>
            </div>

          </div>

        </div>

        {/* Right Column (Reminders Log History & Quick Action Simulation) */}
        <div className="space-y-6">
          
          {/* Quick Simulated Reminders */}
          <div className="bg-surface-bg border border-surface-border p-6 rounded-xl space-y-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-brand-yellow-dark" />
              Simulate Reminder Send
            </h2>
            <p className="text-xs text-gray-500">
              Trigger simulated WhatsApp/SMS notification logging. No real messages are sent.
            </p>

            <div className="space-y-3">
              <div className="border-t border-surface-border pt-3">
                <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase tracking-wide">
                  To Tenant ({agreement.tenantName})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSimulateReminder("tenant", "whatsapp", "30_day")}
                    disabled={sendingReminder}
                    className="flex-1 text-center bg-white hover:bg-surface-bg-alt text-gray-700 text-xs font-semibold py-2 px-3 border border-surface-border rounded-lg transition-colors focus:outline-none"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleSimulateReminder("tenant", "sms", "30_day")}
                    disabled={sendingReminder}
                    className="flex-1 text-center bg-white hover:bg-surface-bg-alt text-gray-700 text-xs font-semibold py-2 px-3 border border-surface-border rounded-lg transition-colors focus:outline-none"
                  >
                    SMS
                  </button>
                </div>
              </div>

              <div className="border-t border-surface-border pt-3">
                <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase tracking-wide">
                  To Owner ({agreement.ownerName})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSimulateReminder("owner", "whatsapp", "30_day")}
                    disabled={sendingReminder}
                    className="flex-1 text-center bg-white hover:bg-surface-bg-alt text-gray-700 text-xs font-semibold py-2 px-3 border border-surface-border rounded-lg transition-colors focus:outline-none"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleSimulateReminder("owner", "sms", "30_day")}
                    disabled={sendingReminder}
                    className="flex-1 text-center bg-white hover:bg-surface-bg-alt text-gray-700 text-xs font-semibold py-2 px-3 border border-surface-border rounded-lg transition-colors focus:outline-none"
                  >
                    SMS
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder History Log */}
          <div className="bg-white border border-surface-border p-6 rounded-xl">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Send className="h-4.5 w-4.5 text-brand-yellow-dark" />
              Communication History
            </h2>

            {agreement.reminders.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 bg-surface-bg border border-dashed border-surface-border rounded-lg">
                No reminders sent yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {agreement.reminders
                  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                  .map((log) => (
                    <div key={log.id} className="flex gap-3 text-xs border-b border-surface-border pb-3 last:border-0 last:pb-0">
                      <div className="mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-status-active" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-gray-800">
                          {log.channel.toUpperCase()} sent to {log.recipient === "tenant" ? "Tenant" : "Owner"}
                        </p>
                        <p className="text-gray-500 text-[10px]">
                          Type: {log.type.replace("_", " ")} alert
                        </p>
                        <p className="text-gray-400 text-[10px]">
                          {formatDate(log.sentAt)} at {new Date(log.sentAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white p-6 rounded-xl border border-surface-border max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-status-expired">
              <XCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-gray-900">Delete Agreement?</h3>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this agreement for <span className="font-semibold text-gray-900">{agreement.tenantName}</span>? This action is permanent.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="px-4 py-2 border border-surface-border hover:bg-surface-bg text-gray-700 text-sm font-semibold rounded-lg focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-status-expired hover:bg-red-700 text-white text-sm font-semibold rounded-lg focus:outline-none transition-colors"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
