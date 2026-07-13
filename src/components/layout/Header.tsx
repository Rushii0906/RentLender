"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Plus, User } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState("");

  // Sync search state with URL query param if we're on the agreements page
  useEffect(() => {
    if (pathname === "/agreements") {
      setSearchValue(searchParams.get("search") || "");
    } else {
      setSearchValue("");
    }
  }, [pathname, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/agreements?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/agreements");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    
    // Live update if on agreements list page
    if (pathname === "/agreements") {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <header className="h-16 border-b border-surface-border bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      {/* Search Bar Container */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenant, owner, phone..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-surface-border bg-surface-bg rounded-xl text-sm placeholder-gray-400 focus:bg-white transition-colors duration-150 focus:outline-none"
          />
        </form>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 md:gap-4 ml-4">
        {/* Mobile Quick Action Link */}
        <Link
          href="/agreements/new"
          className="md:hidden flex items-center justify-center h-10 w-10 bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 rounded-xl transition-colors focus:outline-none"
          aria-label="Add New Agreement"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </Link>

        {/* User Info / Avatar */}
        <div className="flex items-center gap-2 border border-surface-border bg-surface-bg pl-2 pr-3 py-1.5 rounded-xl">
          <div className="h-6 w-6 rounded-full bg-brand-yellow flex items-center justify-center">
            <User className="h-4.5 w-4.5 text-gray-900" />
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-gray-700">
            Agency Admin
          </span>
        </div>
      </div>
    </header>
  );
}
