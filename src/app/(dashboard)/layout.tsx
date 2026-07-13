import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Suspense fallback={<div className="h-16 border-b border-surface-border bg-white" />}>
          <Header />
        </Suspense>

        {/* Scrollable Main Area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
