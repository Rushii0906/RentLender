import { db } from "@/lib/db";
import { getAgreementStatus } from "@/lib/expiry";
import ExpiryChart from "@/components/dashboard/ExpiryChart";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight, 
  Plus,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Agreement } from "@prisma/client";

export const revalidate = 0; // Disable server caching for live dashboard metrics

export default async function DashboardPage() {
  const agreements = await db.agreement.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const today = new Date();
  
  // Calculate dynamic live statuses
  let activeCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;

  // Buckets for 90-day chart
  let next30 = 0;
  let next60 = 0;
  let next90 = 0;

  for (const ag of agreements) {
    const status = getAgreementStatus(ag.expiryDate, today);
    if (status === "active") {
      activeCount++;
    } else if (status === "expiring_soon") {
      expiringCount++;
    } else if (status === "expired") {
      expiredCount++;
    }

    // Expiry forecast calculations (in next 90 days)
    const timeDiff = new Date(ag.expiryDate).getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysRemaining >= 0 && daysRemaining <= 90) {
      if (daysRemaining <= 30) {
        next30++;
      } else if (daysRemaining <= 60) {
        next60++;
      } else {
        next90++;
      }
    }
  }

  const chartData = [
    { range: "0 - 30 Days", agreements: next30 },
    { range: "31 - 60 Days", agreements: next60 },
    { range: "61 - 90 Days", agreements: next90 },
  ];

  // Last 5 recent items
  const recentAgreements = agreements.slice(0, 5);

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

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of leave and license agreements
          </p>
        </div>
        <Link
          href="/agreements/new"
          className="flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
        >
          <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
          <span>New Agreement</span>
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agreements */}
        <Link
          href="/agreements"
          className="bg-surface-bg border border-surface-border p-6 rounded-xl hover:bg-surface-bg-alt transition-colors group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Agreements
            </span>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {agreements.length}
            </span>
            <span className="text-xs text-brand-yellow-dark font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* Active Agreements */}
        <Link
          href="/agreements?status=active"
          className="bg-surface-bg border border-surface-border p-6 rounded-xl hover:bg-surface-bg-alt transition-colors group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Agreements
            </span>
            <CheckCircle2 className="h-5 w-5 text-status-active" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {activeCount}
            </span>
            <span className="text-xs text-brand-yellow-dark font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View Active <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* Expiring Soon Agreements */}
        <Link
          href="/agreements?status=expiring_soon"
          className="bg-surface-bg border border-surface-border p-6 rounded-xl hover:bg-surface-bg-alt transition-colors group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Expiring Soon
            </span>
            <Clock className="h-5 w-5 text-status-expiring" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {expiringCount}
            </span>
            <span className="text-xs text-brand-yellow-dark font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View Expiring <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* Expired Agreements */}
        <Link
          href="/agreements?status=expired"
          className="bg-surface-bg border border-surface-border p-6 rounded-xl hover:bg-surface-bg-alt transition-colors group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Expired Agreements
            </span>
            <XCircle className="h-5 w-5 text-status-expired" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {expiredCount}
            </span>
            <span className="text-xs text-brand-yellow-dark font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View Expired <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Grid Chart & Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart (2 columns) */}
        <div className="lg:col-span-2">
          <ExpiryChart data={chartData} />
        </div>

        {/* Recent Agreements Card List (1 column) */}
        <div className="bg-white border border-surface-border p-6 rounded-xl flex flex-col h-80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Recent Agreements
            </h2>
            <Link
              href="/agreements"
              className="text-xs font-semibold text-brand-yellow-dark hover:underline flex items-center"
            >
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentAgreements.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-surface-border rounded-xl bg-surface-bg p-4 text-center">
              <span className="text-xs font-semibold text-gray-500">
                No agreements logged yet.
              </span>
              <Link
                href="/agreements/new"
                className="text-xs font-semibold text-brand-yellow-dark hover:underline mt-1"
              >
                Log your first agreement
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {recentAgreements.map((ag: Agreement) => {
                const stat = getAgreementStatus(ag.expiryDate, today);
                return (
                  <Link
                    key={ag.id}
                    href={`/agreements/${ag.id}`}
                    className="flex justify-between items-center p-3 border border-surface-border bg-surface-bg hover:bg-surface-bg-alt rounded-lg transition-colors group"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-gray-900">
                        {ag.tenantName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires: {formatDate(ag.expiryDate)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0
                        ${stat === "active" ? "bg-status-active" : ""}
                        ${stat === "expiring_soon" ? "bg-status-expiring" : ""}
                        ${stat === "expired" ? "bg-status-expired" : ""}
                      `} />
                      <span className="text-xs font-bold text-gray-800">
                        {formatCurrency(ag.rentAmount)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
