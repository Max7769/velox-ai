"use client";
import { useParams, useRouter } from "next/navigation";
import { mockSubmissions, mockAudit, mockSubmissions as subs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import {
  CheckCircle, XCircle, MessageSquare, Download, AlertTriangle,
  Shield, Clock, User, ChevronLeft, Zap, Building2, FileText,
  TrendingUp, TrendingDown, Info, ExternalLink, Copy, BarChart3
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { ScoreFactor } from "@/lib/types";

/* ── helpers ─────────────────────────────────────────────── */
function impactColor(v: number) {
  if (v >= 12) return "#10b981";
  if (v >= 5)  return "#34d399";
  if (v >= 0)  return "#6ee7b7";
  if (v >= -8) return "#fb923c";
  return "#ef4444";
}
function impactBg(v: number) {
  if (v > 0) return "rgba(16,185,129,0.08)";
  return "rgba(239,68,68,0.08)";
}

function ScoreFactorBar({ f, max }: { f: ScoreFactor; max: number }) {
  const pct   = Math.abs(f.impact) / max * 100;
  const color = impactColor(f.impact);
  return (
    <div className="group relative" title={f.detail}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{f.label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>
          {f.impact > 0 ? "+" : ""}{f.impact}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {f.impact <= 0 && <div className="flex-1 h-1.5 rounded-full overflow-hidden flex justify-end" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>}
        <div className="w-px h-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />
        {f.impact > 0 && <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>}
      </div>
      {/* tooltip on hover */}
      <div className="absolute left-0 right-0 bottom-8 z-10 hidden group-hover:block pointer-events-none">
        <div className="rounded-lg px-3 py-2 text-xs text-slate-300 shadow-xl" style={{ background: "#1e2d45", border: "1px solid rgba(255,255,255,0.1)" }}>
          {f.detail}
        </div>
      </div>
    </div>
  );
}

function PremiumRange({ model }: { model: NonNullable<NonNullable<typeof mockSubmissions[0]["extracted_data"]>["premium_model"]> }) {
  const fmt = (n: number) => `£${n.toLocaleString("en-GB")}`;
  const range = model.high - model.low;
  const midPct = ((model.mid - model.low) / range) * 100;
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Indicative premium range</p>
          <p className="text-2xl font-bold text-white">{fmt(model.mid)}</p>
          <p className="text-xs text-slate-500 mt-0.5">mid-point estimate</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-600">Low — High</p>
          <p className="text-xs text-slate-400 font-medium">{fmt(model.low)} — {fmt(model.high)}</p>
        </div>
      </div>
      <div className="relative h-2 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-y-0 rounded-full" style={{ left: "0%", right: `${100 - ((model.high - model.low) / model.high * 100 + 10)}%`, background: "rgba(79,110,247,0.2)" }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg" style={{ left: `${midPct}%`, background: "var(--brand)" }} />
      </div>
      <p className="text-[10px] text-slate-700 leading-relaxed">{model.basis}</p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function SubmissionDetail() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const sub     = mockSubmissions.find(s => s.id === id) ?? mockSubmissions[0];
  const ex      = sub.extracted_data;
  const [note,   setNote]   = useState(sub.notes ?? "");
  const [status, setStatus] = useState(sub.status);
  const [activeTab, setTab] = useState<"overview" | "ai" | "premium">("overview");
  const [copied, setCopied] = useState(false);

  const comparables = subs
    .filter(s => s.id !== sub.id && s.extracted_data?.coverage_type === ex?.coverage_type && s.score !== null)
    .slice(0, 3);

  const brokerHistory = subs
    .filter(s => s.broker_company === sub.broker_company && s.id !== sub.id)
    .slice(0, 4);

  const brokerBindRate = (() => {
    const bh = subs.filter(s => s.broker_company === sub.broker_company && s.status !== "processing");
    const accepted = bh.filter(s => s.status === "accepted").length;
    return bh.length ? Math.round((accepted / bh.length) * 100) : 0;
  })();

  const decide = useCallback((decision: "accepted" | "declined") => {
    setStatus(decision);
    toast.success(decision === "accepted" ? "Submission accepted" : "Submission declined", {
      description: `${sub.id} · ${ex?.insured_name}`,
    });
  }, [sub.id, ex?.insured_name]);

  const copyId = () => {
    navigator.clipboard.writeText(sub.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportCDR = () => {
    toast.success("Lloyd's CDR export ready", {
      description: "ACORD 28 formatted data copied to clipboard",
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a" && (status === "referred" || status === "pending")) decide("accepted");
      if (e.key === "d" && (status === "referred" || status === "pending")) decide("declined");
      if (e.key === "Escape") router.push("/dashboard/submissions");
      if (e.key === "1") setTab("overview");
      if (e.key === "2") setTab("ai");
      if (e.key === "3") setTab("premium");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, decide, router]);

  const riskLevel = sub.score !== null
    ? sub.score >= 70 ? { label: "Low risk",    color: "#10b981", bg: "rgba(16,185,129,0.08)" }
    : sub.score >= 50 ? { label: "Medium risk", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" }
    : { label: "High risk", color: "#ef4444", bg: "rgba(239,68,68,0.08)" }
    : null;

  const maxImpact = ex?.score_factors ? Math.max(...ex.score_factors.map(f => Math.abs(f.impact))) : 30;
  const totalPositive = ex?.score_factors?.filter(f => f.impact > 0).reduce((a, f) => a + f.impact, 0) ?? 0;
  const totalNegative = ex?.score_factors?.filter(f => f.impact < 0).reduce((a, f) => a + f.impact, 0) ?? 0;

  return (
    <div className="p-6" style={{ minHeight: "100%" }}>
      {/* Back */}
      <Link href="/dashboard/submissions" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4">
        <ChevronLeft size={13} /> All submissions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <button onClick={copyId} className="flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors">
              {sub.id}
              {copied ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
            <span className="text-slate-700">·</span>
            <StatusBadge status={status} />
            {sub.file_name && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <FileText size={11} />{sub.file_name}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{ex?.insured_name ?? "Processing…"}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-400">{ex?.coverage_type}</span>
            {ex?.jurisdiction && <><span className="text-slate-700">·</span><span className="text-xs text-slate-500">{ex.jurisdiction}</span></>}
            {ex?.industry && <><span className="text-slate-700">·</span><span className="text-xs text-slate-500">{ex.industry}</span></>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCDR}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ExternalLink size={11} /> Lloyd&apos;s CDR
          </button>
          <button onClick={() => toast.info("PDF export coming soon")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Download size={11} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {([["overview", "Overview", "1"], ["ai", "AI Analysis", "2"], ["premium", "Premium Modeler", "3"]] as const).map(([t, label, key]) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={activeTab === t ? { background: "var(--brand)", color: "#fff" } : { color: "#64748b" }}>
            {label}
            <span className="ml-2 text-[9px] opacity-50">{key}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* ── Main content (2/3) ── */}
        <div className="col-span-2 space-y-4">

          {activeTab === "overview" && (
            <>
              {/* Score + key fields */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Shield size={12} className="text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">Risk score</span>
                  </div>
                  {sub.score !== null ? (
                    <>
                      <div className="flex items-end gap-1.5 mb-2">
                        <span className="text-4xl font-bold text-white">{sub.score}</span>
                        <span className="text-slate-600 text-sm pb-1">/100</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className={`h-full rounded-full ${sub.score >= 70 ? "bg-emerald-500" : sub.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${sub.score}%` }} />
                      </div>
                      {riskLevel && <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold" style={{ background: riskLevel.bg, color: riskLevel.color }}>{riskLevel.label}</span>}
                      <p className="text-[10px] text-slate-700 mt-2">AI confidence: {ex ? Math.round(ex.confidence_score * 100) : 0}%</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 py-4">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-sm text-slate-500">Processing…</span>
                    </div>
                  )}
                </div>

                <div className="col-span-2 card p-4 grid grid-cols-3 gap-3">
                  {ex ? [
                    { label: "Coverage limit",  value: ex.coverage_limit },
                    { label: "Est. premium",    value: ex.premium_estimate },
                    { label: "Effective date",  value: ex.effective_date },
                    { label: "Employees",       value: ex.employees },
                    { label: "Revenue",         value: ex.revenue },
                    { label: "Broker",          value: sub.broker_name },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{f.label}</p>
                      <p className="text-sm text-slate-200 font-semibold">{f.value ?? "—"}</p>
                    </div>
                  )) : (
                    <div className="col-span-3 flex items-center gap-2 text-slate-600 text-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />Extracting data…
                    </div>
                  )}
                </div>
              </div>

              {/* Risk factors */}
              {ex && (
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={13} className="text-amber-500" />
                    <span className="text-sm font-semibold text-white">Risk factors identified</span>
                    <span className="ml-auto text-xs text-slate-600">{ex.risk_factors.length} flagged</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ex.risk_factors.map((rf) => (
                      <div key={rf} className="flex items-start gap-2.5 p-3 rounded-lg text-xs text-slate-400"
                        style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                        {rf}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loss history */}
              {ex && (
                <div className="card p-4">
                  <p className="text-sm font-semibold text-white mb-2">Loss history</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{ex.loss_history}</p>
                </div>
              )}

              {/* Notes */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={13} className="text-slate-500" />
                  <span className="text-sm font-semibold text-white">Underwriter notes</span>
                </div>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="Add notes for this submission…"
                  className="input-dark w-full resize-none text-sm" />
                <button onClick={() => toast.success("Note saved")} className="mt-2 text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  Save note
                </button>
              </div>

              {/* Audit trail */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={13} className="text-slate-500" />
                  <span className="text-sm font-semibold text-white">Audit trail</span>
                </div>
                <div className="space-y-3">
                  {mockAudit.map((entry, i) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>
                          <User size={10} className="text-slate-500" />
                        </div>
                        {i !== mockAudit.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "var(--border)" }} />}
                      </div>
                      <div className="pb-3 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-slate-300">{entry.actor}</span>
                          <span className="text-xs text-slate-700">·</span>
                          <span className="text-xs text-slate-600">{formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}</span>
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize"
                            style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>
                            {entry.action}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{entry.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "ai" && ex?.score_factors && (
            <>
              {/* Score explanation */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={13} style={{ color: "var(--brand)" }} />
                  <span className="text-sm font-semibold text-white">AI score breakdown</span>
                  <span className="ml-auto text-xs text-slate-600">Hover factors for detail</span>
                </div>
                <p className="text-xs text-slate-600 mb-5">Each factor&apos;s contribution to the final risk score of <strong className="text-white">{sub.score}</strong>/100</p>

                <div className="flex items-center gap-3 mb-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><TrendingDown size={11} className="text-red-400" /> Negative impact (left)</span>
                  <div className="w-px h-4" style={{ background: "var(--border)" }} />
                  <span className="flex items-center gap-1"><TrendingUp size={11} className="text-emerald-400" /> Positive impact (right)</span>
                </div>

                <div className="space-y-3">
                  {ex.score_factors.map(f => (
                    <ScoreFactorBar key={f.label} f={f} max={maxImpact} />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded text-xs font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                      +{totalPositive} positive
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                      {totalNegative} negative
                    </div>
                  </div>
                  <span className="text-xs text-slate-600">Model: claude-sonnet-4-6 · {Math.round(ex.confidence_score * 100)}% confidence</span>
                </div>
              </div>

              {/* Comparable risks */}
              {comparables.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={13} className="text-slate-500" />
                    <span className="text-sm font-semibold text-white">Comparable risks in portfolio</span>
                    <span className="text-xs text-slate-600 ml-auto">{ex.coverage_type}</span>
                  </div>
                  <div className="space-y-2">
                    {comparables.map(c => (
                      <Link key={c.id} href={`/dashboard/submissions/${c.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                        style={{ border: "1px solid var(--border)" }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200">{c.extracted_data?.insured_name}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{c.extracted_data?.coverage_type} · {c.broker_company}</p>
                        </div>
                        <RiskScore score={c.score} />
                        <StatusBadge status={c.status} />
                        <ExternalLink size={11} className="text-slate-700" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* AI model info */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={13} className="text-slate-500" />
                  <span className="text-sm font-semibold text-white">Model transparency</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: "Model",             value: "claude-sonnet-4-6" },
                    { label: "Extraction method", value: "LLM structured output" },
                    { label: "Confidence",         value: `${Math.round(ex.confidence_score * 100)}%` },
                    { label: "Factors evaluated", value: String(ex.score_factors.length) },
                    { label: "EU AI Act class",   value: "High-risk (Art. 6)" },
                    { label: "Human oversight",   value: "Required — referral threshold 50–70" },
                  ].map(r => (
                    <div key={r.label} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                      <p className="text-slate-600 mb-0.5">{r.label}</p>
                      <p className="text-slate-300 font-medium">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "premium" && ex?.premium_model && (
            <>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={13} style={{ color: "var(--brand)" }} />
                  <span className="text-sm font-semibold text-white">Indicative premium model</span>
                </div>
                <PremiumRange model={ex.premium_model} />
              </div>

              <div className="card p-4">
                <p className="text-sm font-semibold text-white mb-3">Premium driver breakdown</p>
                <div className="space-y-2">
                  {ex.score_factors?.map(f => {
                    const base = ex.premium_model!.mid;
                    const adj  = Math.round((f.impact / 100) * base * -0.8);
                    return (
                      <div key={f.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span className="text-xs text-slate-400">{f.label}</span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: impactColor(f.impact) }}>
                          {adj > 0 ? "-" : "+"} £{Math.abs(adj).toLocaleString("en-GB")}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold text-white">Indicated premium</span>
                    <span className="text-sm font-bold text-white">£{ex.premium_model.mid.toLocaleString("en-GB")}</span>
                  </div>
                </div>
              </div>

              <div className="card p-4 text-xs text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-500 mb-1">Disclaimer</p>
                Indicative premium model generated by Velox AI based on extracted submission data. Not a binding quote. Subject to underwriter review, survey, and final terms agreed with the insured. All figures in GBP exclusive of IPT.
              </div>
            </>
          )}
        </div>

        {/* ── Right sidebar (1/3) ── */}
        <div className="space-y-4">
          {/* Decision panel */}
          {(status === "referred" || status === "pending") ? (
            <div className="card p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Decision required</p>
              <div className="space-y-2">
                <button onClick={() => decide("accepted")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <CheckCircle size={15} className="text-emerald-400" />
                  <span className="text-emerald-300">Accept</span>
                  <kbd className="ml-auto text-[10px] font-mono text-slate-600 bg-transparent">A</kbd>
                </button>
                <button onClick={() => decide("declined")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <XCircle size={15} className="text-red-400" />
                  <span className="text-red-300">Decline</span>
                  <kbd className="ml-auto text-[10px] font-mono text-slate-600 bg-transparent">D</kbd>
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Decision</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                {sub.decision_by && <span className="text-xs text-slate-600">by {sub.decision_by}</span>}
              </div>
              {sub.decision_at && (
                <p className="text-xs text-slate-700 mt-1">{formatDistanceToNow(parseISO(sub.decision_at), { addSuffix: true })}</p>
              )}
            </div>
          )}

          {/* Broker profile */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={13} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Broker profile</span>
            </div>
            <p className="text-sm font-semibold text-white">{sub.broker_company}</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">{sub.broker_name} · {sub.broker_email}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Submissions", value: subs.filter(s => s.broker_company === sub.broker_company).length },
                { label: "Bind rate",   value: `${brokerBindRate}%` },
                { label: "Avg score",   value: Math.round(subs.filter(s => s.broker_company === sub.broker_company && s.score !== null).reduce((a, s) => a + (s.score ?? 0), 0) / Math.max(1, subs.filter(s => s.broker_company === sub.broker_company && s.score !== null).length)) },
              ].map(r => (
                <div key={r.label} className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-sm font-bold text-white">{r.value}</p>
                  <p className="text-[10px] text-slate-700 mt-0.5">{r.label}</p>
                </div>
              ))}
            </div>
            {brokerHistory.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-700 uppercase tracking-wider mb-2">Recent submissions</p>
                {brokerHistory.map(s => (
                  <Link key={s.id} href={`/dashboard/submissions/${s.id}`}
                    className="flex items-center gap-2 text-xs hover:bg-white/[0.02] -mx-1 px-1 py-1 rounded transition-colors">
                    <span className="font-mono text-slate-600">{s.id}</span>
                    <span className="flex-1 truncate text-slate-400">{s.extracted_data?.insured_name ?? "—"}</span>
                    <StatusBadge status={s.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submission info</p>
            {[
              { label: "Received",   value: new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
              { label: "Processed",  value: sub.processed_at ? `${Math.round((new Date(sub.processed_at).getTime() - new Date(sub.created_at).getTime()) / 60000)} min` : "—" },
              { label: "Document",   value: sub.file_name?.split(".").pop()?.toUpperCase() ?? "—" },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-slate-600">{r.label}</span>
                <span className="text-slate-400 font-medium">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Lloyd's CDR */}
          <button onClick={exportCDR}
            className="w-full card p-4 text-left group hover:border-indigo-500/30 transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(79,110,247,0.15)" }}>
                <ExternalLink size={12} className="text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-white">Lloyd&apos;s CDR Export</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Export ACORD 28 formatted data for the Lloyd&apos;s Central Data Repository. Blueprint Two compliant.
            </p>
            <p className="text-[10px] text-indigo-400 mt-2 group-hover:text-indigo-300 transition-colors">Click to export →</p>
          </button>
        </div>
      </div>
    </div>
  );
}
