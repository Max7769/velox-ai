"use client";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, Mail, Zap } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "VLX-0000";
  const insured = params.get("insured") ?? "your submission";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header className="flex items-center px-6 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={12} className="text-white" fill="white" />
          </div>
          <span className="text-white font-semibold text-sm">Velox AI</span>
          <span className="text-slate-600 text-xs ml-1">· Broker Submission Portal</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="card p-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(16,185,129,0.1)" }}>
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Submission received</h1>
            <p className="text-sm text-slate-400 mb-6">
              We&apos;ve received your submission for{" "}
              <span className="text-slate-200 font-medium">{insured}</span>.
              Our AI is processing it now.
            </p>

            <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
              <p className="text-xs text-slate-500 mb-1">Your reference number</p>
              <p className="text-xl font-bold font-mono" style={{ color: "var(--brand)" }}>{ref}</p>
            </div>

            <div className="space-y-3 text-left mb-6">
              {[
                { icon: Clock, text: "You'll receive a decision within 8 minutes during business hours" },
                { icon: Mail,  text: "A confirmation has been sent to your email address" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 text-xs text-slate-500">
                  <Icon size={13} className="mt-0.5 flex-shrink-0 text-slate-600" />
                  {text}
                </div>
              ))}
            </div>

            <Link href={`/portal/status?ref=${ref}`}
              className="block w-full py-3 rounded-lg text-sm font-semibold text-white transition-all mb-3"
              style={{ background: "var(--brand)" }}>
              Track this submission
            </Link>
            <Link href="/portal"
              className="block w-full py-3 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">
              Submit another risk
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-8 py-4 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs text-slate-700">© 2026 Velox AI Ltd · Secure submission portal · SOC 2 Type II certified</p>
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
