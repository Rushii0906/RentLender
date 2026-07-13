"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";
import { KeyRound, Mail, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.success) {
      window.location.href = "/";
    } else {
      setError(result.error || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-surface-bg border border-surface-border p-8 rounded-xl shadow-sm">
        {/* Title Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-brand-yellow flex items-center justify-center font-bold text-gray-900 text-2xl mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Samarth Services
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rent Agreement Portal Login
          </p>
        </div>

        {/* Credentials Tip */}
        <div className="mb-6 bg-surface-bg-alt border border-surface-border p-3.5 rounded-lg text-xs text-gray-600">
          <span className="font-semibold text-gray-700 block mb-1">
            Quick Local Demo Credentials:
          </span>
          <div>Email: <code className="bg-white px-1 py-0.5 rounded border">admin@samarth.com</code></div>
          <div className="mt-1">Password: <code className="bg-white px-1 py-0.5 rounded border">admin123</code></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2.5 text-sm">
            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@agency.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-border rounded-xl text-sm placeholder-gray-400 focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-border rounded-xl text-sm placeholder-gray-400 focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
