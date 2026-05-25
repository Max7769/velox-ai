"use client";
import { useState, useEffect } from "react";
import { CheckCircle, Circle, X, Zap, ArrowRight, Upload, Settings, ExternalLink } from "lucide-react";
import Link from "next/link";

type Step = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  cta: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    label: "Set up your company profile",
    description: "Add your MGA name, Lloyd's syndicate number, and underwriting authority.",
    icon: Settings,
    href: "/dashboard/settings",
    cta: "Go to Settings",
  },
  {
    id: "appetite",
    label: "Configure appetite rules",
    description: "Define which risks to accept, decline, or refer — automated instantly.",
    icon: Zap,
    href: "/dashboard/settings",
    cta: "Open Appetite tab",
  },
  {
    id: "submission",
    label: "Process your first submission",
    description: "Upload a SLIP, proposal form, or MRC document and watch AI extract it in seconds.",
    icon: Upload,
    href: "/dashboard/upload",
    cta: "New Submission",
  },
  {
    id: "portal",
    label: "Share the broker portal",
    description: "Send brokers your submission intake URL — no login required on their end.",
    icon: ExternalLink,
    href: "/portal",
    cta: "Open Portal",
  },
];

const STORAGE_KEY = "velox_onboarding_v1";

type StoredState = { dismissed: boolean; completed: string[] };

export function Onboarding() {
  const [state, setState] = useState<StoredState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setState(raw ? JSON.parse(raw) : { dismissed: false, completed: [] });
    } catch {
      setState({ dismissed: false, completed: [] });
    }
  }, []);

  const persist = (next: StoredState) => {
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const complete = (id: string) => {
    const next = state!.completed.includes(id) ? state!.completed : [...state!.completed, id];
    persist({ ...state!, completed: next });
  };

  const dismiss = () => persist({ ...state!, dismissed: true });

  if (!state || state.dismissed) return null;
  if (state.completed.length === STEPS.length) return null;

  const remaining = STEPS.filter(s => !state.completed.includes(s.id));
  const progress  = Math.round((state.completed.length / STEPS.length) * 100);

  return (
    <div
      className="fixed bottom-6 right-6 w-80 rounded-2xl shadow-2xl z-30 overflow-hidden"
      style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <Zap size={11} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-semibold text-white">Getting started</span>
          </div>
          <button onClick={dismiss} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--brand)" }}
          />
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5">{state.completed.length} of {STEPS.length} complete</p>
      </div>

      {/* Steps */}
      <div className="py-2 max-h-72 overflow-y-auto">
        {STEPS.map(step => {
          const done = state.completed.includes(step.id);
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="flex items-start gap-3 px-4 py-3 group"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: done ? 0.5 : 1 }}
            >
              <button onClick={() => complete(step.id)} className="mt-0.5 flex-shrink-0 transition-colors">
                {done
                  ? <CheckCircle size={16} className="text-emerald-400" />
                  : <Circle size={16} className="text-slate-700 group-hover:text-slate-500" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${done ? "line-through text-slate-600" : "text-slate-300"}`}>
                  {step.label}
                </p>
                {!done && <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{step.description}</p>}
                {!done && step.href && (
                  <Link
                    href={step.href}
                    onClick={() => complete(step.id)}
                    className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {step.cta} <ArrowRight size={10} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
