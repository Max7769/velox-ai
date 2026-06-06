"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { startCheckout } from "@/lib/stripe";
import {
  Zap, ArrowRight, Shield, Clock, TrendingUp, CheckCircle,
  FileText, BarChart2, Globe, ChevronRight, ChevronDown,
  Star, Play, Cpu, Database, Bell, Menu, X, Mail,
  Brain, Lock, Users, Sparkles, AlertCircle,
} from "lucide-react";

/* ── hooks ──────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── live ticker ─────────────────────────────────────────────────── */
const TICKER = [
  { label: "Cyber Liability · Techflow Ltd",        score: 78, action: "Accepted", color: "#10b981" },
  { label: "Marine Cargo · Nordic Freight AS",       score: 62, action: "Referred", color: "#f59e0b" },
  { label: "D&O Liability · Axiom Capital",          score: 85, action: "Accepted", color: "#10b981" },
  { label: "Property · EuroRetail Group",            score: 31, action: "Declined", color: "#ef4444" },
  { label: "Professional Indemnity · LexGroup",      score: 71, action: "Accepted", color: "#10b981" },
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % TICKER.length); setVisible(true); }, 280);
    }, 2800);
    return () => clearInterval(id);
  }, []);
  const ev = TICKER[idx];
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", transition: "opacity 0.3s", opacity: visible ? 1 : 0 }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ev.color }} />
      <span className="text-slate-400">{ev.label}</span>
      <span className="text-slate-700">·</span>
      <span className="text-slate-500">Score {ev.score}</span>
      <span className="font-semibold" style={{ color: ev.color }}>{ev.action}</span>
      <span className="text-slate-700">· just now</span>
    </div>
  );
}

/* ── mini dashboard mockup ──────────────────────────────────────── */
function DashboardPreview() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 600); return () => clearTimeout(t); }, []);

  const rows = [
    { id: "VLX-0041", name: "Harwick Shipping Ltd",  type: "Marine Cargo",        score: 82, status: "Accepted",   sColor: "#10b981" },
    { id: "VLX-0040", name: "Nexus Tech Partners",   type: "Cyber Liability",     score: 61, status: "Referred",   sColor: "#f59e0b" },
    { id: "VLX-0039", name: "Albion Professional",   type: "Prof. Indemnity",     score: null, status: "Processing", sColor: "#60a5fa" },
    { id: "VLX-0038", name: "Fairlane Logistics",    type: "Marine Cargo",        score: 29, status: "Declined",   sColor: "#ef4444" },
    { id: "VLX-0037", name: "Meridian Energy Corp",  type: "Energy",              score: 74, status: "Accepted",   sColor: "#10b981" },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "var(--bg-card)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10b981" }} />
        <span className="text-[10px] text-slate-700 ml-2 font-mono">velox.ai/dashboard/submissions</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-600">Live</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
        {[
          { label: "Today", value: "24", delta: "+12%" },
          { label: "Avg time", value: "8.4m", delta: "−23%" },
          { label: "Bind rate", value: "68%", delta: "+4pp" },
          { label: "GWP (MTD)", value: "£2.4M", delta: "+18%" },
        ].map(({ label, value, delta }) => (
          <div key={label} className="px-4 py-3" style={{ background: "var(--bg-card)" }}>
            <p className="text-[10px] text-slate-600 mb-1">{label}</p>
            <p className="text-base font-bold text-white">{value}</p>
            <p className="text-[10px] text-emerald-500">{delta}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="p-3">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["ID", "Insured", "Coverage", "Score", "Status"].map(h => (
                <th key={h} className="text-left pb-2 px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}
                className="transition-colors hover:bg-white/[0.02]"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(4px)",
                  transition: `all 0.4s ease ${i * 80}ms`,
                }}>
                <td className="px-2 py-2.5 font-mono text-slate-600">{r.id}</td>
                <td className="px-2 py-2.5 text-slate-300 font-medium">{r.name}</td>
                <td className="px-2 py-2.5 text-slate-500">{r.type}</td>
                <td className="px-2 py-2.5">
                  {r.score !== null ? (
                    <span className="font-bold tabular-nums" style={{ color: r.score >= 70 ? "#10b981" : r.score >= 50 ? "#f59e0b" : "#ef4444" }}>
                      {r.score}
                    </span>
                  ) : (
                    <span className="text-slate-700">—</span>
                  )}
                </td>
                <td className="px-2 py-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: `${r.sColor}18`, color: r.sColor }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── FAQ accordion ──────────────────────────────────────────────── */
const FAQS = [
  {
    q: "How long does setup take?",
    a: "Under an hour. Connect your Supabase database, add your Anthropic API key, and you're live. Our team handles onboarding calls for Growth and Enterprise customers.",
  },
  {
    q: "What document formats does Velox support?",
    a: "PDF, Word (.docx), plain text, and structured email bodies. Scanned PDFs are processed via OCR. We also support ACORD XML and CSV bulk uploads via the API.",
  },
  {
    q: "Can I customise the appetite rules?",
    a: "Yes — fully. From the Settings page you can define rules by coverage type, score threshold, loss history keywords, jurisdiction, limit size, and more. Rules are evaluated in priority order and can trigger accept, decline, or refer.",
  },
  {
    q: "Is Velox compliant with Lloyd's Blueprint Two?",
    a: "Yes. Velox auto-generates Core Data Records (CDR) in the required format on every bind. We keep these records for 7 years in encrypted storage to meet GDPR and Lloyd's mandated retention requirements.",
  },
  {
    q: "How accurate is the AI extraction?",
    a: "94% field accuracy across our test corpus of 5,000+ Lloyd's submissions. Confidence scores are generated per-extraction so underwriters can see exactly how certain the AI is about each field.",
  },
  {
    q: "Can we white-label the broker portal?",
    a: "Yes — Growth and Enterprise plans include custom domain, logo, and colour scheme for the broker portal. Brokers see your branding, not Velox's.",
  },
  {
    q: "What happens if the AI makes a mistake?",
    a: "Every AI decision is reviewable before it's actioned. Underwriters can override any extraction field or decision with a full audit trail. The AI handles triage; humans retain final authority.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, inView } = useInView();
  return (
    <section ref={ref} id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl font-bold text-white">Common questions</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i}
              className="rounded-xl overflow-hidden transition-all duration-500"
              style={{
                background: "var(--bg-card)",
                border: open === i ? "1px solid rgba(79,110,247,0.3)" : "1px solid var(--border)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(8px)",
                transitionDelay: `${i * 50}ms`,
              }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-slate-200">{faq.q}</span>
                <ChevronDown size={15} className="text-slate-500 flex-shrink-0 ml-4 transition-transform"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── section wrapper with scroll animation ─────────────────────── */
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className}
      style={{ transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`, opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)" }}>
      {children}
    </div>
  );
}

/* ── data ───────────────────────────────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: "AI extraction in 45 seconds",
    desc: "Claude claude-sonnet-4-6 reads every submission document the moment it arrives — PDF, Word, or email body. 30+ risk fields extracted with 94% accuracy.",
    tag: "Core",
    color: "#818cf8",
  },
  {
    icon: Shield,
    title: "Appetite scoring engine",
    desc: "Configure rules by coverage type, score threshold, jurisdiction, loss history. AI scores every submission and routes it automatically — no human in the loop.",
    tag: "Rules",
    color: "#10b981",
  },
  {
    icon: Globe,
    title: "Lloyd's Blueprint Two ready",
    desc: "Auto-generates Core Data Records on every bind. ACORD 28 compliant. Pass the CDR mandate without any additional engineering work.",
    tag: "Compliance",
    color: "#f59e0b",
  },
  {
    icon: FileText,
    title: "Branded broker portal",
    desc: "A clean self-serve portal for brokers. No email attachments. Real-time status updates. White-label with your logo and domain on Growth+.",
    tag: "Portal",
    color: "#60a5fa",
  },
  {
    icon: Database,
    title: "Immutable audit trail",
    desc: "Every decision, note, and field change is logged with actor, timestamp, and reason. SOC 2 Type II. GDPR-compliant 7-year encrypted retention.",
    tag: "Audit",
    color: "#a78bfa",
  },
  {
    icon: BarChart2,
    title: "Portfolio analytics",
    desc: "Live GWP, bind rate, loss ratio tracker, broker performance matrix, and exposure heatmaps. Export compliance reports in one click.",
    tag: "Analytics",
    color: "#fb923c",
  },
];

const steps = [
  {
    n: "01",
    title: "Broker submits",
    desc: "Via the branded portal, email, or REST API. PDF, Word, or plain text — any format accepted.",
    icon: FileText,
  },
  {
    n: "02",
    title: "AI extracts & scores",
    desc: "Claude reads the document, extracts 30+ risk fields, generates a 0–100 score with full factor breakdown and premium model.",
    icon: Brain,
  },
  {
    n: "03",
    title: "Automated routing",
    desc: "Clean risks accepted, clear declines declined, edge cases referred — all within 8 minutes. Underwriters review only what matters.",
    icon: Zap,
  },
];

const pricing = [
  {
    name: "Starter",
    monthly: 1200,
    annual: 960,
    desc: "For small MGAs and coverholders just getting started.",
    features: [
      "Up to 200 submissions/month",
      "AI extraction & scoring",
      "Broker portal",
      "5 appetite rules",
      "Email support",
      "Standard API access",
    ],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Growth",
    monthly: 3500,
    annual: 2800,
    desc: "For growing teams processing 500+ submissions a month.",
    features: [
      "Up to 1,000 submissions/month",
      "Everything in Starter",
      "Full analytics suite",
      "Unlimited appetite rules",
      "Webhook integrations",
      "White-label broker portal",
      "Priority support (4h SLA)",
      "Lloyd's CDR auto-filing",
    ],
    cta: "Book a demo",
    highlight: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    annual: null,
    desc: "For syndicates and large MGAs with complex needs.",
    features: [
      "Unlimited submissions",
      "Everything in Growth",
      "Custom AI model fine-tuning",
      "Dedicated infrastructure",
      "SSO / SAML",
      "99.9% SLA guarantee",
      "Dedicated onboarding & CSM",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

const testimonials = [
  {
    quote: "Velox cut our average processing time from four hours to eight minutes. Our underwriters now spend time on risks that need human judgement — not data entry.",
    author: "Sarah Mitchell",
    role: "Head of Underwriting, Syndicate 2041",
    initials: "SM",
    color: "#818cf8",
  },
  {
    quote: "The broker portal alone was worth it. Our intermediaries stopped sending email attachments and our inbox has never been cleaner. Data quality improved overnight.",
    author: "James Okafor",
    role: "Operations Director, Nexus MGA",
    initials: "JO",
    color: "#10b981",
  },
  {
    quote: "We passed the Blueprint Two CDR audit without any additional engineering work. Velox just handles it. That kind of compliance win makes you look very good in front of Lloyd's.",
    author: "Clara Hofmann",
    role: "CTO, Continental Risk Partners",
    initials: "CH",
    color: "#f59e0b",
  },
];

const brokers = ["Aon UK", "Marsh", "Howden", "WTW", "Nexus Group", "Canopius", "Beazley"];

/* ══════════════════════════════════════════════════════════════════
   Landing page
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleEmailCapture = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setEmailSent(true);
    // Fire and forget — don't block the success state on network
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }, [email]);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg-base)" }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-8 py-3.5 transition-all duration-300 ${
        scrolled ? "shadow-xl" : ""
      }`}
        style={{ background: scrolled ? "rgba(8,13,24,0.95)" : "rgba(8,13,24,0.7)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "transparent"}` }}>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-white font-bold tracking-tight">Velox AI</span>
          <span className="hidden md:inline text-[10px] text-slate-700 ml-0.5 px-1.5 py-0.5 rounded font-mono"
            style={{ background: "rgba(255,255,255,0.04)" }}>v2.0</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[["Product", "#product"], ["Workflow", "#workflow"], ["Pricing", "#pricing"], ["Security", "#security"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={l} href={h} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          <Link href="/demo"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 px-3.5 py-2 rounded-lg transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Play size={11} /> Demo
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: "var(--brand)" }}>
            Open platform <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 px-6 pb-8 flex flex-col"
          style={{ background: "rgba(8,13,24,0.98)", backdropFilter: "blur(20px)" }}>
          <div className="flex-1 space-y-1 mt-4">
            {[["Product", "#product"], ["Workflow", "#workflow"], ["Pricing", "#pricing"], ["Security", "#security"], ["FAQ", "#faq"]].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-base text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                {l}
              </a>
            ))}
          </div>
          <div className="space-y-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--brand)" }}>
              Open platform <ArrowRight size={14} />
            </Link>
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center py-3.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center overflow-hidden">

        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-25"
            style={{ background: "radial-gradient(ellipse at center, #4f6ef7 0%, transparent 65%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] opacity-10"
            style={{ background: "radial-gradient(ellipse, #8b5cf6 0%, transparent 70%)", filter: "blur(60px)" }} />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-7"
            style={{ background: "rgba(79,110,247,0.12)", border: "1px solid rgba(79,110,247,0.3)", color: "#818cf8" }}>
            <Sparkles size={11} />
            Built for Lloyd&apos;s of London coverholders &amp; MGAs
            <ChevronRight size={11} />
          </div>

          <h1 className="text-5xl md:text-[72px] font-bold text-white mb-6 leading-[1.04] tracking-tight">
            Insurance underwriting<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 45%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              at the speed of AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Velox reads every submission the moment it arrives — extracts all risk data, scores against your appetite, and routes automatically. Under 10 minutes, every time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-14">
            <Link href="/dashboard"
              className="flex items-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "var(--brand)", boxShadow: "0 0 40px rgba(79,110,247,0.3)" }}>
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link href="/demo"
              className="flex items-center gap-2 text-base font-medium text-slate-300 px-8 py-4 rounded-xl transition-all hover:text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Play size={14} /> Watch demo <span className="text-slate-600 text-sm">· 60 sec</span>
            </Link>
          </div>

          <LiveTicker />

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-600">
            <CheckCircle size={11} className="text-emerald-600" />
            No credit card required
            <span className="mx-2">·</span>
            <CheckCircle size={11} className="text-emerald-600" />
            14-day free trial
            <span className="mx-2">·</span>
            <CheckCircle size={11} className="text-emerald-600" />
            SOC 2 Type II certified
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-20">
          <div className="absolute -inset-4 opacity-30 rounded-3xl" style={{ background: "radial-gradient(ellipse, #4f6ef7 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="relative">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { value: "< 10 min",  label: "Avg processing time",  sub: "vs 4 hours manual" },
            { value: "94%",        label: "AI extraction accuracy", sub: "Across all doc types" },
            { value: "10×",        label: "Faster than manual",     sub: "Proven Lloyd's market" },
            { value: "£46B",       label: "Lloyd's GWP addressed",  sub: "Total addressable market" },
          ].map(({ value, label, sub }) => (
            <div key={label} className="py-8 px-6 text-center" style={{ borderRight: "1px solid var(--border)" }}>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
              <p className="text-sm text-slate-300 font-medium mb-0.5">{label}</p>
              <p className="text-xs text-slate-600">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Broker logos ───────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-slate-700 uppercase tracking-widest mb-8">
            Trusted by underwriting teams across the Lloyd&apos;s market
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
            {brokers.map(b => (
              <span key={b} className="text-sm font-bold text-slate-700 hover:text-slate-500 transition-colors cursor-default tracking-wide">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem section ───────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-3">The problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Insurance underwriting is stuck<br />in the 1980s
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Lloyd's alone processes £46B in premiums annually — almost entirely through email attachments, spreadsheets, and manual triage.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Pain points */}
            <FadeIn delay={100}>
              <div className="card p-6 h-full" style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)" }}>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-5">Without Velox</p>
                <div className="space-y-4">
                  {[
                    { stat: "3–5 days", label: "average broker turnaround time" },
                    { stat: "60%",      label: "of underwriter time spent on data entry" },
                    { stat: "23%",      label: "of viable business turned away due to capacity" },
                    { stat: "£0",       label: "audit trail for AI-assisted decisions" },
                  ].map(({ stat, label }) => (
                    <div key={stat} className="flex items-center gap-3">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                      <span className="text-sm text-slate-400">
                        <span className="font-bold text-red-300">{stat}</span> {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Solution */}
            <FadeIn delay={200}>
              <div className="card p-6 h-full" style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.03)" }}>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-5">With Velox</p>
                <div className="space-y-4">
                  {[
                    { stat: "< 8 min",  label: "from document upload to decision" },
                    { stat: "94%",       label: "of fields extracted automatically, zero manual entry" },
                    { stat: "3×",        label: "more submissions processed with the same team" },
                    { stat: "100%",      label: "of decisions logged with full AI reasoning" },
                  ].map(({ stat, label }) => (
                    <div key={stat} className="flex items-center gap-3">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-slate-400">
                        <span className="font-bold text-emerald-300">{stat}</span> {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="product" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Platform</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything your underwriting team needs
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                From first document to bound risk — Velox handles the entire workflow without the manual overhead.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="card p-6 h-full group hover:scale-[1.01] transition-transform"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}18` }}>
                      <f.icon size={17} style={{ color: f.color }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: f.color }}>{f.tag}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Workflow</p>
              <h2 className="text-3xl font-bold text-white mb-4">From inbox to decision in three steps</h2>
              <p className="text-slate-400 max-w-xl mx-auto">No rip-and-replace. Velox slots into your existing workflow.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(33%-16px)] right-[calc(33%-16px)] h-px" style={{ background: "var(--border)" }} />

            {steps.map((s, i) => (
              <FadeIn key={s.n} delay={i * 120}>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                    style={{ background: "rgba(79,110,247,0.12)", border: "1px solid rgba(79,110,247,0.25)" }}>
                    <s.icon size={22} style={{ color: "#818cf8" }} />
                  </div>
                  <div className="absolute top-0 left-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: "var(--brand)", color: "white", transform: "translate(-4px, -4px)" }}>
                    {i + 1}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance banner ─────────────────────────────────── */}
      <section id="security" className="py-16 px-6" style={{ borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="card p-8 flex flex-wrap items-center justify-between gap-6"
              style={{ background: "rgba(79,110,247,0.04)", borderColor: "rgba(79,110,247,0.15)" }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(79,110,247,0.15)" }}>
                  <Lock size={18} style={{ color: "#818cf8" }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">Enterprise-grade compliance, out of the box</h3>
                  <p className="text-xs text-slate-500">No additional engineering required to meet Lloyd&apos;s and EU requirements.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "SOC 2 Type II",             color: "#10b981" },
                  { label: "GDPR · 7-year retention",   color: "#4f6ef7" },
                  { label: "EU AI Act Art. 6(2)",        color: "#8b5cf6" },
                  { label: "Lloyd's Blueprint Two CDR",  color: "#f59e0b" },
                  { label: "256-bit AES encryption",     color: "#10b981" },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <CheckCircle size={11} style={{ color: c.color }} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Testimonials</p>
              <h2 className="text-3xl font-bold text-white">What underwriters say</h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <FadeIn key={t.author} delay={i * 100}>
                <div className="card p-6 flex flex-col h-full">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 mt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: t.color }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{t.author}</p>
                      <p className="text-[10px] text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Pricing</p>
              <h2 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h2>
              <p className="text-slate-500 text-sm mb-6">All plans include a 14-day free trial. No credit card required.</p>

              {/* Annual/monthly toggle */}
              <div className="inline-flex items-center rounded-xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                {(["monthly", "annual"] as const).map(b => (
                  <button key={b} onClick={() => setBilling(b)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: billing === b ? "var(--brand)" : "transparent",
                      color: billing === b ? "white" : "#64748b",
                    }}>
                    {b === "monthly" ? "Monthly" : "Annual · save 20%"}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4">
            {pricing.map((p, i) => {
              const price = billing === "annual" ? p.annual : p.monthly;
              return (
                <FadeIn key={p.name} delay={i * 100}>
                  <div className="card p-6 flex flex-col h-full relative overflow-hidden"
                    style={p.highlight
                      ? { borderColor: "rgba(79,110,247,0.5)", background: "rgba(79,110,247,0.05)" }
                      : {}}>
                    {p.highlight && (
                      <>
                        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20"
                          style={{ background: "var(--brand)", filter: "blur(20px)" }} />
                        <div className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full mb-4 w-fit"
                          style={{ background: "var(--brand)" }}>
                          MOST POPULAR
                        </div>
                      </>
                    )}
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-5">{p.desc}</p>
                    <div className="flex items-end gap-1 mb-6">
                      {price !== null ? (
                        <>
                          <span className="text-4xl font-bold text-white">£{price.toLocaleString()}</span>
                          <span className="text-sm text-slate-500 mb-1">/mo</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-white">Custom</span>
                      )}
                    </div>
                    {billing === "annual" && price !== null && (
                      <p className="text-xs text-emerald-500 -mt-4 mb-4 font-medium">
                        Save £{((p.monthly! - price) * 12).toLocaleString()}/year
                      </p>
                    )}
                    <ul className="space-y-2.5 mb-8 flex-1">
                      {p.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        if (p.name === "Enterprise") {
                          window.location.href = "mailto:uzarek.maksymilian@gmail.com?subject=Velox AI Enterprise enquiry";
                        } else {
                          startCheckout(p.name.toLowerCase(), undefined, billing === "annual");
                        }
                      }}
                      className="w-full text-center py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                      style={p.highlight
                        ? { background: "var(--brand)", color: "#fff" }
                        : { background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid var(--border)" }}>
                      {p.cta}
                    </button>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-700 mt-8">
            All prices ex. VAT · Enterprise contracts available with annual billing discount ·
            {" "}<a href="mailto:max@velox-ai.io" className="text-indigo-500 hover:text-indigo-400 transition-colors">Contact sales</a> for a custom quote
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Email capture CTA ──────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <div className="card p-12 rounded-2xl relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(79,110,247,0.1) 0%, rgba(139,92,246,0.06) 100%)", borderColor: "rgba(79,110,247,0.2)" }}>

              {/* Background glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
                style={{ background: "var(--brand)", filter: "blur(40px)" }} />

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                style={{ background: "var(--brand)", boxShadow: "0 0 40px rgba(79,110,247,0.4)" }}>
                <Zap size={24} className="text-white" fill="white" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 relative">
                Start processing submissions today
              </h2>
              <p className="text-slate-400 mb-8 relative">
                Upload a document and see AI extract the data in real time.<br />
                No setup required. No credit card. Cancel any time.
              </p>

              {!emailSent ? (
                <form onSubmit={handleEmailCapture} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6 relative">
                  <div className="flex-1 relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@mga.co.uk"
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    />
                  </div>
                  <button type="submit"
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90"
                    style={{ background: "var(--brand)" }}>
                    Get early access
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-emerald-400 mb-6 relative"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <CheckCircle size={15} />
                  We&apos;ll be in touch within 24 hours.
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center relative">
                <Link href="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-xl w-full sm:w-auto justify-center transition-all hover:opacity-90"
                  style={{ background: "var(--brand)" }}>
                  Open platform <ArrowRight size={14} />
                </Link>
                <Link href="/demo"
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 px-8 py-3 rounded-xl w-full sm:w-auto justify-center transition-all hover:text-white"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Play size={13} /> Watch the demo
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-8 py-14" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
                  <Zap size={13} className="text-white" fill="white" />
                </div>
                <span className="text-white font-bold">Velox AI</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                AI-powered insurance submission intake for the Lloyd&apos;s of London market. Built to make underwriting faster, consistent, and scalable.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "SOC 2",    color: "#10b981" },
                  { label: "GDPR",     color: "#4f6ef7" },
                  { label: "Lloyd's",  color: "#f59e0b" },
                ].map(b => (
                  <span key={b.label} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded"
                    style={{ background: `${b.color}12`, color: b.color, border: `1px solid ${b.color}22` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs flex-1">
              <div>
                <p className="text-slate-400 font-semibold mb-3">Platform</p>
                {[["Dashboard", "/dashboard"], ["Broker portal", "/portal"], ["Investor demo", "/demo"], ["Analytics", "/dashboard/analytics"]].map(([l, h]) => (
                  <Link key={l} href={h} className="block text-slate-600 mb-2 hover:text-slate-400 transition-colors">{l}</Link>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-3">Product</p>
                {["AI extraction", "Risk scoring", "Appetite rules", "API docs"].map(l => (
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

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs text-slate-700">© 2026 Velox AI Ltd. Registered in England &amp; Wales. FCA authorised.</p>
            <div className="flex items-center gap-4 text-xs text-slate-700">
              <a href="mailto:max@velox-ai.io" className="hover:text-slate-500 transition-colors">max@velox-ai.io</a>
              <span>·</span>
              <span>London, UK</span>
              <span>·</span>
              <Link href="/sign-in" className="hover:text-slate-500 transition-colors">Sign in</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
