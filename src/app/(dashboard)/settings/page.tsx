"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Settings, User, Building, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [agencyName, setAgencyName] = useState("Samarth Real Estate Services");
  const [contactPerson, setContactPerson] = useState("Amit Patil");
  const [phone, setPhone] = useState("9876543210");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast("Agency profile settings saved successfully!");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-gray-500">
          Configure agency profiles and portal configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation / Cards */}
        <div className="space-y-3">
          <div className="bg-surface-bg border border-surface-border p-4 rounded-xl flex items-center gap-3">
            <User className="h-5 w-5 text-brand-yellow-dark" />
            <span className="text-sm font-semibold text-gray-900">
              Agency Profile
            </span>
          </div>
          <div className="bg-white border border-surface-border p-4 rounded-xl flex items-center gap-3 opacity-50 cursor-not-allowed">
            <ShieldCheck className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">
              Access Control
            </span>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="md:col-span-2 bg-white border border-surface-border p-6 rounded-xl space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="h-4.5 w-4.5 text-brand-yellow-dark" />
            Profile Configuration
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Agency Brand Name
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-bg border border-surface-border rounded-xl text-sm focus:bg-white focus:outline-none"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Representative
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-bg border border-surface-border rounded-xl text-sm focus:bg-white focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Office Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-bg border border-surface-border rounded-xl text-sm focus:bg-white focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 font-semibold py-2 px-6 rounded-xl text-sm transition-all focus:outline-none mt-4"
            >
              {loading ? "Saving Changes..." : "Save Settings"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
