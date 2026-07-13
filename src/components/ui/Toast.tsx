"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

type ToastType = "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-auto px-4 sm:px-0">
        {toasts.map((t) => {
          let Icon = CheckCircle2;
          let iconColor = "text-status-active";
          let borderColor = "border-status-active/20";
          let bgColor = "bg-white";
          
          if (t.type === "warning") {
            Icon = AlertTriangle;
            iconColor = "text-status-expiring";
            borderColor = "border-status-expiring/20";
          } else if (t.type === "error") {
            Icon = XCircle;
            iconColor = "text-status-expired";
            borderColor = "border-status-expired/20";
          }

          return (
            <div
              key={t.id}
              className={`flex items-start justify-between gap-3 p-4 rounded-xl border ${borderColor} ${bgColor} shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-2`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
                <span className="text-sm font-semibold text-gray-800">
                  {t.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
