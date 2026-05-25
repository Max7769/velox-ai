"use client";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 text-center">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
        <AlertCircle size={18} className="text-red-400" />
      </div>
      <h2 className="text-white font-semibold mb-1">Something went wrong</h2>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">{error.message || "An unexpected error occurred. Please try again."}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: "var(--brand)" }}>
        Try again
      </button>
    </div>
  );
}
