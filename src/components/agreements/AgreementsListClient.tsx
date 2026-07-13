"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getAgreementStatus } from "@/lib/expiry";
import { useToast } from "@/components/ui/Toast";
import { 
  Search, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  FileText,
  Clock
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
}

export default function AgreementsListClient({ agreements }: { agreements: Agreement[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "all";

  // Navigation handlers to sync with URL parameters
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateParams({ search: e.target.value || null });
  };

  const handleStatusFilter = (status: string) => {
    updateParams({ status });
  };

  // Format Helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // EXPORT TO CSV
  const handleExportCSV = () => {
    try {
      const csvData = agreements.map((ag) => ({
        "Agreement ID": ag.id,
        "Tenant Name": ag.tenantName,
        "Tenant Mobile": ag.tenantMobile,
        "Owner Name": ag.ownerName,
        "Owner Mobile": ag.ownerMobile,
        "Property Address": ag.propertyAddress,
        "Monthly Rent (INR)": ag.rentAmount,
        "Security Deposit (INR)": ag.securityDeposit,
        "Start Date": new Date(ag.startDate).toISOString().split("T")[0],
        "Duration (Months)": ag.durationMonths,
        "Expiry Date": new Date(ag.expiryDate).toISOString().split("T")[0],
        "Status": getAgreementStatus(ag.expiryDate),
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      const filterName = currentStatus !== "all" ? `-${currentStatus}` : "";
      link.setAttribute("href", url);
      link.setAttribute("download", `samarth-agreements${filterName}-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast("CSV exported successfully.");
      setExportDropdownOpen(false);
    } catch (err) {
      console.error(err);
      toast("Failed to export CSV.", "error");
    }
  };

  // EXPORT TO PDF TABLE
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF("l", "mm", "a4"); // Landscape layout
      
      // Title Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Samarth Services - Rent Agreements List", 14, 15);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      const filterStr = currentStatus !== "all" ? `Filtered status: ${currentStatus.toUpperCase()}` : "All statuses";
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")} | ${filterStr}`, 14, 20);

      const tableHeaders = [
        ["Tenant", "Owner", "Tenant Phone", "Owner Phone", "Rent", "Deposit", "Start Date", "Expiry Date", "Status"]
      ];

      const tableRows = agreements.map((ag) => [
        ag.tenantName,
        ag.ownerName,
        ag.tenantMobile,
        ag.ownerMobile,
        formatCurrency(ag.rentAmount),
        formatCurrency(ag.securityDeposit),
        formatDate(ag.startDate),
        formatDate(ag.expiryDate),
        getAgreementStatus(ag.expiryDate).toUpperCase().replace("_", " ")
      ]);

      autoTable(doc, {
        startY: 25,
        head: tableHeaders,
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [245, 179, 1] }, // Brand Yellow
        styles: { fontSize: 8.5 },
      });

      const filterName = currentStatus !== "all" ? `-${currentStatus}` : "";
      doc.save(`samarth-agreements${filterName}-${new Date().toISOString().split("T")[0]}.pdf`);
      toast("PDF exported successfully.");
      setExportDropdownOpen(false);
    } catch (err) {
      console.error(err);
      toast("Failed to export PDF.", "error");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Rent Agreements
          </h1>
          <p className="text-sm text-gray-500">
            Manage, filter, and export agreement profiles
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-surface-border bg-white text-gray-700 hover:bg-surface-bg rounded-xl text-sm font-semibold transition-colors focus:outline-none"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Export</span>
            </button>
            
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-surface-border rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 hover:bg-surface-bg transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 hover:bg-surface-bg border-t border-surface-border transition-colors"
                >
                  <FileText className="h-4 w-4 text-red-600" />
                  <span>Download PDF Table</span>
                </button>
              </div>
            )}
          </div>

          <Link
            href="/agreements/new"
            className="flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 font-semibold py-2 px-4 rounded-xl text-sm transition-all focus:outline-none"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Add Agreement</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-surface-bg border border-surface-border p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "expiring_soon", label: "Expiring Soon" },
            { id: "expired", label: "Expired" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none
                ${currentStatus === tab.id
                  ? "bg-brand-yellow text-gray-900 shadow-sm"
                  : "bg-white border border-surface-border text-gray-600 hover:bg-surface-bg-alt"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter list..."
            value={currentSearch}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Content List */}
      {agreements.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-surface-border rounded-xl bg-surface-bg py-16 px-4 text-center">
          <Filter className="h-10 w-10 text-gray-400 mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">No agreements found</h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            Try adjusting your search criteria or clear status filters.
          </p>
          <button
            onClick={() => updateParams({ search: null, status: "all" })}
            className="text-xs font-semibold text-brand-yellow-dark hover:underline mt-4"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-surface-border rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-bg">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="relative px-6 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-surface-border text-sm">
                {agreements.map((ag) => {
                  const status = getAgreementStatus(ag.expiryDate);
                  return (
                    <tr key={ag.id} className="hover:bg-surface-bg/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{ag.tenantName}</div>
                        <div className="text-xs text-gray-500">{ag.tenantMobile}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{ag.ownerName}</div>
                        <div className="text-xs text-gray-500">{ag.ownerMobile}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        {formatCurrency(ag.rentAmount)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(ag.expiryDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                          ${status === "active" ? "bg-green-50 text-status-active border border-green-200" : ""}
                          ${status === "expiring_soon" ? "bg-amber-50 text-status-expiring border border-amber-200" : ""}
                          ${status === "expired" ? "bg-red-50 text-status-expired border border-red-200" : ""}
                        `}>
                          {status === "active" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {status === "expiring_soon" && <Clock className="h-3.5 w-3.5" />}
                          {status === "expired" && <XCircle className="h-3.5 w-3.5" />}
                          <span>{status.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/agreements/${ag.id}`}
                          className="text-brand-yellow-dark font-semibold text-xs flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Details <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4">
            {agreements.map((ag) => {
              const status = getAgreementStatus(ag.expiryDate);
              return (
                <Link
                  key={ag.id}
                  href={`/agreements/${ag.id}`}
                  className="bg-white border border-surface-border p-5 rounded-xl hover:bg-surface-bg-alt/30 transition-all flex flex-col gap-3 shadow-sm block"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{ag.tenantName}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Owner: {ag.ownerName}</p>
                    </div>

                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${status === "active" ? "bg-green-50 text-status-active" : ""}
                      ${status === "expiring_soon" ? "bg-amber-50 text-status-expiring" : ""}
                      ${status === "expired" ? "bg-red-50 text-status-expired" : ""}
                    `}>
                      <span>{status.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-surface-border/50 text-gray-600">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Rent</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(ag.rentAmount)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Expiry</span>
                      <span className="font-semibold text-gray-900">{formatDate(ag.expiryDate)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
