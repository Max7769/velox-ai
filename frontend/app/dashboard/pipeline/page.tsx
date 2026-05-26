"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getSubmissions } from "@/lib/db";
import { RiskScore } from "@/components/ui/risk-score";
import { RefreshCw, ArrowRight } from "lucide-react";
import type { Submission } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";

const COLUMNS = [
  { key: "processing", label: "Processing",   color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { key: "referred",   label: "Referred",     color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { key: "accepted",   label: "Accepted",     color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  { key: "declined",   label: "Declined",     color: "#ef4444", bg: "rgba(239,68,68,0.08)"  },
] as const;

function SubmissionCard({ s }: { s: Submission }) {
  return (
    <Link href={`/dashboard/submissions/${s.id}`}
      className="block rounded-xl p-4 mb-2.5 transition-all hover:translate-y-[-1px]"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--brand)" }}>{s.id}</span>
        <RiskScore score={s.score} />
      </div>
      <p className="text-sm font-semibold text-white leading-tight mb-1 truncate">
        {s.extracted_data?.insured_name ?? "—"}
      </p>
      <p className="text-xs text-slate-500 truncate mb-2">{s.extracted_data?.coverage_type ?? "—"}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600">{s.broker_company}</span>
        <span className="text-[10px] text-slate-700">
          {formatDistanceToNow(parseISO(s.created_at), { addSuffix: true })}
        </span>
      </div>
      {s.extracted_data?.premium_model && (
        <div className="mt-2.5 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-[10px] text-slate-500">
            Premium: <span className="text-slate-300 font-medium">
              £{s.extracted_data.premium_model.mid.toLocaleString("en-GB")}
            </span>
          </span>
        </div>
      )}
    </Link>
  );
}

export default function PipelinePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]         = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byStatus = (key: string) => submissions.filter(s => s.status === key);

  // GWP for accepted column
  const acceptedGWP = submissions
    .filter(s => s.status === "accepted")
    .reduce((a, s) => a + (s.extracted_data?.premium_model?.mid ?? 0), 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-slate-600" style={{ minHeight: "60vh" }}>
        <RefreshCw size={14} className="animate-spin" />
        <span className="text-sm">Loading pipeline…</span>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-white">Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {submissions.length} submissions · £{(acceptedGWP / 1000).toFixed(0)}K GWP bound
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs">
            {COLUMNS.map(c => (
              <span key={c.key} className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                {byStatus(c.key).length} {c.label}
              </span>
            ))}
          </div>
          <button onClick={load}
            className="p-1.5 text-slate-600 hover:text-slate-400 transition-colors rounded-lg hover:bg-white/5">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-2 min-h-0">
        {COLUMNS.map(col => {
          const cards = byStatus(col.key);
          const colGWP = cards.reduce((a, s) => a + (s.extracted_data?.premium_model?.mid ?? 0), 0);

          return (
            <div key={col.key} className="flex-shrink-0 w-72 flex flex-col rounded-2xl overflow-hidden"
              style={{ background: col.bg, border: `1px solid ${col.color}20` }}>
              {/* Column header */}
              <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${col.color}20` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
                    <span className="text-sm font-semibold text-white">{col.label}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: col.color + "30", color: col.color }}>
                    {cards.length}
                  </span>
                </div>
                {colGWP > 0 && (
                  <p className="text-[10px] text-slate-600 ml-4">
                    £{(colGWP / 1000).toFixed(0)}K premium
                  </p>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-0">
                {cards.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-xs text-slate-700">
                    No submissions
                  </div>
                ) : (
                  cards.map(s => <SubmissionCard key={s.id} s={s} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
