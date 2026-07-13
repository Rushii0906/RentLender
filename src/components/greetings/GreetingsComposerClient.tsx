"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logSimulatedGreeting } from "@/app/actions";
import { useToast } from "@/components/ui/Toast";
import { 
  Send, 
  Users, 
  MessageSquare, 
  Smartphone, 
  History, 
  Info,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

interface Agreement {
  id: string;
  tenantName: string;
  tenantMobile: string;
  ownerName: string;
  ownerMobile: string;
}

interface GreetingLog {
  id: string;
  occasion: string;
  channel: string;
  recipientGroup: string;
  sentAt: Date;
}

const templates: Record<string, string> = {
  Diwali: "Wishing you a very Happy and Prosperous Diwali! May this festival of lights bring peace, prosperity, and happiness to you and your family. - Samarth Services",
  "Ganesh Chaturthi": "May Lord Ganesha bless you and your family with health, wealth, happiness, and success. Happy Ganesh Chaturthi! - Samarth Services",
  "New Year": "Wishing you a year filled with new opportunities, joy, and success. Happy New Year 2027! - Samarth Services",
  Holi: "May your life be painted with the vibrant colors of joy, love, and prosperity. Happy Holi! - Samarth Services",
  custom: "",
};

export default function GreetingsComposerClient({
  agreements,
  logs,
}: {
  agreements: Agreement[];
  logs: GreetingLog[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [occasion, setOccasion] = useState<string>("Diwali");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [recipientGroup, setRecipientGroup] = useState<"all" | "active_only" | "custom">("all");
  const [messageText, setMessageText] = useState<string>(templates["Diwali"]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]); // holds agreement IDs or mobile numbers
  const [sending, setSending] = useState(false);
  
  const [demoSends, setDemoSends] = useState<{
    mobiles: string[];
    text: string;
    channel: "sms" | "whatsapp";
  } | null>(null);
  const [dispatchedMobiles, setDispatchedMobiles] = useState<string[]>([]);

  // Sync templates on occasion change
  useEffect(() => {
    setMessageText(templates[occasion] || "");
  }, [occasion]);

  // Compute recipient counts
  const getRecipientCount = () => {
    if (recipientGroup === "all") {
      return agreements.length * 2; // Tenant + Owner for each agreement
    } else if (recipientGroup === "active_only") {
      // For simplicity, counts active agreements contacts.
      // Since status is derived, we assume all current agreements in database are active for greetings count,
      // or we can calculate status. Let's just do all current database items * 2 for estimation,
      // or filter in action. Let's say all database entries for simplicity.
      return agreements.length * 2;
    } else {
      return selectedContacts.length;
    }
  };

  const handleContactToggle = (mobile: string) => {
    setSelectedContacts((prev) => 
      prev.includes(mobile) 
        ? prev.filter((m) => m !== mobile) 
        : [...prev, mobile]
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast("Please enter a greeting message.", "error");
      return;
    }

    const count = getRecipientCount();
    if (count === 0) {
      toast("No recipients selected.", "error");
      return;
    }

    setSending(true);

    const res = await logSimulatedGreeting({
      occasion,
      channel,
      recipientGroup: recipientGroup === "custom" ? `custom_selection (${count})` : recipientGroup,
      messageText,
      selectedMobiles: recipientGroup === "custom" ? selectedContacts : undefined,
    });

    if (res.success) {
      toast(`${res.simulated ? "Simulated" : "Real"} greeting broadcast logged for ${count} contacts!`);
      setSelectedContacts([]);
      
      if (res.simulated && res.recipientMobiles && res.recipientMobiles.length > 0) {
        setDemoSends({
          mobiles: res.recipientMobiles,
          text: res.messageText || messageText,
          channel: channel,
        });
        setDispatchedMobiles([]);
      }

      router.refresh();
    } else {
      toast(res.error || "Failed to log greeting broadcast.", "error");
    }
    setSending(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Festival Greetings
        </h1>
        <p className="text-sm text-gray-500">
          Broadcast greetings and marketing follow-ups to contacts
        </p>
      </div>

      {/* Warning simulation note */}
      <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-4 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-brand-yellow-dark shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700">
          <span className="font-bold text-gray-900">Broadcast Simulation</span>
          <p className="mt-1">
            This module simulates bulk sending messages to tenants and landlords. Sending will create an audit entry in the greetings log database but will not connect to a real SMS/WhatsApp gateway.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composer Form (2 Columns) */}
        <form onSubmit={handleSend} className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-border p-6 rounded-xl space-y-6">
            
            {/* Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-bg border border-surface-border rounded-xl text-sm focus:bg-white focus:outline-none"
                >
                  <option value="Diwali">Diwali</option>
                  <option value="Ganesh Chaturthi">Ganesh Chaturthi</option>
                  <option value="New Year">New Year</option>
                  <option value="Holi">Holi</option>
                  <option value="custom">Custom Greeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Delivery Channel
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel("whatsapp")}
                    className={`flex-1 text-center py-2 px-3 border rounded-xl text-sm font-semibold transition-colors focus:outline-none
                      ${channel === "whatsapp" 
                        ? "bg-brand-yellow border-brand-yellow/30 text-gray-900" 
                        : "bg-surface-bg border-surface-border text-gray-600 hover:bg-surface-bg-alt"
                      }
                    `}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("sms")}
                    className={`flex-1 text-center py-2 px-3 border rounded-xl text-sm font-semibold transition-colors focus:outline-none
                      ${channel === "sms" 
                        ? "bg-brand-yellow border-brand-yellow/30 text-gray-900" 
                        : "bg-surface-bg border-surface-border text-gray-600 hover:bg-surface-bg-alt"
                      }
                    `}
                  >
                    SMS
                  </button>
                </div>
              </div>
            </div>

            {/* Recipient Groups Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Recipients Target
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "all", label: "All Contacts" },
                  { id: "active_only", label: "Active Leases Only" },
                  { id: "custom", label: "Custom Selection" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRecipientGroup(item.id as any)}
                    className={`text-center py-2.5 px-3 border rounded-xl text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none
                      ${recipientGroup === item.id 
                        ? "bg-brand-yellow border-brand-yellow/30 text-gray-900" 
                        : "bg-surface-bg border-surface-border text-gray-600 hover:bg-surface-bg-alt"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Multi Select Contacts List */}
            {recipientGroup === "custom" && (
              <div className="border border-surface-border rounded-xl p-4 space-y-3 bg-surface-bg">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wide">
                  Select Recipient Contacts
                </span>
                
                {agreements.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">
                    No contacts available in database.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {agreements.map((ag) => (
                      <div key={ag.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white border border-surface-border rounded-lg">
                        <span className="text-xs font-semibold text-gray-800">
                          {ag.tenantName} (Tenant) / {ag.ownerName} (Owner)
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleContactToggle(ag.tenantMobile)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors focus:outline-none
                              ${selectedContacts.includes(ag.tenantMobile)
                                ? "bg-brand-yellow text-gray-900 border-brand-yellow/40"
                                : "bg-white border-surface-border text-gray-600 hover:bg-surface-bg"
                              }
                            `}
                          >
                            {ag.tenantName.split(" ")[0]} ({ag.tenantMobile})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleContactToggle(ag.ownerMobile)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors focus:outline-none
                              ${selectedContacts.includes(ag.ownerMobile)
                                ? "bg-brand-yellow text-gray-900 border-brand-yellow/40"
                                : "bg-white border-surface-border text-gray-600 hover:bg-surface-bg"
                              }
                            `}
                          >
                            {ag.ownerName.split(" ")[0]} ({ag.ownerMobile})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Message Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Greeting Message
              </label>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your greeting text here..."
                className="w-full px-3.5 py-2.5 bg-surface-bg border border-surface-border rounded-xl text-sm focus:bg-white focus:outline-none resize-none"
                disabled={sending}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 focus:outline-none"
            >
              <Send className="h-4.5 w-4.5" />
              <span>{sending ? "Sending simulated broadcast..." : `Broadcast Greeting to ${getRecipientCount()} Contacts`}</span>
            </button>

          </div>
        </form>

        {/* Audit Logs (1 Column) */}
        <div className="bg-white border border-surface-border p-6 rounded-xl flex flex-col h-[520px]">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-brand-yellow-dark" />
            Broadcast Log History
          </h2>

          {logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-surface-border rounded-xl bg-surface-bg p-4 text-center">
              <span className="text-xs font-semibold text-gray-500">
                No past broadcasts recorded yet.
              </span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border border-surface-border bg-surface-bg rounded-lg space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900 text-xs">
                      {log.occasion}
                    </span>
                    <span className="text-[9px] bg-white border border-surface-border px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">
                      {log.channel}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Group: <span className="font-semibold">{log.recipientGroup}</span>
                  </p>
                  <p className="text-[9px] text-gray-400" suppressHydrationWarning>
                    {formatDate(log.sentAt)} at {formatTime(log.sentAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Demo Broadcast Send Queue Modal */}
      {demoSends && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white p-6 rounded-xl border border-surface-border max-w-md w-full shadow-xl space-y-4 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-brand-yellow-dark" />
                  Demo Broadcast Queue ({demoSends.channel.toUpperCase()})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click each recipient to open pre-filled draft in {demoSends.channel === "whatsapp" ? "WhatsApp" : "SMS app"}
                </p>
              </div>
              <button 
                onClick={() => setDemoSends(null)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <ChevronDown className="h-5 w-5 transform rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1">
              {demoSends.mobiles.map((mobile) => {
                const isDispatched = dispatchedMobiles.includes(mobile);
                return (
                  <div key={mobile} className="flex items-center justify-between p-3 border border-surface-border bg-surface-bg rounded-lg text-xs">
                    <div className="mr-2">
                      <p className="font-semibold text-gray-800">{mobile}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[240px]">
                        "{demoSends.text}"
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const cleanMobile = mobile.replace(/\s+/g, "");
                        const encodedBody = encodeURIComponent(demoSends.text);
                        
                        if (demoSends.channel === "whatsapp") {
                          const waPhone = cleanMobile.replace(/[^\d+]/g, "");
                          window.open(`https://api.whatsapp.com/send?phone=${waPhone}&text=${encodedBody}`, "_blank");
                        } else if (demoSends.channel === "sms") {
                          window.open(`sms:${cleanMobile}?body=${encodedBody}`, "_self");
                        }

                        if (!dispatchedMobiles.includes(mobile)) {
                          setDispatchedMobiles((prev) => [...prev, mobile]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all shrink-0 ${
                        isDispatched
                          ? "bg-green-50 text-status-active border-green-200"
                          : "bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 border-transparent"
                      }`}
                    >
                      {isDispatched ? "Sent (Open Draft)" : "Send Draft"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-surface-border flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">
                {dispatchedMobiles.length} of {demoSends.mobiles.length} drafts opened
              </span>
              <button
                onClick={() => setDemoSends(null)}
                className="px-4 py-2 border border-surface-border bg-white text-gray-700 hover:bg-surface-bg rounded-xl font-semibold transition-colors focus:outline-none"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
