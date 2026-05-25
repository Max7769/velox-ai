import { Zap } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <header className="flex items-center justify-between px-8 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={12} className="text-white" fill="white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Velox AI</span>
          <span className="text-slate-600 text-xs ml-1">· Broker Submission Portal</span>
        </div>
        <a href="mailto:underwriting@velox.ai" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          underwriting@velox.ai
        </a>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">{children}</main>
      <footer className="px-8 py-4 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs text-slate-700">© 2026 Velox AI Ltd · Secure submission portal · SOC 2 Type II certified</p>
      </footer>
    </div>
  );
}
