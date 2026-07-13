"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  agreementFormSchema, 
  type AgreementFormValues 
} from "@/lib/validation";
import { createAgreement } from "@/app/actions";
import { calculateExpiryDate } from "@/lib/expiry";
import { useToast } from "@/components/ui/Toast";
import { 
  User, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";

export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expiryPreview, setExpiryPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
      durationMonths: 11,
      rentAmount: 0,
      securityDeposit: 0,
      startDate: new Date().toISOString().split("T")[0]
    },
  });

  const watchStartDate = watch("startDate");
  const watchDurationMonths = watch("durationMonths");

  // Re-calculate live expiry preview whenever startDate or duration changes
  useEffect(() => {
    if (watchStartDate && watchDurationMonths && watchDurationMonths > 0) {
      try {
        const expiry = calculateExpiryDate(watchStartDate, Number(watchDurationMonths));
        setExpiryPreview(expiry.toISOString().split("T")[0]);
      } catch (err) {
        setExpiryPreview(null);
      }
    } else {
      setExpiryPreview(null);
    }
  }, [watchStartDate, watchDurationMonths]);

  const onSubmit = async (values: AgreementFormValues) => {
    setLoading(true);
    const res = await createAgreement({
      ...values,
      rentAmount: Number(values.rentAmount),
      securityDeposit: Number(values.securityDeposit),
      durationMonths: Number(values.durationMonths),
    });

    if (res.success && res.id) {
      toast("Agreement created successfully!");
      router.push(`/agreements/${res.id}`);
    } else {
      toast(res.error || "Failed to create agreement", "error");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/agreements"
          className="p-2 border border-surface-border bg-surface-bg hover:bg-surface-bg-alt rounded-xl text-gray-600 transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Add New Agreement
          </h1>
          <p className="text-sm text-gray-500">
            Create a new leave and license contract
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tenant Details Card */}
          <div className="bg-surface-bg border border-surface-border p-6 rounded-xl">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-yellow-dark" />
              Tenant Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tenant Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  {...register("tenantName")}
                  className="w-full px-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                  disabled={loading}
                />
                {errors.tenantName && (
                  <p className="text-xs text-status-expired mt-1">{errors.tenantName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tenant Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    {...register("tenantMobile")}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                    disabled={loading}
                  />
                </div>
                {errors.tenantMobile && (
                  <p className="text-xs text-status-expired mt-1">{errors.tenantMobile.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Owner Details Card */}
          <div className="bg-surface-bg border border-surface-border p-6 rounded-xl">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-yellow-dark" />
              Property Owner Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  {...register("ownerName")}
                  className="w-full px-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                  disabled={loading}
                />
                {errors.ownerName && (
                  <p className="text-xs text-status-expired mt-1">{errors.ownerName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Owner Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    {...register("ownerMobile")}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                    disabled={loading}
                  />
                </div>
                {errors.ownerMobile && (
                  <p className="text-xs text-status-expired mt-1">{errors.ownerMobile.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property & Rent Card */}
          <div className="bg-surface-bg border border-surface-border p-6 rounded-xl">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-brand-yellow-dark" />
              Property & Financials
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Property Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Complete flat/house number, building, sector, city..."
                  {...register("propertyAddress")}
                  className="w-full px-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none resize-none"
                  disabled={loading}
                />
                {errors.propertyAddress && (
                  <p className="text-xs text-status-expired mt-1">{errors.propertyAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Monthly Rent (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Amount"
                      {...register("rentAmount", { valueAsNumber: true })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                      disabled={loading}
                    />
                  </div>
                  {errors.rentAmount && (
                    <p className="text-xs text-status-expired mt-1">{errors.rentAmount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Security Deposit (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Amount"
                      {...register("securityDeposit", { valueAsNumber: true })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                      disabled={loading}
                    />
                  </div>
                  {errors.securityDeposit && (
                    <p className="text-xs text-status-expired mt-1">{errors.securityDeposit.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry calculation preview & submission card */}
        <div className="space-y-6">
          <div className="bg-surface-bg border border-surface-border p-6 rounded-xl sticky top-24">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-brand-yellow-dark" />
              Agreement Duration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    {...register("startDate")}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                    disabled={loading}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-xs text-status-expired mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Duration (Months)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="e.g. 11"
                    {...register("durationMonths", { valueAsNumber: true })}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-surface-border rounded-xl text-sm focus:outline-none"
                    disabled={loading}
                  />
                </div>
                {errors.durationMonths && (
                  <p className="text-xs text-status-expired mt-1">{errors.durationMonths.message}</p>
                )}
              </div>

              {/* LIVE EXPIRY PREVIEW */}
              {expiryPreview && (
                <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-4 rounded-xl mt-4">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    Calculated Expiry Date:
                  </span>
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <CalendarCheck className="h-5 w-5 text-brand-yellow-dark shrink-0" />
                    <span>{expiryPreview}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Derived as start date + duration - 1 day.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 disabled:opacity-50 mt-6"
              >
                <span>{loading ? "Creating..." : "Save Agreement"}</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
