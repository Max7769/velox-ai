import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: "var(--brand)" }}>
        <Zap size={20} className="text-white" fill="white" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-slate-500 text-sm mb-8">This page doesn&apos;t exist.</p>
      <Link href="/dashboard"
        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: "var(--brand)" }}>
        Back to Dashboard
      </Link>
    </div>
  );
}
