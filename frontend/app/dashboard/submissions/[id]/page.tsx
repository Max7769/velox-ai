"use client";
import { useParams, useRouter } from "next/navigation";
import { mockSubmissions, mockAudit } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import { CheckCircle, XCircle, MessageSquare, Download, AlertTriangle, Shield, Clock, User, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sub = mockSubmissions.find(s => s.id === id) ?? mockSubmissions[0];
  const ex = sub.extracted_data;
  const [note, setNote] = useState(sub.notes ?? "");
  const [status, setStatus] = useState(sub.status);

  const decide = (decision: "accepted" | "declined") => {
    setStatus(decision);
    toast.success(decision === "accepted" ? "Submission accepted" : "Submission declined", {
      description: `${sub.id} · ${ex?.insured_name}`,
    });
  };

  const riskLevel = sub.score !== null
    ? sub.score >= 70 ? { label: "Low risk", color: "text-emerald-400", bg: "rgba(16,185,129,0.08)" }
    : sub.score >= 50 ? { label: "Medium risk", color: "text-amber-400", bg: "rgba(245,158,11,0.08)" }
    : { label: "High risk", color: "text-red-400", bg: "rgba(239,68,68,0.08)" }
    : null;

  return (
    <div className="p-6 max-w-5xl">
      {/* Back */}
      <Link href="/dashboard/submissions" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-5">
        <ChevronLeft size={13} /> All submissions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs text-slate-500">{sub.id}</span>
            <span className="text-slate-700">·</span>
            <StatusBadge status={status} />
          </div>
          <h1 className="text-2xl font-bold text-white">{ex?.insured_name ?? "Processing…"}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{ex?.coverage_type} · {sub.broker_company} · {sub.broker_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.info("Export coming soon")}
            className="btn-ghost flex items-center gap-1.5 text-xs">
            <Download size={13} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Risk score card */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={13} className="text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">Risk score</span>
          </div>
          {sub.score !== null ? (
            <>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-white">{sub.score}</span>
                <span className="text-slate-600 text-sm pb-1">/100</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className={`h-full rounded-full transition-all ${sub.score >= 70 ? "bg-emerald-500" : sub.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${sub.score}%` }} />
              </div>
              {riskLevel && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ background: riskLevel.bg, color: riskLevel.color }}>
                  {riskLevel.label}
                </span>
              )}
              <p className="text-xs text-slate-600 mt-2">AI confidence: {ex ? Math.round(ex.confidence_score * 100) : 0}%</p>
            </>
          ) : (
            <div className="flex items-center gap-2 py-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-slate-500">Processing…</span>
            </div>
          )}
        </div>

        {/* Key fields */}
        <div className="card p-5 col-span-2 grid grid-cols-2 gap-4">
          {ex ? [
            { label: "Coverage limit", value: ex.coverage_limit },
            { label: "Est. premium", value: ex.premium_estimate },
            { label: "Industry", value: ex.industry },
            { label: "Effective date", value: ex.effective_date },
            { label: "Broker email", value: sub.broker_email },
            { label: "Received", value: new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-slate-500 font-medium mb-1">{f.label}</p>
              <p className="text-sm text-slate-200 font-medium">{f.value ?? "—"}</p>
            </div>
          )) : (
            <div className="col-span-2 flex items-center justify-center py-8 text-slate-600 text-sm">Extracting data…</div>
          )}
        </div>
      </div>

      {ex && (
        <>
          {/* Risk factors */}
          <div className="card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={13} className="text-amber-500" />
              <span className="text-sm font-semibold text-white">Risk factors identified ({ex.risk_factors.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ex.risk_factors.map((rf: string) => (
                <div key={rf} className="flex items-start gap-2.5 p-3 rounded-lg text-sm text-slate-400" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {rf}
                </div>
              ))}
            </div>
          </div>

          {/* Loss history */}
          <div className="card p-5 mb-4">
            <p className="text-sm font-semibold text-white mb-2">Loss history</p>
            <p className="text-sm text-slate-400 leading-relaxed">{ex.loss_history}</p>
          </div>
        </>
      )}

      {/* Notes */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={13} className="text-slate-500" />
          <span className="text-sm font-semibold text-white">Underwriter notes</span>
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add notes for this submission…"
          className="input-dark w-full resize-none text-sm" />
        <button onClick={() => toast.success("Note saved")} className="mt-2 btn-ghost text-xs px-3 py-1.5">Save note</button>
      </div>

      {/* Audit trail */}
      <div className="card p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={13} className="text-slate-500" />
          <span className="text-sm font-semibold text-white">Audit trail</span>
        </div>
        <div className="space-y-3">
          {mockAudit.map((entry, i) => (
            <div key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>
                  <User size={10} className="text-slate-500" />
                </div>
                {i !== mockAudit.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "var(--border)" }} />}
              </div>
              <div className="pb-3 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-slate-300">{entry.actor}</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-600">
                    {new Date(entry.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize"
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

      {/* Actions */}
      {(status === "referred" || status === "pending") && (
        <div className="flex gap-3">
          <button onClick={() => decide("accepted")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle size={15} className="text-emerald-400" />
            <span className="text-emerald-300">Accept submission</span>
          </button>
          <button onClick={() => decide("declined")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <XCircle size={15} className="text-red-400" />
            <span className="text-red-300">Decline</span>
          </button>
        </div>
      )}
    </div>
  );
}
