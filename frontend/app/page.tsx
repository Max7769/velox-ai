import Link from "next/link";
import { Zap, ArrowRight, Shield, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-10 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-white font-semibold tracking-tight">Velox AI</span>
        </div>
        <div className="flex items-center gap-8">
          {["Product", "Security", "Pricing", "About"].map(l => (
            <a key={l} href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</a>
          <Link href="/dashboard" className="btn-primary flex items-center gap-2">
            Open platform <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#818cf8" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Built for Lloyd&apos;s of London coverholders
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 leading-[1.08] tracking-tight">
          Insurance submissions<br />
          <span style={{ color: "var(--brand)" }}>processed by AI</span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Velox reads every submission document the moment it arrives, extracts all risk data, scores it against your appetite, and routes it automatically — in under 10 minutes.
        </p>

        <div className="flex items-center gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary px-7 py-3.5 text-base flex items-center gap-2">
            Open platform <ArrowRight size={16} />
          </Link>
          <Link href="/portal" className="btn-ghost px-7 py-3.5 text-base">
            Broker portal
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: "var(--border)" }}>
          {[
            { icon: Clock, value: "< 10 min", label: "Average processing time", sub: "vs 4 hours manual" },
            { icon: Shield, value: "94%", label: "Extraction accuracy", sub: "Across all document types" },
            { icon: TrendingUp, value: "10×", label: "Faster than manual", sub: "Proven in Lloyd's market" },
          ].map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className="py-10 px-8 text-center" style={{ background: "var(--bg-card)" }}>
              <Icon size={20} className="mx-auto mb-3" style={{ color: "var(--brand)" }} />
              <p className="text-3xl font-bold text-white mb-1">{value}</p>
              <p className="text-sm text-slate-300 font-medium mb-0.5">{label}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Everything your underwriting team needs</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "AI document extraction", desc: "Reads PDFs, Word docs, and emails. Extracts 30+ risk fields in seconds with 94% accuracy." },
            { title: "Appetite scoring engine", desc: "Configure your own rules. AI scores every submission against your appetite and routes automatically." },
            { title: "Lloyd's CDR ready", desc: "Blueprint Two compliant. Auto-generates Core Data Records from extracted submission data." },
            { title: "Broker portal", desc: "A clean, branded portal where brokers submit directly. No email attachments. Real-time status." },
            { title: "Audit trail", desc: "Full history of every decision, action, and note. SOC 2 compliant. GDPR ready." },
            { title: "Analytics & reporting", desc: "Live dashboards showing bind rate, processing time, volume by coverage type, and broker performance." },
          ].map(f => (
            <div key={f.title} className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <div className="card-2 rounded-2xl p-12">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to process your first submission?</h2>
          <p className="text-slate-400 mb-6">Upload a document and see AI extract the data in real time. No setup required.</p>
          <Link href="/dashboard/upload" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
            Try it now <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-10 py-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs text-slate-600">© 2026 Velox AI Ltd. Built for the Lloyd&apos;s of London market.</p>
      </footer>
    </main>
  );
}
