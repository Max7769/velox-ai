"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getSubmissions } from "@/lib/db";
import { decideAction } from "@/lib/actions";
import { RiskScore } from "@/components/ui/risk-score";
import { RefreshCw, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

/* ── Submission card ─────────────────────────────────────────────── */
function SubmissionCard({
  s, premiumLabel,
  onDecide,
}: {
  s: Submission;
  premiumLabel: string;
  onDecide: (id: string, decision: "accepted" | "declined") => void;
}) {
  const [deciding, setDeciding] = useState<"accepted" | "declined" | null>(null);

  const handleDecide = async (e: React.MouseEvent, decision: "accepted" | "declined") => {
    e.preventDefault();
    e.stopPropagation();
    if (deciding) return;
    setDeciding(decision);
    // Optimistic update fired via parent immediately
    onDecide(s.id, decision);
    try {
      await decideAction(s.id, decision, "Max");
      toast.success(decision === "accepted" ? "Accepted" : "Declined", {
        description: s.extracted_data?.insured_name ?? s.id,
        duration: 2500,
      });
    } catch {
      toast.error("Failed to save decision — please try again");
    } finally {
      setDeciding(null);
    }
  };

  return (
    <div className="rounded-xl mb-2.5 overflow-hidden transition-all hover:translate-y-[-1px]"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>

      {/* Card body — clickable to detail page */}
      <Link href={`/dashboard/submissions/${s.id}`} className="block p-4">
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
              {premiumLabel}:{" "}
              <span className="text-slate-300 font-medium">
                £{s.extracted_data.premium_model.mid.toLocaleString("en-GB")}
              </span>
            </span>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-700">
          View detail <ChevronRight size={9} />
        </div>
      </Link>

      {/* Inline quick-decide — only on referred cards */}
      {s.status === "referred" && (
        <div className="flex" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={e => handleDecide(e, "accepted")}
            disabled={deciding !== null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-all hover:bg-emerald-500/10 disabled:opacity-40"
            style={{ color: "#10b981", borderRight: "1px solid var(--border)" }}>
            {deciding === "accepted"
              ? <RefreshCw size={10} className="animate-spin" />
              : <CheckCircle size={11} />}
            Accept
          </button>
          <button
            onClick={e => handleDecide(e, "declined")}
            disabled={deciding !== null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-all hover:bg-red-500/10 disabled:opacity-40"
            style={{ color: "#ef4444" }}>
            {deciding === "declined"
              ? <RefreshCw size={10} className="animate-spin" />
              : <XCircle size={11} />}
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Column header stats ─────────────────────────────────────────── */
function ColumnHeader({
  label, color, count, gwp, avgScore, premiumLabel,
}: {
  label: string; color: string; count: number;
  gwp: number; avgScore: number | null; premiumLabel: string;
}) {
  return (
    <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${color}20` }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: color + "30", color }}>
          {count}
        </span>
      </div>
      <div className="ml-4 flex items-center gap-3 text-[10px] text-slate-600">
        {gwp > 0 && <span>£{(gwp / 1000).toFixed(0)}K {premiumLabel}</span>}
        {avgScore !== null && <span>Avg {avgScore}</span>}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function PipelinePage() {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const COLUMNS: { key: SubmissionStatus; label: string; color: string; bg: string }[] = [
    { key: "processing", label: t("pipe.processing"), color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
    { key: "referred",   label: t("pipe.referred"),   color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { key: "accepted",   label: t("pipe.accepted"),   color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { key: "declined",   label: t("pipe.declined"),   color: "#ef4444", bg: "rgba(239,68,68,0.08)"  },
  ];

  const load = useCallback(async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic update: move card to new column instantly, server persists in background
  const handleQuickDecide = useCallback((id: string, decision: "accepted" | "declined") => {
    setSubmissions(prev =>
      prev.map(s => s.id === id
        ? { ...s, status: decision, decision_at: new Date().toISOString(), decision_by: "Max" }
        : s
      )
    );
  }, []);

  const byStatus = (key: string) => submissions.filter(s => s.status === key);

  const colGWP = (key: string) =>
    byStatus(key).reduce((a, s) => a + (s.extracted_data?.premium_model?.mid ?? 0), 0);

  const colAvgScore = (key: string) => {
    const scored = byStatus(key).filter(s => s.score !== null);
    if (!scored.length) return null;
    return Math.round(scored.reduce((a, s) => a + (s.score ?? 0), 0) / scored.length);
  };

  const totalGWP     = byStatus("accepted").reduce((a, s) => a + (s.extracted_data?.premium_model?.mid ?? 0), 0);
  const referredCount = byStatus("referred").length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-slate-600" style={{ minHeight: "60vh" }}>
        <RefreshCw size={14} className="animate-spin" />
        <span className="text-sm">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-white">{t("pipe.title")}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {submissions.length} {t("common.total")} ·{" "}
            £{(totalGWP / 1000).toFixed(0)}K {t("pipe.gwp")}
            {referredCount > 0 && (
              <>
                {" · "}
                <span className="text-amber-400 font-medium">{referredCount}</span>
                <span className="text-slate-500"> {referredCount === 1 ? "awaiting decision" : "awaiting decisions"}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Referred count alert pill */}
          {referredCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-medium">
                {referredCount} need{referredCount === 1 ? "s" : ""} a decision — use buttons below
              </span>
            </div>
          )}
          <button onClick={load}
            className="p-1.5 text-slate-600 hover:text-slate-400 transition-colors rounded-lg hover:bg-white/5"
            title={t("common.refresh")}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-2 min-h-0">
        {COLUMNS.map(col => {
          const cards = byStatus(col.key);

          return (
            <div key={col.key} className="flex-shrink-0 w-72 flex flex-col rounded-2xl overflow-hidden"
              style={{ background: col.bg, border: `1px solid ${col.color}20` }}>

              <ColumnHeader
                label={col.label}
                color={col.color}
                count={cards.length}
                gwp={colGWP(col.key)}
                avgScore={colAvgScore(col.key)}
                premiumLabel={t("pipe.premium")}
              />

              <div className="flex-1 overflow-y-auto p-3 space-y-0">
                {cards.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-xs text-slate-700">
                    {t("pipe.empty")}
                  </div>
                ) : (
                  cards.map(s => (
                    <SubmissionCard
                      key={s.id}
                      s={s}
                      premiumLabel={t("pipe.premium")}
                      onDecide={handleQuickDecide}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
