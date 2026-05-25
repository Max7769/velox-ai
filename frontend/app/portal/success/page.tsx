"use client";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, Mail, Suspense } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "VLX-0000";
  const insured = params.get("insured") ?? "your submission";

  return (
    <div className="w-full max-w-md text-center">
      <div className="card p-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-emerald-500/10">
          <CheckCircle size={28} className="text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Submission received</h1>
        <p className="text-sm text-slate-400 mb-6">
          We&apos;ve received your submission for <span className="text-slate-200 font-medium">{insured}</span>.
          Our AI is processing it now.
        </p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          <p className="text-xs text-slate-500 mb-1">Your reference number</p>
          <p className="text-xl font-bold font-mono" style={{ color: "var(--brand)" }}>{ref}</p>
        </div>

        <div className="space-y-3 text-left mb-6">
          {[
            { icon: Clock, text: "You'll receive a decision within 8 minutes during business hours" },
            { icon: Mail, text: "A confirmation has been sent to your email address" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-2.5 text-xs text-slate-500">
              <Icon size={13} className="mt-0.5 flex-shrink-0 text-slate-600" />
              {text}
            </div>
          ))}
        </div>

        <Link href="/portal" className="block w-full py-3 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "var(--brand)" }}>
          Submit another risk
        </Link>
      </div>
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
