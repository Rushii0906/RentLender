"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  Send, 
  Settings, 
  LogOut,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Agreements", href: "/agreements", icon: FileText },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Greetings", href: "/greetings", icon: Send },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Helper to determine if link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-bg border-r border-surface-border h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-surface-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-brand-yellow flex items-center justify-center font-bold text-gray-900 text-lg">
              S
            </span>
            <span className="font-semibold text-lg text-gray-900 tracking-tight">
              Samarth Services
            </span>
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 py-4">
          <Link
            href="/agreements/new"
            className="flex items-center justify-center gap-2 w-full bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
            <span>New Agreement</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  Active
                    ? "bg-brand-yellow text-gray-900 font-semibold"
                    : "text-gray-600 hover:bg-surface-bg-alt hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-150 group-hover:scale-105",
                  Active ? "text-gray-900 stroke-[2.5]" : "text-gray-400 group-hover:text-gray-600"
                )} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-surface-border">
          <button 
            onClick={() => {
              // Simulated Logout
              document.cookie = "samarth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-surface-border flex items-center justify-around px-4 z-40 shadow-lg">
        {navItems.map((item) => {
          const Active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors",
                Active ? "text-brand-yellow-dark" : "text-gray-500"
              )}
            >
              <Icon className={cn("h-5 w-5", Active ? "stroke-[2.5]" : "stroke-2")} />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
