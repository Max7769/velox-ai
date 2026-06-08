"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle, Circle, ChevronRight, X, Database, Key, Upload, Zap } from "lucide-react";
import { dbMode } from "@/lib/db";

type Step = {
  id: string;
  icon: typeof Database;
  title: string;
  desc: string;
  href: string;
  linkLabel: string;
  done: boolean;
};

function useOnboardingSteps(submissionCount: number): Step[] {
  const isSupabase = dbMode() === "supabase";
  const hasAnthropicKey = Boolean(process.env.NEXT_PUBLIC_HAS_ANTHROPIC_KEY);

  return [
    {
      id: "supabase",
      icon: Database,
      title: "Connect Supabase",
      desc: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to persist submissions.",
      href: "https://supabase.com/dashboard",
      linkLabel: "Open Supabase →",
      done: isSupabase,
    },
    {
      id: "anthropic",
      icon: Key,
      title: "Add Anthropic API key",
      desc: "Set ANTHROPIC_API_KEY in .env.local to enable AI-powered document extraction.",
      href: "/dashboard/settings",
      linkLabel: "Settings →",
      done: hasAnthropicKey,
    },
    {
      id: "upload",
      icon: Upload,
      title: "Upload your first submission",
      desc: "Drag and drop a PDF or Word submission document to see the AI extraction in action.",
      href: "/dashboard/upload",
      linkLabel: "Upload →",
      done: submissionCount > 0,
    },
  ];
}

export function OnboardingWidget({ submissionCount }: { submissionCount: number }) {
  const [dismissed, setDismissed] = useState(false);
  const steps = useOnboardingSteps(submissionCount);
  const isDemo = dbMode() !== "supabase";

  if (!isDemo || dismissed || steps.every(s => s.done)) return null;

  const completedCount = steps.filter(s => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.2)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(79,110,247,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Get started with Velox AI</p>
            <p className="text-xs text-slate-500 mt-0.5">{completedCount} of {steps.length} steps complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "var(--brand)" }} />
          </div>
          <span className="text-xs text-slate-500 tabular-nums">{pct}%</span>
          <button onClick={() => setDismissed(true)} className="text-slate-600 hover:text-slate-400 transition-colors ml-1">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x" style={{ "--tw-divide-opacity": "1", borderColor: "rgba(79,110,247,0.1)" } as React.CSSProperties}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="px-5 py-4 flex flex-col gap-3"
              style={i < steps.length - 1 ? { borderRight: "1px solid rgba(79,110,247,0.1)" } : undefined}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {step.done
                    ? <CheckCircle size={16} className="text-emerald-400" />
                    : <Circle size={16} className="text-slate-600" />
                  }
                </div>
                <div>
                  <p className={`text-xs font-semibold ${step.done ? "text-emerald-400 line-through" : "text-white"}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {!step.done && (
                <Link href={step.href}
                  className="flex items-center gap-1 text-[11px] font-semibold ml-6 transition-colors"
                  style={{ color: "var(--brand)" }}>
                  {step.linkLabel} <ChevronRight size={11} />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
