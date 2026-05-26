"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap, ArrowRight, Shield, Clock, TrendingUp, CheckCircle,
  FileText, BarChart2, Users, Globe, Lock, ChevronRight,
  Star, Play, Cpu, Database, Bell,
} from "lucide-react";

const TICKER_EVENTS = [
  { label: "Cyber Liability · Techflow Ltd", score: 78, action: "Accepted", color: "#10b981" },
  { label: "Marine Cargo · Nordic Freight AS", score: 62, action: "Referred", color: "#f59e0b" },
  { label: "D&O Liability · Axiom Capital", score: 85, action: "Accepted", color: "#10b981" },
  { label: "Property · EuroRetail Group", score: 31, action: "Declined", color: "#ef4444" },
  { label: "Professional Indemnity · LexGroup", score: 71, action: "Accepted", color: "#10b981" },
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % TICKER_EVENTS.length); setVisible(true); }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const ev = TICKER_EVENTS[idx];
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full text-xs"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", transition: "opacity 0.3s", opacity: visible ? 1 : 0 }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ev.color }} />
      <span className="text-slate-400">{ev.label}</span>
      <span className="text-slate-600">·</span>
      <span className="text-slate-500">Score {ev.score}</span>
      <span className="font-semibold" style={{ color: ev.color }}>{ev.action}</span>
      <span className="text-slate-700">· 4 min ago</span>
    </div>
  );
}

const features = [
  {
    icon: Cpu,
    title: "AI extraction in seconds",
    desc: "Claude reads every PDF, Word doc, and email submission. 30+ risk fields extracted with 94% accuracy — no manual entry.",
    tag: "Core",
  },
  {
    icon: Shield,
    title: "Appetite scoring engine",
    desc: "Configure rules by coverage type, jurisdiction, risk score, loss history. AI scores every submission against your appetite automatically.",
    tag: "Rules",
  },
  {
    icon: Globe,
    title: "Lloyd's Blueprint Two ready",
    desc: "Auto-generates Core Data Records on bind. ACORD 28 compliant. Pass the CDR mandate without lifting a finger.",
    tag: "Compliance",
  },
  {
    icon: FileText,
    title: "Broker portal",
    desc: "A clean, branded portal for brokers to submit directly. No email attachments. Real-time status updates. Track every submission.",
    tag: "Portal",
  },
  {
    icon: Database,
    title: "Full audit trail",
    desc: "Every decision, note, and action is logged immutably. SOC 2 Type II certified. GDPR-compliant 7-year retention.",
    tag: "Audit",
  },
  {
    icon: BarChart2,
    title: "Analytics & reporting",
    desc: "Live GWP, bind rate, loss ratio, broker performance, and exposure dashboards. Export compliance reports in one click.",
    tag: "Analytics",
  },
];

const steps = [
  { n: "01", title: "Broker uploads",        desc: "Via email, portal, or API. Any format: PDF, Word, email body." },
  { n: "02", title: "AI extracts & scores",  desc: "Claude reads the document, extracts all risk fields, and scores against your appetite rules." },
  { n: "03", title: "Routed automatically",  desc: "Clean risks accepted, clear declines declined, edge cases referred. In under 10 minutes." },
];

const pricing = [
  {
    name:    "Starter",
    price:   "£1,200",
    per:     "/month",
    desc:    "For small MGAs and coverholders just getting started.",
    features: ["Up to 200 submissions/month", "AI extraction & scoring", "Broker portal", "Email support", "Standard API access"],
    cta:     "Start free trial",
    highlight: false,
  },
  {
    name:    "Growth",
    price:   "£3,500",
    per:     "/month",
    desc:    "For growing teams processing 500+ submissions a month.",
    features: ["Up to 1,000 submissions/month", "Everything in Starter", "Full analytics suite", "Custom appetite rules", "Webhook integrations", "Priority support", "Lloyd's CDR auto-filing"],
    cta:     "Book a demo",
    highlight: true,
  },
  {
    name:    "Enterprise",
    price:   "Custom",
    per:     "",
    desc:    "For syndicates and large MGAs with complex needs.",
    features: ["Unlimited submissions", "Everything in Growth", "Custom AI model fine-tuning", "Dedicated infrastructure", "SSO / SAML", "SLA guarantee", "Onboarding & training"],
    cta:     "Contact us",
    highlight: false,
  },
];

const testimonials = [
  {
    quote:  "Velox cut our average processing time from four hours to eight minutes. Our underwriters now spend time on the risks that need human judgement, not data entry.",
    author: "Sarah Mitchell",
    role:   "Head of Underwriting, Syndicate 2041",
    initials: "SM",
  },
  {
    quote:  "The broker portal alone was worth it. Our intermediaries stopped sending email attachments and our inbox has never been cleaner. The data quality improved overnight.",
    author: "James Okafor",
    role:   "Operations Director, Nexus MGA",
    initials: "JO",
  },
  {
    quote:  "We passed the Blueprint Two CDR audit without any additional engineering work. Velox just handles it. It's the kind of compliance win that makes you look good in front of Lloyd's.",
    author: "Clara Hofmann",
    role:   "CTO, Continental Risk Partners",
    initials: "CH",
  },
];

const navLinks = ["Product", "Pricing", "Security", "Docs", "About"];

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg-base)" }}>
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(8,13,24,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-white font-bold tracking-tight">Velox AI</span>
          <span className="hidden md:inline-block text-[10px] text-slate-600 ml-1 px-1.5 py-0.5 rounded font-mono"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            v2.0
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          <Link href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: "var(--brand)" }}>
            Open platform <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(ellipse, #4f6ef7 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.25)", color: "#818cf8" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Built for Lloyd&apos;s of London coverholders &amp; MGAs
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            Insurance underwriting<br />
            <span style={{
              background: "linear-gradient(135deg, #4f6ef7 0%, #818cf8 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              at AI speed
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Velox reads every submission document the moment it arrives. Extracts all risk data, scores against your appetite, and routes automatically — in under 10 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-12">
            <Link href="/dashboard"
              className="flex items-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-xl transition-all hover:opacity-90"
              style={{ background: "var(--brand)" }}>
              Open platform <ArrowRight size={16} />
            </Link>
            <Link href="/portal"
              className="flex items-center gap-2 text-base font-medium text-slate-300 px-8 py-4 rounded-xl transition-all hover:text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Play size={14} /> Broker portal
            </Link>
          </div>

          {/* Live ticker */}
          <LiveTicker />
        </div>

        {/* Stats bar */}
        <div className="relative z-10 max-w-3xl mx-auto mt-20 w-full">
          <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: "var(--border)" }}>
            {[
              { value: "< 10 min", label: "Avg processing time", sub: "vs 4 hrs manual review" },
              { value: "94%",       label: "Extraction accuracy",   sub: "Across all document types" },
              { value: "10×",       label: "Faster than manual",    sub: "Proven in Lloyd's market" },
            ].map(({ value, label, sub }) => (
              <div key={label} className="py-8 px-6 text-center" style={{ background: "var(--bg-card)" }}>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-slate-300 font-medium mb-0.5">{label}</p>
                <p className="text-xs text-slate-600">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-slate-600 uppercase tracking-widest mb-8">
            Trusted by underwriting teams across the Lloyd&apos;s market
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {["Aon UK", "Marsh", "Howden", "WTW", "Nexus Group", "Canopius", "Beazley"].map(b => (
              <span key={b} className="text-sm font-semibold text-slate-600 hover:text-slate-400 transition-colors">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="product" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything your underwriting team needs
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From first document to bound risk — Velox handles the entire workflow without the manual overhead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="card p-6 group hover:border-indigo-500/30 transition-colors"
                style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(79,110,247,0.12)" }}>
                    <f.icon size={16} style={{ color: "var(--brand)" }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{f.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "rgba(79,110,247,0.03)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-3xl font-bold text-white">How Velox works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px" style={{ background: "var(--border)" }} />
                )}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 font-bold text-sm"
                  style={{ background: "rgba(79,110,247,0.15)", color: "#818cf8", border: "1px solid rgba(79,110,247,0.2)" }}>
                  {s.n}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance banner ─────────────────────────────────── */}
      <section id="security" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="card p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-semibold text-white mb-1">Enterprise-grade compliance, out of the box</h3>
              <p className="text-sm text-slate-500">No additional engineering required to meet Lloyd&apos;s and EU requirements.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "SOC 2 Type II",              color: "#10b981" },
                { label: "GDPR (7-year retention)",    color: "#4f6ef7" },
                { label: "EU AI Act Art. 6(2)",        color: "#8b5cf6" },
                { label: "Lloyd's Blueprint Two CDR",  color: "#f59e0b" },
                { label: "256-bit encryption",         color: "#10b981" },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <CheckCircle size={12} style={{ color: c.color }} />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl font-bold text-white">What underwriters say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map(t => (
              <div key={t.author} className="card p-6 flex flex-col gap-4">
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "var(--brand)" }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.author}</p>
                    <p className="text-[10px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-sm">All plans include a 14-day free trial. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {pricing.map(p => (
              <div key={p.name} className="card p-6 flex flex-col"
                style={p.highlight ? { borderColor: "rgba(79,110,247,0.5)", background: "rgba(79,110,247,0.04)" } : {}}>
                {p.highlight && (
                  <div className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full mb-4 w-fit"
                    style={{ background: "var(--brand)" }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{p.desc}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-bold text-white">{p.price}</span>
                  <span className="text-sm text-slate-500 mb-1">{p.per}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard"
                  className="text-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={p.highlight
                    ? { background: "var(--brand)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid var(--border)" }
                  }>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-600 mt-8">
            All prices ex. VAT. Enterprise contracts available with annual billing discount.
            Need a custom quote? <a href="mailto:sales@velox.ai" className="text-indigo-400 hover:underline">Contact sales</a>.
          </p>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-12 rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(79,110,247,0.12) 0%, rgba(139,92,246,0.08) 100%)", borderColor: "rgba(79,110,247,0.25)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--brand)" }}>
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Start processing submissions today
            </h2>
            <p className="text-slate-400 mb-8">
              Upload a document and see AI extract the data in real time.<br />No setup required. No credit card.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link href="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3.5 rounded-xl transition-all hover:opacity-90 w-full sm:w-auto justify-center"
                style={{ background: "var(--brand)" }}>
                Open platform <ArrowRight size={14} />
              </Link>
              <Link href="/portal"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 px-8 py-3.5 rounded-xl transition-all hover:text-white w-full sm:w-auto justify-center"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Broker portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="px-8 py-10" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
                  <Zap size={11} className="text-white" fill="white" />
                </div>
                <span className="text-white font-bold text-sm">Velox AI</span>
              </div>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                AI-powered insurance submission intake for the Lloyd&apos;s of London market.
                Built in London. SOC 2 Type II certified.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-12 text-xs">
              <div>
                <p className="text-slate-400 font-semibold mb-3">Platform</p>
                {["Dashboard", "Broker portal", "Analytics", "API docs"].map(l => (
                  <p key={l} className="text-slate-600 mb-2 hover:text-slate-400 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-3">Company</p>
                {["About", "Blog", "Careers", "Contact"].map(l => (
                  <p key={l} className="text-slate-600 mb-2 hover:text-slate-400 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-3">Legal</p>
                {["Privacy policy", "Terms of service", "Security", "GDPR"].map(l => (
                  <p key={l} className="text-slate-600 mb-2 hover:text-slate-400 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs text-slate-700">© 2026 Velox AI Ltd. Registered in England & Wales. FCA authorised.</p>
            <div className="flex items-center gap-4">
              {[
                { label: "SOC 2 Type II", color: "#10b981" },
                { label: "GDPR Compliant", color: "#4f6ef7" },
                { label: "Lloyd's approved", color: "#f59e0b" },
              ].map(b => (
                <span key={b.label} className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
