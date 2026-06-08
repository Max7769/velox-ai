"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { startCheckout } from "@/lib/stripe";
import { useTranslation } from "@/lib/i18n";
import {
  Zap, ArrowRight, Shield, Clock, TrendingUp, CheckCircle,
  FileText, BarChart2, Globe, ChevronRight, ChevronDown,
  Play, Cpu, Database, Bell, Menu, X, Mail,
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
function LiveTicker() {
  const { t } = useTranslation();
  const TICKER = [
    { label: "Cyber Liability · Techflow Ltd",        score: 78, action: t("status.accepted"), color: "#10b981" },
    { label: "Marine Cargo · Nordic Freight AS",       score: 62, action: t("status.referred"), color: "#f59e0b" },
    { label: "D&O Liability · Axiom Capital",          score: 85, action: t("status.accepted"), color: "#10b981" },
    { label: "Property · EuroRetail Group",            score: 31, action: t("status.declined"), color: "#ef4444" },
    { label: "Professional Indemnity · LexGroup",      score: 71, action: t("status.accepted"), color: "#10b981" },
  ];
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
      <span className="text-slate-700">· {t("lp.ticker.now")}</span>
    </div>
  );
}

/* ── mini dashboard mockup ──────────────────────────────────────── */
function DashboardPreview() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setMounted(true), 600); return () => clearTimeout(tm); }, []);

  const rows = [
    { id: "VLX-0041", name: "Harwick Shipping Ltd",  type: "Marine Cargo",    score: 82,   status: t("status.accepted"),   sColor: "#10b981" },
    { id: "VLX-0040", name: "Nexus Tech Partners",   type: "Cyber Liability", score: 61,   status: t("status.referred"),   sColor: "#f59e0b" },
    { id: "VLX-0039", name: "Albion Professional",   type: "Prof. Indemnity", score: null, status: t("status.processing"), sColor: "#60a5fa" },
    { id: "VLX-0038", name: "Fairlane Logistics",    type: "Marine Cargo",    score: 29,   status: t("status.declined"),   sColor: "#ef4444" },
    { id: "VLX-0037", name: "Meridian Energy Corp",  type: "Energy",          score: 74,   status: t("status.accepted"),   sColor: "#10b981" },
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
          { label: t("metrics.today"),    value: "24",    delta: "+12%" },
          { label: t("metrics.avgTime"),  value: "8.4m",  delta: "−23%" },
          { label: t("metrics.bindRate"), value: "68%",   delta: "+4pp" },
          { label: "GWP (MTD)",           value: "£2.4M", delta: "+18%" },
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
              {[t("table.id"), t("table.insured"), t("table.coverage"), t("table.score"), t("table.status")].map(h => (
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

/* ── Language switcher ───────────────────────────────────────────── */
function LangSwitch() {
  const { lang, setLang } = useTranslation();
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {(["pl", "en"] as const).map(l => (
        <button key={l} onClick={() => setLang(l)}
          className="px-2.5 py-1 rounded-md text-xs font-bold uppercase transition-all"
          style={lang === l
            ? { background: "var(--brand)", color: "#fff" }
            : { color: "#475569" }}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ── FAQ accordion ──────────────────────────────────────────────── */
function FAQ() {
  const { t } = useTranslation();
  const FAQS = [
    { q: t("lp.faq.q1"), a: t("lp.faq.a1") },
    { q: t("lp.faq.q2"), a: t("lp.faq.a2") },
    { q: t("lp.faq.q3"), a: t("lp.faq.a3") },
    { q: t("lp.faq.q4"), a: t("lp.faq.a4") },
    { q: t("lp.faq.q5"), a: t("lp.faq.a5") },
    { q: t("lp.faq.q6"), a: t("lp.faq.a6") },
    { q: t("lp.faq.q7"), a: t("lp.faq.a7") },
  ];
  const [open, setOpen] = useState<number | null>(null);
  const { ref, inView } = useInView();
  return (
    <section ref={ref} id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">{t("lp.faq.tag")}</p>
          <h2 className="text-3xl font-bold text-white">{t("lp.faq.h2")}</h2>
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
// Feature tags — untranslated (short labels used as visual chips)
const FEAT_TAGS = ["Core", "Rules", "Compliance", "Portal", "Audit", "Analytics"];

/* ══════════════════════════════════════════════════════════════════
   Landing page
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { t } = useTranslation();
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
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }, [email]);

  const navLinks = [
    [t("lp.nav.product"),  "#product"],
    [t("lp.nav.workflow"), "#workflow"],
    [t("lp.nav.pricing"),  "#pricing"],
    [t("lp.nav.security"), "#security"],
    [t("lp.nav.faq"),      "#faq"],
  ];

  const features = [
    { icon: Brain,    title: t("lp.feat.f1t"), desc: t("lp.feat.f1d"), tag: FEAT_TAGS[0], color: "#818cf8" },
    { icon: Shield,   title: t("lp.feat.f2t"), desc: t("lp.feat.f2d"), tag: FEAT_TAGS[1], color: "#10b981" },
    { icon: Globe,    title: t("lp.feat.f3t"), desc: t("lp.feat.f3d"), tag: FEAT_TAGS[2], color: "#f59e0b" },
    { icon: FileText, title: t("lp.feat.f4t"), desc: t("lp.feat.f4d"), tag: FEAT_TAGS[3], color: "#60a5fa" },
    { icon: Database, title: t("lp.feat.f5t"), desc: t("lp.feat.f5d"), tag: FEAT_TAGS[4], color: "#a78bfa" },
    { icon: BarChart2,title: t("lp.feat.f6t"), desc: t("lp.feat.f6d"), tag: FEAT_TAGS[5], color: "#fb923c" },
  ];

  const steps = [
    { n: "01", title: t("lp.how.s1t"), desc: t("lp.how.s1d"), icon: FileText },
    { n: "02", title: t("lp.how.s2t"), desc: t("lp.how.s2d"), icon: Brain },
    { n: "03", title: t("lp.how.s3t"), desc: t("lp.how.s3d"), icon: Zap },
  ];

  const pricing = [
    {
      name: t("lp.price.s.name"),
      monthly: 1200, annual: 960,
      desc: t("lp.price.s.desc"),
      features: [t("lp.price.s.f1"), t("lp.price.s.f2"), t("lp.price.s.f3"), t("lp.price.s.f4"), t("lp.price.s.f5"), t("lp.price.s.f6")],
      cta: t("lp.price.s.cta"), highlight: false,
    },
    {
      name: t("lp.price.g.name"),
      monthly: 3500, annual: 2800,
      desc: t("lp.price.g.desc"),
      features: [t("lp.price.g.f1"), t("lp.price.g.f2"), t("lp.price.g.f3"), t("lp.price.g.f4"), t("lp.price.g.f5"), t("lp.price.g.f6"), t("lp.price.g.f7"), t("lp.price.g.f8")],
      cta: t("lp.price.g.cta"), highlight: true,
    },
    {
      name: t("lp.price.e.name"),
      monthly: null, annual: null,
      desc: t("lp.price.e.desc"),
      features: [t("lp.price.e.f1"), t("lp.price.e.f2"), t("lp.price.e.f3"), t("lp.price.e.f4"), t("lp.price.e.f5"), t("lp.price.e.f6"), t("lp.price.e.f7")],
      cta: t("lp.price.e.cta"), highlight: false,
    },
  ];


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
          {navLinks.map(([l, h]) => (
            <a key={h} href={h} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LangSwitch />
          <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors">{t("lp.nav.signIn")}</Link>
          <Link href="/demo"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 px-3.5 py-2 rounded-lg transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Play size={11} /> {t("lp.nav.demo")}
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: "var(--brand)" }}>
            {t("lp.nav.open")} <ArrowRight size={13} />
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
            {navLinks.map(([l, h]) => (
              <a key={h} href={h} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-base text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                {l}
              </a>
            ))}
            <div className="px-4 py-3"><LangSwitch /></div>
          </div>
          <div className="space-y-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--brand)" }}>
              {t("lp.nav.open")} <ArrowRight size={14} />
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
            {t("lp.hero.badge")}
            <ChevronRight size={11} />
          </div>

          <h1 className="text-5xl md:text-[72px] font-bold text-white mb-6 leading-[1.04] tracking-tight">
            {t("lp.hero.h1a")}<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 45%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {t("lp.hero.h1b")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("lp.hero.sub")}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-14">
            <Link href="/dashboard"
              className="flex items-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "var(--brand)", boxShadow: "0 0 40px rgba(79,110,247,0.3)" }}>
              {t("lp.hero.cta")} <ArrowRight size={16} />
            </Link>
            <Link href="/demo"
              className="flex items-center gap-2 text-base font-medium text-slate-300 px-8 py-4 rounded-xl transition-all hover:text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Play size={14} /> {t("lp.hero.demo")} <span className="text-slate-600 text-sm">{t("lp.hero.demoSub")}</span>
            </Link>
          </div>

          <LiveTicker />

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-600">
            <CheckCircle size={11} className="text-emerald-600" />
            {t("lp.hero.proof1")}
            <span className="mx-2">·</span>
            <CheckCircle size={11} className="text-emerald-600" />
            {t("lp.hero.proof2")}
            <span className="mx-2">·</span>
            <CheckCircle size={11} className="text-emerald-600" />
            {t("lp.hero.proof3")}
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
            { value: t("lp.stat1v"), label: t("lp.stat1l"), sub: t("lp.stat1s") },
            { value: t("lp.stat2v"), label: t("lp.stat2l"), sub: t("lp.stat2s") },
            { value: t("lp.stat3v"), label: t("lp.stat3l"), sub: t("lp.stat3s") },
            { value: t("lp.stat4v"), label: t("lp.stat4l"), sub: t("lp.stat4s") },
          ].map(({ value, label, sub }) => (
            <div key={label} className="py-8 px-6 text-center" style={{ borderRight: "1px solid var(--border)" }}>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
              <p className="text-sm text-slate-300 font-medium mb-0.5">{label}</p>
              <p className="text-xs text-slate-600">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem section ───────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-3">{t("lp.prob.tag")}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("lp.prob.h2")}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">{t("lp.prob.sub")}</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Pain points */}
            <FadeIn delay={100}>
              <div className="card p-6 h-full" style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)" }}>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-5">{t("lp.prob.bad")}</p>
                <div className="space-y-4">
                  {[
                    { stat: t("lp.prob.b1s"), label: t("lp.prob.b1l") },
                    { stat: t("lp.prob.b2s"), label: t("lp.prob.b2l") },
                    { stat: t("lp.prob.b3s"), label: t("lp.prob.b3l") },
                    { stat: t("lp.prob.b4s"), label: t("lp.prob.b4l") },
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
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-5">{t("lp.prob.good")}</p>
                <div className="space-y-4">
                  {[
                    { stat: t("lp.prob.g1s"), label: t("lp.prob.g1l") },
                    { stat: t("lp.prob.g2s"), label: t("lp.prob.g2l") },
                    { stat: t("lp.prob.g3s"), label: t("lp.prob.g3l") },
                    { stat: t("lp.prob.g4s"), label: t("lp.prob.g4l") },
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
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">{t("lp.feat.tag")}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("lp.feat.h2")}</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">{t("lp.feat.sub")}</p>
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
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">{t("lp.how.tag")}</p>
              <h2 className="text-3xl font-bold text-white mb-4">{t("lp.how.h2")}</h2>
              <p className="text-slate-400 max-w-xl mx-auto">{t("lp.how.sub")}</p>
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
                  <h3 className="text-sm font-semibold text-white mb-0.5">{t("lp.compl.h3")}</h3>
                  <p className="text-xs text-slate-500">{t("lp.compl.sub")}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "SOC 2 Type II — on roadmap",        color: "#10b981" },
                  { label: "GDPR-aligned · 7-year retention",   color: "#4f6ef7" },
                  { label: "Designed for EU AI Act Art. 6(2)",  color: "#8b5cf6" },
                  { label: "Built around Blueprint Two CDR",    color: "#f59e0b" },
                  { label: "256-bit AES encryption",            color: "#10b981" },
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

      {/* ── Early access (honest — no fabricated customers/results) ── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">{t("lp.testi.tag")}</p>
            <h2 className="text-3xl font-bold text-white mb-5">{t("lp.testi.h2")}</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">{t("lp.testi.body")}</p>
            <a href="#cta"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: "var(--brand)" }}>
              {t("lp.testi.cta")} <ArrowRight size={14} />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">{t("lp.price.tag")}</p>
              <h2 className="text-3xl font-bold text-white mb-3">{t("lp.price.h2")}</h2>
              <p className="text-slate-500 text-sm mb-6">{t("lp.price.sub")}</p>

              {/* Annual/monthly toggle */}
              <div className="inline-flex items-center rounded-xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                {(["monthly", "annual"] as const).map(b => (
                  <button key={b} onClick={() => setBilling(b)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: billing === b ? "var(--brand)" : "transparent",
                      color: billing === b ? "white" : "#64748b",
                    }}>
                    {b === "monthly" ? t("lp.price.monthly") : t("lp.price.annual")}
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
                        <div className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full mb-4 w-fit uppercase"
                          style={{ background: "var(--brand)" }}>
                          {t("lp.price.popular")}
                        </div>
                      </>
                    )}
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-5">{p.desc}</p>
                    <div className="flex items-end gap-1 mb-6">
                      {price !== null ? (
                        <>
                          <span className="text-4xl font-bold text-white">£{price.toLocaleString()}</span>
                          <span className="text-sm text-slate-500 mb-1">{t("lp.price.mo")}</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-white">{t("lp.price.custom")}</span>
                      )}
                    </div>
                    {billing === "annual" && price !== null && (
                      <p className="text-xs text-emerald-500 -mt-4 mb-4 font-medium">
                        {t("lp.price.save")} £{((p.monthly! - price) * 12).toLocaleString()}{t("lp.price.yr")}
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
            {t("lp.price.vat")}
            {" "}<a href="mailto:max@velox-ai.io" className="text-indigo-500 hover:text-indigo-400 transition-colors">{t("lp.price.vatLink")}</a> {t("lp.price.vatEnd")}
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Email capture CTA ──────────────────────────────── */}
      <section id="cta" className="py-24 px-6" style={{ borderTop: "1px solid var(--border)" }}>
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
                {t("lp.cta.h2")}
              </h2>
              <p className="text-slate-400 mb-8 relative">{t("lp.cta.sub")}</p>

              {!emailSent ? (
                <form onSubmit={handleEmailCapture} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6 relative">
                  <div className="flex-1 relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t("lp.cta.form")}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    />
                  </div>
                  <button type="submit"
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90"
                    style={{ background: "var(--brand)" }}>
                    {t("lp.cta.btn")}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-emerald-400 mb-6 relative"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <CheckCircle size={15} />
                  {t("lp.cta.sent")}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center relative">
                <Link href="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-xl w-full sm:w-auto justify-center transition-all hover:opacity-90"
                  style={{ background: "var(--brand)" }}>
                  {t("lp.nav.open")} <ArrowRight size={14} />
                </Link>
                <Link href="/demo"
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 px-8 py-3 rounded-xl w-full sm:w-auto justify-center transition-all hover:text-white"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Play size={13} /> {t("lp.nav.demo")}
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
                {t("lp.footer.brand")}
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "Early access",   color: "#10b981" },
                  { label: "GDPR-aligned",   color: "#4f6ef7" },
                  { label: "Lloyd's-ready",  color: "#f59e0b" },
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
                <p className="text-slate-400 font-semibold mb-3">{t("lp.footer.col1")}</p>
                {[["Dashboard", "/dashboard"], [t("nav.brokerPortal"), "/portal"], ["Demo", "/demo"], [t("nav.analytics"), "/dashboard/analytics"]].map(([l, h]) => (
                  <Link key={l} href={h} className="block text-slate-600 mb-2 hover:text-slate-400 transition-colors">{l}</Link>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-3">{t("lp.footer.col2")}</p>
                {[t("lp.feat.f1t"), t("lp.feat.f2t"), t("lp.feat.f3t"), "API"].map(l => (
                  <p key={l} className="text-slate-600 mb-2 hover:text-slate-400 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-3">{t("lp.footer.col3")}</p>
                {["About", "Blog", "Careers", "Contact"].map(l => (
                  <p key={l} className="text-slate-600 mb-2 hover:text-slate-400 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-3">{t("lp.footer.col4")}</p>
                {["Privacy", "Terms", "Security", "GDPR"].map(l => (
                  <p key={l} className="text-slate-600 mb-2 hover:text-slate-400 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs text-slate-700">{t("lp.footer.copy")}</p>
            <div className="flex items-center gap-4 text-xs text-slate-700">
              <a href="mailto:max@velox-ai.io" className="hover:text-slate-500 transition-colors">max@velox-ai.io</a>
              <span>·</span>
              <span>London, UK</span>
              <span>·</span>
              <Link href="/sign-in" className="hover:text-slate-500 transition-colors">{t("lp.footer.signin")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
