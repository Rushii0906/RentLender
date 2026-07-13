"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logSimulatedReminder } from "@/app/actions";
import { useToast } from "@/components/ui/Toast";
import { 
  Bell, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Info
} from "lucide-react";
import Link from "next/link";

interface Agreement {
  id: string;
  tenantName: string;
  tenantMobile: string;
  ownerName: string;
  ownerMobile: string;
  expiryDate: Date;
}

interface RemindersQueueClientProps {
  onExpiryList: Agreement[];
  sevenDayList: Agreement[];
  thirtyDayList: Agreement[];
}

export default function RemindersQueueClient({
  onExpiryList,
  sevenDayList,
  thirtyDayList,
}: RemindersQueueClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"on_expiry" | "7_day" | "30_day">("on_expiry");
  const [loading, setLoading] = useState<string | null>(null); // tracks active button click ID

  const getActiveList = () => {
    switch (activeTab) {
      case "on_expiry":
        return onExpiryList;
      case "7_day":
        return sevenDayList;
      case "30_day":
        return thirtyDayList;
      default:
        return [];
    }
  };

  const handleSimulate = async (agreementId: string, recipient: "tenant" | "owner", channel: "whatsapp" | "sms", name: string) => {
    const actionKey = `${agreementId}-${recipient}-${channel}`;
    setLoading(actionKey);

    const res = await logSimulatedReminder({
      agreementId,
      type: activeTab,
      channel,
      recipient,
    });

    if (res.success) {
      toast(`Simulated ${channel.toUpperCase()} log created for ${name}`);
      router.refresh();
    } else {
      toast("Failed to log simulated reminder", "error");
    }
    setLoading(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeList = getActiveList();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Reminders Queue
        </h1>
        <p className="text-sm text-gray-500">
          Proactive follow-up schedule for expiring rent contracts
        </p>
      </div>

      {/* Simulated Alert Notification Box */}
      <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-4 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-brand-yellow-dark shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 space-y-1">
          <span className="font-bold text-gray-900">Simulation Mode Active</span>
          <p>
            This section allows you to log follow-up tasks to the communication audit history database. Clicking WhatsApp or SMS buttons registers a log entry but does <strong>not</strong> send an actual client message.
          </p>
        </div>
      </div>

      {/* Buckets Tab Bar */}
      <div className="bg-surface-bg p-1.5 rounded-xl border border-surface-border flex gap-1 w-full sm:w-max">
        {[
          { id: "on_expiry", label: "On Expiry", count: onExpiryList.length },
          { id: "7_day", label: "7-Day Alerts", count: sevenDayList.length },
          { id: "30_day", label: "30-Day Alerts", count: thirtyDayList.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none w-full sm:w-auto justify-center
              ${activeTab === tab.id
                ? "bg-brand-yellow text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] 
              ${activeTab === tab.id 
                ? "bg-white text-gray-900" 
                : "bg-gray-200 text-gray-700"
              }
            `}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Content List */}
      {activeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-surface-border rounded-xl bg-surface-bg py-16 px-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-status-active mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">All caught up!</h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            No agreements match this notification threshold today.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((ag) => (
            <div
              key={ag.id}
              className="bg-white border border-surface-border p-6 rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-brand-yellow/30 transition-colors"
            >
              {/* Info Detail */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900 text-base">
                    {ag.tenantName}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium">|</span>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-status-expiring" />
                    <span>Expires: {formatDate(ag.expiryDate)}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-600">
                  <p>Tenant Phone: <span className="font-medium text-gray-800">{ag.tenantMobile}</span></p>
                  <p>Owner Name: <span className="font-medium text-gray-800">{ag.ownerName}</span></p>
                  <p>Owner Phone: <span className="font-medium text-gray-800">{ag.ownerMobile}</span></p>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 border-surface-border pt-4 lg:pt-0">
                {/* Send to Tenant */}
                <div className="space-y-1.5 w-full sm:w-auto">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider">
                    Remind Tenant
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSimulate(ag.id, "tenant", "whatsapp", ag.tenantName)}
                      disabled={loading !== null}
                      className="bg-white hover:bg-surface-bg border border-surface-border text-gray-700 text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors focus:outline-none w-full sm:w-auto"
                    >
                      {loading === `${ag.id}-tenant-whatsapp` ? "Sending..." : "WhatsApp"}
                    </button>
                    <button
                      onClick={() => handleSimulate(ag.id, "tenant", "sms", ag.tenantName)}
                      disabled={loading !== null}
                      className="bg-white hover:bg-surface-bg border border-surface-border text-gray-700 text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors focus:outline-none w-full sm:w-auto"
                    >
                      {loading === `${ag.id}-tenant-sms` ? "Sending..." : "SMS"}
                    </button>
                  </div>
                </div>

                {/* Send to Owner */}
                <div className="space-y-1.5 w-full sm:w-auto">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider">
                    Remind Owner
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSimulate(ag.id, "owner", "whatsapp", ag.ownerName)}
                      disabled={loading !== null}
                      className="bg-white hover:bg-surface-bg border border-surface-border text-gray-700 text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors focus:outline-none w-full sm:w-auto"
                    >
                      {loading === `${ag.id}-owner-whatsapp` ? "Sending..." : "WhatsApp"}
                    </button>
                    <button
                      onClick={() => handleSimulate(ag.id, "owner", "sms", ag.ownerName)}
                      disabled={loading !== null}
                      className="bg-white hover:bg-surface-bg border border-surface-border text-gray-700 text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors focus:outline-none w-full sm:w-auto"
                    >
                      {loading === `${ag.id}-owner-sms` ? "Sending..." : "SMS"}
                    </button>
                  </div>
                </div>

                {/* Go to Details link */}
                <Link
                  href={`/agreements/${ag.id}`}
                  className="p-2.5 border border-surface-border text-gray-400 hover:text-gray-600 rounded-xl hover:bg-surface-bg transition-colors focus:outline-none self-end"
                  aria-label="View details"
                >
                  <ExternalLink className="h-4.5 w-4.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
