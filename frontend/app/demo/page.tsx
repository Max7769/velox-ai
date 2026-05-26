"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Zap, ChevronRight, ChevronLeft, X, Play, Pause,
  FileText, Brain, BarChart2, Shield, TrendingUp,
  CheckCircle, Clock, Users, DollarSign, ArrowRight,
  Sparkles, Globe, AlertCircle,
} from "lucide-react";

/* ── animated counter ──────────────────────────────────────────── */
function Counter({ to, prefix = "", suffix = "", duration = 1800 }: {
  to: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ── typewriter ────────────────────────────────────────────────── */
function Typewriter({ text, delay = 0, speed = 28 }: { text: string; delay?: number; speed?: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    const t = setTimeout(() => {
      let i = 0;
      const tick = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(tick);
      }, speed);
      return () => clearInterval(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay, speed]);
  return <span>{shown}<span className="opacity-60 animate-pulse">|</span></span>;
}

/* ── animated bar ──────────────────────────────────────────────── */
function AnimBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

/* ── score ring ────────────────────────────────────────────────── */
function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!animate) { setCurrent(0); return; }
    let v = 0;
    const tick = setInterval(() => {
      v = Math.min(v + 2, score);
      setCurrent(v);
      if (v >= score) clearInterval(tick);
    }, 20);
    return () => clearInterval(tick);
  }, [score, animate]);

  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (current / 100) * circ;
  const color = current >= 70 ? "#10b981" : current >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={64} cy={64} r={r} fill="none" strokeWidth={8} stroke="rgba(255,255,255,0.06)" />
        <circle cx={64} cy={64} r={r} fill="none" strokeWidth={8} stroke={color}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.05s linear, stroke 0.3s" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white tabular-nums">{current}</span>
        <span className="text-xs text-slate-500 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

/* ── slides ────────────────────────────────────────────────────── */
const SLIDES = [
  "problem",
  "solution",
  "extraction",
  "scoring",
  "platform",
  "economics",
  "cta",
] as const;
type Slide = typeof SLIDES[number];

const SLIDE_DURATION = 8500; // ms per slide in auto-play

/* ══════════════════════════════════════════════════════════════════
   Main Demo component
═══════════════════════════════════════════════════════════════════ */
export default function DemoPage() {
  const [slide, setSlide] = useState<Slide>("problem");
  const [autoPlay, setAutoPlay] = useState(true);
  const [entered, setEntered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idx = SLIDES.indexOf(slide);

  const go = useCallback((dir: 1 | -1) => {
    const next = SLIDES[Math.min(Math.max(idx + dir, 0), SLIDES.length - 1)];
    setSlide(next);
  }, [idx]);

  // auto-advance
  useEffect(() => {
    if (!autoPlay || !entered) return;
    timerRef.current = setTimeout(() => {
      if (idx < SLIDES.length - 1) go(1);
      else setAutoPlay(false);
    }, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slide, autoPlay, entered, go, idx]);

  // keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") window.close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  if (!entered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="text-center max-w-lg px-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--brand)" }}>
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Velox AI</h1>
          <p className="text-slate-400 mb-2">Interactive investor demo</p>
          <p className="text-sm text-slate-600 mb-10">7 slides · ~60 seconds · keyboard navigable</p>
          <button
            onClick={() => setEntered(true)}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "var(--brand)" }}
          >
            <Play size={16} /> Start demo
          </button>
          <div className="mt-6">
            <Link href="/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Top bar */}
      <header className="h-12 flex items-center justify-between px-6 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={11} className="text-white" fill="white" />
          </div>
          <span className="text-sm font-semibold text-white">Velox AI</span>
          <span className="text-xs text-slate-600 ml-1">· Investor Demo</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button key={s} onClick={() => setSlide(s)}
              className="rounded-full transition-all"
              style={{
                width: slide === s ? 20 : 6,
                height: 6,
                background: i <= idx ? "var(--brand)" : "rgba(255,255,255,0.1)",
              }} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPlay(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {autoPlay ? <Pause size={11} /> : <Play size={11} />}
            {autoPlay ? "Pause" : "Auto-play"}
          </button>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <X size={11} /> Exit
          </Link>
        </div>
      </header>

      {/* Slide area */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {slide === "problem"  && <SlideProblem />}
        {slide === "solution" && <SlideSolution />}
        {slide === "extraction" && <SlideExtraction />}
        {slide === "scoring"  && <SlideScoring />}
        {slide === "platform" && <SlidePlatform />}
        {slide === "economics" && <SlideEconomics />}
        {slide === "cta"      && <SlideCTA />}
      </main>

      {/* Bottom nav */}
      <footer className="h-14 flex items-center justify-between px-8 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <button onClick={() => go(-1)} disabled={idx === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 disabled:opacity-20 transition-all"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <ChevronLeft size={15} /> Previous
        </button>
        <span className="text-xs text-slate-700">{idx + 1} / {SLIDES.length}</span>
        <button onClick={() => go(1)} disabled={idx === SLIDES.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-20 transition-all"
          style={{ background: "var(--brand)" }}>
          Next <ChevronRight size={15} />
        </button>
      </footer>
    </div>
  );
}

/* ── Slide 1: Problem ──────────────────────────────────────────── */
function SlideProblem() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  const pains = [
    { icon: Clock, label: "3–5 day average turnaround", sub: "Brokers expect an answer within hours" },
    { icon: FileText, label: "Manual PDF triage", sub: "Underwriters spend 60% of time on data entry" },
    { icon: AlertCircle, label: "Inconsistent decisions", sub: "No audit trail, no reproducibility" },
    { icon: Users, label: "Talent bottleneck", sub: "Senior underwriters as a scaling constraint" },
  ];

  return (
    <div className={`max-w-4xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          The Problem
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
          Insurance underwriting is stuck<br />
          <span style={{ color: "#f87171" }}>in the 1980s</span>
        </h2>
        <p className="text-slate-400 text-lg">Lloyd's alone processes £46B in premiums annually — almost entirely manually.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {pains.map(({ icon: Icon, label, sub }, i) => (
          <div key={label}
            className="rounded-2xl p-5 flex gap-4 transition-all duration-500"
            style={{
              background: "var(--bg-card)",
              border: "1px solid rgba(239,68,68,0.15)",
              transitionDelay: `${i * 100}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.1)" }}>
              <Icon size={18} style={{ color: "#f87171" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          The average Lloyd's MGA turns away <span className="text-white font-semibold">23% of viable business</span> due to processing capacity constraints.
        </p>
      </div>
    </div>
  );
}

/* ── Slide 2: Solution ─────────────────────────────────────────── */
function SlideSolution() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  const features = [
    { icon: Brain, label: "AI Extraction", desc: "Claude reads every submission in seconds", color: "#818cf8" },
    { icon: Shield, label: "Risk Scoring", desc: "Consistent 0–100 score with full reasoning", color: "#34d399" },
    { icon: BarChart2, label: "Analytics", desc: "Portfolio-level exposure and performance", color: "#f59e0b" },
    { icon: Globe, label: "Broker Portal", desc: "Self-serve submission with real-time status", color: "#60a5fa" },
  ];

  return (
    <div className={`max-w-4xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#818cf8" }}>
          <Sparkles size={11} /> The Solution
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
          AI-native underwriting.<br />
          <span style={{ color: "var(--brand)" }}>8 minutes, not 8 days.</span>
        </h2>
        <p className="text-slate-400 text-lg">Velox AI automates the full intake-to-decision workflow for MGAs.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {features.map(({ icon: Icon, label, desc, color }, i) => (
          <div key={label} className="rounded-2xl p-5 text-center transition-all duration-500"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              transitionDelay: `${i * 80}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-sm font-semibold text-white mb-1">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Before/After */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Before Velox</p>
          <div className="space-y-2">
            {["Email PDF to underwriter", "Manual data extraction (2–4h)", "Spreadsheet risk scoring", "3–5 day response to broker"].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-slate-500">
                <X size={13} className="text-red-500 flex-shrink-0" /> {s}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">With Velox</p>
          <div className="space-y-2">
            {["Broker uploads to self-serve portal", "AI extracts all fields in 45 seconds", "Consistent risk score + full reasoning", "Decision in under 8 minutes"].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" /> {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 3: AI Extraction ────────────────────────────────────── */
function SlideExtraction() {
  const [step, setStep] = useState(0);
  const fields = [
    { label: "Insured name",    value: "Harwick Shipping Ltd",      delay: 400 },
    { label: "Coverage type",   value: "Marine Cargo",               delay: 900 },
    { label: "Coverage limit",  value: "£5,000,000",                 delay: 1400 },
    { label: "Effective date",  value: "01 Jun 2026",                delay: 1900 },
    { label: "Jurisdiction",    value: "England & Wales",            delay: 2400 },
    { label: "Employees",       value: "340",                        delay: 2900 },
    { label: "Revenue",         value: "£28,000,000",                delay: 3400 },
    { label: "Loss history",    value: "No claims in 5 years ✓",     delay: 3900 },
    { label: "Confidence",      value: "94%",                        delay: 4400 },
  ];

  useEffect(() => {
    fields.forEach((f, i) => {
      const t = setTimeout(() => setStep(s => Math.max(s, i + 1)), f.delay);
      return () => clearTimeout(t);
    });
  }, []);

  return (
    <div className="max-w-5xl w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", color: "#818cf8" }}>
          <Brain size={11} /> AI Extraction Engine
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">From PDF to structured data in 45 seconds</h2>
        <p className="text-slate-400">Powered by Claude claude-sonnet-4-6 with domain-tuned insurance prompting</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Document preview */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} style={{ color: "var(--brand)" }} />
            <span className="text-sm font-medium text-slate-300">harwick-shipping-submission.pdf</span>
            {step > 0 && <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Reading…</span>}
          </div>
          <div className="space-y-2 font-mono text-[11px] text-slate-600 leading-relaxed">
            {[
              "MARINE CARGO SUBMISSION",
              "Harwick Shipping Ltd",
              "Annual Marine Cargo Policy",
              "Coverage: £5,000,000",
              "Effective: 01 June 2026",
              "",
              "Insured Background:",
              "340 employees, revenue £28M",
              "Shipping & Logistics sector",
              "",
              "Loss History: Clean 5-year",
              "Suez Canal route exposure",
              "ISO 9001 certified",
            ].map((line, i) => (
              <div key={i} className={`transition-colors duration-300 ${step > 0 && i < step * 1.5 ? "text-slate-400" : ""}`}>
                {line || " "}
              </div>
            ))}
          </div>
          {/* scanning line */}
          {step > 0 && step < fields.length && (
            <div className="absolute left-0 right-0 h-px" style={{
              background: "linear-gradient(90deg, transparent, var(--brand), transparent)",
              top: `${20 + (step / fields.length) * 70}%`,
              transition: "top 0.5s ease",
            }} />
          )}
        </div>

        {/* Extracted fields */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} style={{ color: "#818cf8" }} />
            <span className="text-sm font-medium text-slate-300">Extracted fields</span>
            {step >= fields.length && (
              <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle size={11} /> Complete
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {fields.map((f, i) => (
              <div key={f.label} className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-all duration-300 ${
                i < step ? "opacity-100" : "opacity-0"
              }`} style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-xs text-slate-500">{f.label}</span>
                <span className="text-xs font-medium text-slate-200">{i < step ? f.value : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 4: Risk Scoring ─────────────────────────────────────── */
function SlideScoring() {
  const [active, setActive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setActive(true), 300); return () => clearTimeout(t); }, []);

  const factors = [
    { label: "Loss history",        impact: +22, pct: 73, color: "#10b981" },
    { label: "Management quality",  impact: +12, pct: 40, color: "#34d399" },
    { label: "Industry profile",    impact: +14, pct: 47, color: "#34d399" },
    { label: "Route concentration", impact: -9,  pct: 30, color: "#f87171" },
    { label: "Cargo perishability", impact: -6,  pct: 20, color: "#fb923c" },
  ];

  return (
    <div className="max-w-4xl w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
          <Shield size={11} /> Intelligent Risk Scoring
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Consistent, explainable decisions every time</h2>
        <p className="text-slate-400">Every score includes full factor breakdown and audit trail</p>
      </div>

      <div className="grid grid-cols-2 gap-8 items-center">
        {/* Score */}
        <div className="flex flex-col items-center">
          <ScoreRing score={82} animate={active} />
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle size={14} /> ACCEPT — within appetite
            </div>
            <p className="text-xs text-slate-600 mt-2">Processed in 7m 42s · Confidence: 94%</p>
          </div>
        </div>

        {/* Factors */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Score factors</p>
          {factors.map((f, i) => (
            <div key={f.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{f.label}</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: f.color }}>
                  {f.impact > 0 ? "+" : ""}{f.impact}
                </span>
              </div>
              <AnimBar pct={active ? f.pct : 0} color={f.color} delay={i * 150 + 400} />
            </div>
          ))}
        </div>
      </div>

      {/* Premium model */}
      <div className="mt-8 rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Premium Model</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>£38,000</span><span>£43,500</span><span>£51,000</span>
            </div>
            <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="absolute h-full rounded-full" style={{ left: "20%", right: "30%", background: "linear-gradient(90deg, #4f6ef7, #818cf8)" }} />
              <div className="absolute w-3 h-3 rounded-full border-2 border-white top-1/2 -translate-y-1/2" style={{ left: "calc(40% - 6px)", background: "var(--brand)" }} />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">Annual flat rate on declared value</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">£43,500</p>
            <p className="text-xs text-slate-500">Recommended mid</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 5: Platform ─────────────────────────────────────────── */
function SlidePlatform() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);

  const cols = [
    { title: "Processing", count: 2, color: "#f59e0b", subs: ["VLX-0039 · Marine Cargo", "VLX-0037 · Cyber Liability"] },
    { title: "Referred",   count: 3, color: "#818cf8", subs: ["VLX-0040 · Cyber · Score 61", "VLX-0036 · D&O · Score 54"] },
    { title: "Accepted",   count: 8, color: "#10b981", subs: ["VLX-0041 · Marine · £43.5K", "VLX-0035 · Property · £28K"] },
    { title: "Declined",   count: 4, color: "#ef4444", subs: ["VLX-0038 · Marine · Score 29", "VLX-0034 · Crime · Score 22"] },
  ];

  return (
    <div className={`max-w-5xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#818cf8" }}>
          Platform Overview
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Full underwriting pipeline in one view</h2>
        <p className="text-slate-400">Kanban pipeline · Analytics · Broker portal · Team management</p>
      </div>

      {/* Kanban preview */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {cols.map((col, i) => (
          <div key={col.title} className="rounded-xl p-3" style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            transitionDelay: `${i * 80}ms`,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.5s ease",
          }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: col.color }}>{col.title}</span>
              <span className="text-xs text-slate-600">{col.count}</span>
            </div>
            <div className="space-y-2">
              {col.subs.map(s => (
                <div key={s} className="rounded-lg px-2.5 py-2 text-[10px] text-slate-500"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  {s}
                </div>
              ))}
              <div className="rounded-lg px-2.5 py-1.5 text-[10px] text-slate-700"
                style={{ background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.04)" }}>
                +{col.count - 2} more
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Brain, label: "AI Engine", sub: "Claude claude-sonnet-4-6 · temperature 0", color: "#818cf8" },
          { icon: BarChart2, label: "Analytics Suite", sub: "GWP, bind rate, loss ratio, broker matrix", color: "#f59e0b" },
          { icon: Globe, label: "Broker Portal", sub: "Self-serve intake, real-time status tracking", color: "#60a5fa" },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="rounded-xl p-4 flex gap-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Slide 6: Economics ────────────────────────────────────────── */
function SlideEconomics() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className={`max-w-4xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
          <TrendingUp size={11} /> Business Case
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Targeting a massive, underserved market</h2>
        <p className="text-slate-400">Insurance technology — the last sector yet to be fully digitised</p>
      </div>

      {/* Market */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "TAM", value: "$800B", sub: "Global commercial insurance premiums", color: "#818cf8" },
          { label: "SAM", value: "$46B",  sub: "Lloyd's of London annual GWP", color: "#60a5fa" },
          { label: "SOM", value: "$2.3B", sub: "MGA/coverholder software market", color: "#34d399" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-2xl p-5 text-center" style={{ background: "var(--bg-card)", border: `1px solid ${color}22` }}>
            <p className="text-xs font-semibold mb-2" style={{ color }}>{label}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-slate-600">{sub}</p>
          </div>
        ))}
      </div>

      {/* Unit economics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Unit economics (per MGA)</p>
          <div className="space-y-3">
            {[
              { label: "ACV",  value: "£42,000", desc: "Annual contract value · Growth tier" },
              { label: "LTV",  value: "£168,000", desc: "4-year average contract length" },
              { label: "CAC",  value: "£8,400",   desc: "6-month payback period" },
              { label: "LTV:CAC", value: "20×",   desc: "Best-in-class SaaS ratio", highlight: true },
            ].map(({ label, value, desc, highlight }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400">{label}</span>
                  <p className="text-[10px] text-slate-600">{desc}</p>
                </div>
                <span className={`text-sm font-bold ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Growth trajectory</p>
          <div className="space-y-3">
            {[
              { year: "Year 1", arr: "£420K",  customers: "10 MGAs", bar: 8 },
              { year: "Year 2", arr: "£2.1M",  customers: "50 MGAs", bar: 30 },
              { year: "Year 3", arr: "£8.4M",  customers: "200 MGAs", bar: 65 },
              { year: "Year 4", arr: "£25M",   customers: "600 MGAs", bar: 100 },
            ].map(({ year, arr, customers, bar }, i) => (
              <div key={year}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{year}</span>
                  <span className="text-xs font-semibold text-white">{arr}</span>
                  <span className="text-[10px] text-slate-600">{customers}</span>
                </div>
                <AnimBar pct={visible ? bar : 0} color="var(--brand)" delay={i * 150 + 300} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 7: CTA ──────────────────────────────────────────────── */
function SlideCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className={`max-w-2xl w-full text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
        style={{ background: "var(--brand)", boxShadow: "0 0 80px rgba(79,110,247,0.4)" }}>
        <Zap size={36} className="text-white" fill="white" />
      </div>
      <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
        Ready to transform<br />your MGA?
      </h2>
      <p className="text-slate-400 text-lg mb-2">
        Velox AI is production-ready and processing real submissions.
      </p>
      <p className="text-slate-600 text-sm mb-10">
        We&apos;re raising a £1.5M pre-seed round to accelerate GTM and hire senior engineers.
      </p>

      <div className="flex items-center justify-center gap-4 mb-10">
        <Link href="/portal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "var(--brand)" }}>
          Try the platform <ArrowRight size={15} />
        </Link>
        <a href="mailto:max@velox-ai.io"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 transition-all hover:text-white"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <DollarSign size={15} /> Investor enquiries
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: "8 min", label: "Avg processing time" },
          { value: "94%", label: "AI confidence score" },
          { value: "£0", label: "Setup fee" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-700 mt-6">
        uzarek.maksymilian@gmail.com · velox-ai.io · Lloyd&apos;s MGA compliant
      </p>
    </div>
  );
}
