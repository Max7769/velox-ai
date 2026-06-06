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

const SLIDE_DURATION = 8500;

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

  useEffect(() => {
    if (!autoPlay || !entered) return;
    timerRef.current = setTimeout(() => {
      if (idx < SLIDES.length - 1) go(1);
      else setAutoPlay(false);
    }, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slide, autoPlay, entered, go, idx]);

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
          <p className="text-slate-400 mb-2">Interaktywna prezentacja dla klientów</p>
          <p className="text-sm text-slate-600 mb-10">7 slajdów · ~60 sekund · nawigacja klawiaturą</p>
          <button
            onClick={() => setEntered(true)}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "var(--brand)" }}
          >
            <Play size={16} /> Rozpocznij demo
          </button>
          <div className="mt-6">
            <Link href="/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Wróć do panelu</Link>
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
          <span className="text-xs text-slate-600 ml-1">· Prezentacja dla klientów</span>
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
            {autoPlay ? "Pauza" : "Auto-odtwarzanie"}
          </button>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <X size={11} /> Wyjdź
          </Link>
        </div>
      </header>

      {/* Slide area */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {slide === "problem"    && <SlideProblem />}
        {slide === "solution"   && <SlideSolution />}
        {slide === "extraction" && <SlideExtraction />}
        {slide === "scoring"    && <SlideScoring />}
        {slide === "platform"   && <SlidePlatform />}
        {slide === "economics"  && <SlideEconomics />}
        {slide === "cta"        && <SlideCTA />}
      </main>

      {/* Bottom nav */}
      <footer className="h-14 flex items-center justify-between px-8 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <button onClick={() => go(-1)} disabled={idx === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 disabled:opacity-20 transition-all"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <ChevronLeft size={15} /> Poprzedni
        </button>
        <span className="text-xs text-slate-700">{idx + 1} / {SLIDES.length}</span>
        <button onClick={() => go(1)} disabled={idx === SLIDES.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-20 transition-all"
          style={{ background: "var(--brand)" }}>
          Następny <ChevronRight size={15} />
        </button>
      </footer>
    </div>
  );
}

/* ── Slajd 1: Problem ──────────────────────────────────────────── */
function SlideProblem() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  const pains = [
    { icon: Clock,        label: "3–5 dni średniego czasu realizacji",       sub: "Brokerzy oczekują odpowiedzi w ciągu kilku godzin" },
    { icon: FileText,     label: "Ręczna selekcja dokumentów PDF",           sub: "Underwriterzy poświęcają 60% czasu na wprowadzanie danych" },
    { icon: AlertCircle,  label: "Niespójne decyzje",                        sub: "Brak ścieżki audytu i powtarzalności" },
    { icon: Users,        label: "Wąskie gardło ludzkich zasobów",           sub: "Doświadczeni underwriterzy jako ogranicznik wzrostu" },
  ];

  return (
    <div className={`max-w-4xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          Problem
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
          Gwarantowanie ubezpieczeń utknęło<br />
          <span style={{ color: "#f87171" }}>w latach 80.</span>
        </h2>
        <p className="text-slate-400 text-lg">Lloyd's sam przetwarza £46 mld składek rocznie — niemal wyłącznie ręcznie.</p>
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
          Przeciętna MGA Lloyd&apos;s odrzuca <span className="text-white font-semibold">23% opłacalnych zgłoszeń</span> z powodu ograniczonej zdolności przetwarzania.
        </p>
      </div>
    </div>
  );
}

/* ── Slajd 2: Rozwiązanie ──────────────────────────────────────── */
function SlideSolution() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  const features = [
    { icon: Brain,    label: "Ekstrakcja AI",      desc: "Claude czyta każde zgłoszenie w sekundy",                  color: "#818cf8" },
    { icon: Shield,   label: "Ocena ryzyka",        desc: "Spójna ocena 0–100 z pełnym uzasadnieniem",              color: "#34d399" },
    { icon: BarChart2,label: "Analityka",           desc: "Ekspozycja portfela i wydajność na poziomie zbiorczym",   color: "#f59e0b" },
    { icon: Globe,    label: "Portal brokera",      desc: "Samoobsługowe składanie z aktualizacjami w czasie rzeczywistym", color: "#60a5fa" },
  ];

  return (
    <div className={`max-w-4xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#818cf8" }}>
          <Sparkles size={11} /> Rozwiązanie
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
          Gwarantowanie oparte na AI.<br />
          <span style={{ color: "var(--brand)" }}>8 minut, nie 8 dni.</span>
        </h2>
        <p className="text-slate-400 text-lg">Velox AI automatyzuje cały przepływ pracy od przyjęcia do decyzji dla MGA.</p>
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
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Bez Velox</p>
          <div className="space-y-2">
            {[
              "E-mail z PDF do underwritera",
              "Ręczna ekstrakcja danych (2–4h)",
              "Ocena ryzyka w arkuszu kalkulacyjnym",
              "Odpowiedź do brokera po 3–5 dniach",
            ].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-slate-500">
                <X size={13} className="text-red-500 flex-shrink-0" /> {s}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Z Velox</p>
          <div className="space-y-2">
            {[
              "Broker przesyła do samoobsługowego portalu",
              "AI wyciąga wszystkie pola w 45 sekund",
              "Spójna ocena ryzyka + pełne uzasadnienie",
              "Decyzja w poniżej 8 minut",
            ].map(s => (
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

/* ── Slajd 3: Ekstrakcja AI ────────────────────────────────────── */
function SlideExtraction() {
  const [step, setStep] = useState(0);
  const fields = [
    { label: "Ubezpieczony",         value: "Harwick Shipping Ltd",    delay: 400  },
    { label: "Rodzaj ubezpieczenia", value: "Marine Cargo",            delay: 900  },
    { label: "Limit ubezpieczenia",  value: "£5 000 000",              delay: 1400 },
    { label: "Data wejścia w życie", value: "01 cze 2026",             delay: 1900 },
    { label: "Jurysdykcja",          value: "Anglia i Walia",          delay: 2400 },
    { label: "Pracownicy",           value: "340",                     delay: 2900 },
    { label: "Przychód",             value: "£28 000 000",             delay: 3400 },
    { label: "Historia szkód",       value: "Brak szkód przez 5 lat ✓", delay: 3900 },
    { label: "Pewność AI",           value: "94%",                     delay: 4400 },
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
          <Brain size={11} /> Silnik ekstrakcji AI
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Od PDF do danych strukturalnych w 45 sekund</h2>
        <p className="text-slate-400">Zasilany modelem Claude claude-sonnet-4-6 z dopasowanymi do ubezpieczeń promptami</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Document preview */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} style={{ color: "var(--brand)" }} />
            <span className="text-sm font-medium text-slate-300">harwick-shipping-submission.pdf</span>
            {step > 0 && <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Czytanie…</span>}
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
                {line || " "}
              </div>
            ))}
          </div>
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
            <span className="text-sm font-medium text-slate-300">Wyciągnięte pola</span>
            {step >= fields.length && (
              <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle size={11} /> Ukończono
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

/* ── Slajd 4: Ocena ryzyka ─────────────────────────────────────── */
function SlideScoring() {
  const [active, setActive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setActive(true), 300); return () => clearTimeout(t); }, []);

  const factors = [
    { label: "Historia szkód",          impact: +22, pct: 73, color: "#10b981" },
    { label: "Jakość zarządzania",      impact: +12, pct: 40, color: "#34d399" },
    { label: "Profil branżowy",         impact: +14, pct: 47, color: "#34d399" },
    { label: "Koncentracja tras",       impact: -9,  pct: 30, color: "#f87171" },
    { label: "Nietrwałość ładunku",     impact: -6,  pct: 20, color: "#fb923c" },
  ];

  return (
    <div className="max-w-4xl w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
          <Shield size={11} /> Inteligentna ocena ryzyka
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Spójne, wyjaśnialne decyzje za każdym razem</h2>
        <p className="text-slate-400">Każda ocena zawiera pełny rozkład czynników i ścieżkę audytu</p>
      </div>

      <div className="grid grid-cols-2 gap-8 items-center">
        {/* Score */}
        <div className="flex flex-col items-center">
          <ScoreRing score={82} animate={active} />
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle size={14} /> AKCEPTACJA — w zakresie apetytu
            </div>
            <p className="text-xs text-slate-600 mt-2">Przetworzono w 7 min 42 sek · Pewność: 94%</p>
          </div>
        </div>

        {/* Factors */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Czynniki oceny</p>
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
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Model składki AI</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>£38 000</span><span>£43 500</span><span>£51 000</span>
            </div>
            <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="absolute h-full rounded-full" style={{ left: "20%", right: "30%", background: "linear-gradient(90deg, #4f6ef7, #818cf8)" }} />
              <div className="absolute w-3 h-3 rounded-full border-2 border-white top-1/2 -translate-y-1/2" style={{ left: "calc(40% - 6px)", background: "var(--brand)" }} />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">Roczna stawka ryczałtowa od zadeklarowanej wartości</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">£43 500</p>
            <p className="text-xs text-slate-500">Rekomendowana składka</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slajd 5: Platforma ────────────────────────────────────────── */
function SlidePlatform() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);

  const cols = [
    { title: "Przetwarzane", count: 2, color: "#f59e0b", subs: ["VLX-0039 · Marine Cargo", "VLX-0037 · Cyber Liability"] },
    { title: "Do weryfikacji", count: 3, color: "#818cf8", subs: ["VLX-0040 · Cyber · Ocena 61", "VLX-0036 · D&O · Ocena 54"] },
    { title: "Zaakceptowane", count: 8, color: "#10b981", subs: ["VLX-0041 · Marine · £43,5K", "VLX-0035 · Property · £28K"] },
    { title: "Odrzucone",     count: 4, color: "#ef4444", subs: ["VLX-0038 · Marine · Ocena 29", "VLX-0034 · Crime · Ocena 22"] },
  ];

  return (
    <div className={`max-w-5xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#818cf8" }}>
          Przegląd platformy
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Pełny pipeline underwritingu w jednym widoku</h2>
        <p className="text-slate-400">Pipeline Kanban · Analityka · Portal brokera · Zarządzanie zespołem</p>
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
                +{col.count - 2} więcej
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Brain,    label: "Silnik AI",        sub: "Claude claude-sonnet-4-6 · temperature 0",               color: "#818cf8" },
          { icon: BarChart2,label: "Pakiet analityczny",sub: "Składka, wskaźnik akceptacji, szkodowość, macierz brokerów", color: "#f59e0b" },
          { icon: Globe,    label: "Portal brokera",   sub: "Samoobsługowe przyjęcie, śledzenie statusu w czasie rzeczywistym", color: "#60a5fa" },
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

/* ── Slajd 6: Ekonomika i rynek ────────────────────────────────── */
function SlideEconomics() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className={`max-w-4xl w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
          <TrendingUp size={11} /> Uzasadnienie biznesowe
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Ogromny, niedostatecznie obsługiwany rynek</h2>
        <p className="text-slate-400">Technologia ubezpieczeniowa — ostatni sektor, który nie został w pełni zdigitalizowany</p>
      </div>

      {/* Market */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "TAM", value: "$800 mld", sub: "Globalny rynek ubezpieczeń komercyjnych",          color: "#818cf8" },
          { label: "SAM", value: "$46 mld",  sub: "Roczna składka Lloyd's of London",                 color: "#60a5fa" },
          { label: "SOM", value: "$2,3 mld", sub: "Rynek oprogramowania MGA/coverholder",             color: "#34d399" },
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Ekonomia jednostkowa (na MGA)</p>
          <div className="space-y-3">
            {[
              { label: "ACV",     value: "£42 000",  desc: "Roczna wartość kontraktu · plan Growth" },
              { label: "LTV",     value: "£168 000", desc: "Średni czas trwania kontraktu 4 lata" },
              { label: "CAC",     value: "£8 400",   desc: "Okres zwrotu kosztu pozyskania 6 miesięcy" },
              { label: "LTV:CAC", value: "20×",      desc: "Wskaźnik SaaS najwyższej klasy", highlight: true },
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Trajektoria wzrostu</p>
          <div className="space-y-3">
            {[
              { year: "Rok 1", arr: "£420K",  customers: "10 MGA",  bar: 8   },
              { year: "Rok 2", arr: "£2,1M",  customers: "50 MGA",  bar: 30  },
              { year: "Rok 3", arr: "£8,4M",  customers: "200 MGA", bar: 65  },
              { year: "Rok 4", arr: "£25M",   customers: "600 MGA", bar: 100 },
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

/* ── Slajd 7: Oszczędności i cennik ────────────────────────────── */
function SlideCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className={`max-w-3xl w-full text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
        style={{ background: "var(--brand)", boxShadow: "0 0 80px rgba(79,110,247,0.4)" }}>
        <Zap size={36} className="text-white" fill="white" />
      </div>
      <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
        Ile możesz zaoszczędzić<br />z Velox AI?
      </h2>
      <p className="text-slate-400 text-lg mb-2">
        Porównaj koszty ręcznego przetwarzania z naszą platformą.
      </p>

      {/* Savings comparison */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-left">
        <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">Bez Velox (ręcznie)</p>
          <div className="space-y-3">
            {[
              { label: "Underwriter (£80K/rok)",   value: "£80 000/rok" },
              { label: "Asystent UW (£40K/rok)",   value: "£40 000/rok" },
              { label: "Błędy i reworki (~15%)",    value: "£18 000/rok" },
              { label: "Utracone zgłoszenia (23%)", value: "~£92 000/rok" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="text-red-400 font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-red-300">Łączny koszt</span>
              <span className="text-red-300">~£230 000/rok</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">Z Velox (Growth)</p>
          <div className="space-y-3">
            {[
              { label: "Subskrypcja Velox",          value: "£42 000/rok" },
              { label: "1 underwriter (weryfikacja)", value: "£80 000/rok" },
              { label: "Błędy → praktycznie zero",   value: "£0" },
              { label: "Utracone zgłoszenia",         value: "£0" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="text-emerald-400 font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="text-emerald-300">Łączny koszt</span>
              <span className="text-emerald-300">~£122 000/rok</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 mb-8" style={{ background: "rgba(79,110,247,0.08)", border: "1px solid rgba(79,110,247,0.2)" }}>
        <p className="text-2xl font-bold text-white mb-1">
          Oszczędzasz <span style={{ color: "var(--brand)" }}>~£108 000 rocznie</span> — przy 3× większej przepustowości
        </p>
        <p className="text-sm text-slate-400">ROI z Velox zwraca się już po 3 miesiącach. Wzrost mocy przerobowej bez dodatkowych etatów.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <Link href="/portal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "var(--brand)" }}>
          Wypróbuj platformę <ArrowRight size={15} />
        </Link>
        <a href="mailto:uzarek.maksymilian@gmail.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 transition-all hover:text-white"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <DollarSign size={15} /> Kontakt handlowy
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: "8 min",  label: "Śr. czas przetwarzania" },
          { value: "94%",    label: "Pewność AI" },
          { value: "£0",     label: "Opłata za wdrożenie" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-700 mt-6">
        uzarek.maksymilian@gmail.com · velox-ai.io · Zgodność z Lloyd&apos;s MGA
      </p>
    </div>
  );
}
