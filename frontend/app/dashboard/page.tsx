"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getSubmissions, getAuditLog } from "@/lib/db";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import {
  Upload, Clock, CheckCircle, TrendingUp, ArrowUpRight,
  FileText, Zap, Activity, Building2, RefreshCw,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Submission, AuditEntry } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { SkeletonStat, SkeletonTable, SkeletonCard } from "@/components/ui/skeleton";
import { OnboardingWidget } from "@/components/onboarding-widget";

function Greeting() {
  const { t } = useTranslation();
  const hour = new Date().getHours();
  if (hour < 12) return <>{t("dash.greetMorning")}</>;
  if (hour < 17) return <>{t("dash.greetAfternoon")}</>;
  return <>{t("dash.greetEvening")}</>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [auditFeed, setAuditFeed]     = useState<AuditEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tick, setTick]               = useState(0);

  const load = useCallback(async () => {
    try {
      const subs = await getSubmissions();
      setSubmissions(subs);
      // Build a cross-submission activity feed from the first few submissions
      const auditArrays = await Promise.all(
        subs.slice(0, 4).map(s => getAuditLog(s.id))
      );
      const flat = auditArrays.flat().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAuditFeed(flat.slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 s (updates relative timestamps)
  useEffect(() => {
    const id = setInterval(() => setTick(c => c + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Derived stats
  const accepted        = submissions.filter(s => s.status === "accepted").length;
  const referred        = submissions.filter(s => s.status === "referred").length;
  const processed       = submissions.filter(s => s.status !== "processing").length;
  const bindRate        = processed > 0 ? Math.round((accepted / processed) * 100) : 0;
  const processingQueue = submissions.filter(s => s.status === "processing");
  const recent          = submissions.slice(0, 5);

  const brokerMap = submissions.reduce<Record<string, { company: string; count: number; accepted: number }>>((acc, s) => {
    const key = s.broker_company;
    if (!acc[key]) acc[key] = { company: key, count: 0, accepted: 0 };
    acc[key].count++;
    if (s.status === "accepted") acc[key].accepted++;
    return acc;
  }, {});
  const leaderboard = Object.values(brokerMap).sort((a, b) => b.count - a.count).slice(0, 5);

  const isSameDay = (iso: string) => {
    const d = parseISO(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };
  const todayCount = submissions.filter(s => isSameDay(s.created_at)).length;

  const decided = submissions.filter(s => s.decision_at);
  const avgDecisionMinutes = decided.length
    ? Math.round(
        decided.reduce((a, s) => a + (parseISO(s.decision_at!).getTime() - parseISO(s.created_at).getTime()) / 60000, 0)
        / decided.length
      )
    : null;

  const metrics = [
    { label: t("metrics.today"),      value: String(todayCount), icon: FileText    },
    { label: t("metrics.avgTime"),    value: avgDecisionMinutes !== null ? `${avgDecisionMinutes} min` : "—", icon: Clock },
    { label: t("metrics.bindRate"),   value: `${bindRate}%`, icon: CheckCircle },
    { label: t("metrics.monthlyVol"), value: String(submissions.length || "—"), icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="h-3.5 w-64 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <SkeletonTable rows={5} cols={5} />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">
            <Greeting />, Max
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {referred > 0
              ? <><span className="text-amber-400 font-medium">{referred}</span>{" "}{referred === 1 ? t("dash.awaitDecision") : t("dash.awaitDecisions")}</>
              : t("dash.queueClear")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {processingQueue.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300">{processingQueue.length} {t("dash.processing")}</span>
            </div>
          )}
          <Link href="/dashboard/upload"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: "var(--brand)" }}>
            <Upload size={14} /> {t("common.newSub")}
          </Link>
        </div>
      </div>

      {/* Onboarding */}
      <OnboardingWidget submissionCount={submissions.length} />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">{m.label}</span>
              <m.icon size={14} className="text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Referred queue */}
      {referred > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.05)" }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-amber-400">
              {t("dash.needsDecision")} ({referred})
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[t("table.id"), t("table.insured"), t("table.type"), t("table.broker"), t("table.score"), t("table.submitted")].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.filter(s => s.status === "referred").map((s, i, arr) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors"
                  style={i !== arr.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                  <td className="td">
                    <Link href={`/dashboard/submissions/${s.id}`} className="font-mono text-xs font-medium" style={{ color: "var(--brand)" }}>
                      {s.id}
                    </Link>
                  </td>
                  <td className="td font-medium text-white">{s.extracted_data?.insured_name ?? "—"}</td>
                  <td className="td text-slate-400">{s.extracted_data?.coverage_type ?? "—"}</td>
                  <td className="td text-slate-400">{s.broker_company}</td>
                  <td className="td"><RiskScore score={s.score} /></td>
                  <td className="td text-slate-500 text-xs">
                    {formatDistanceToNow(parseISO(s.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent submissions — 2 cols */}
        <div className="col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-sm font-semibold text-white">{t("dash.recentSubs")}</span>
            <Link href="/dashboard/submissions" className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: "var(--brand)" }}>
              {t("common.viewAll")} <ArrowUpRight size={11} />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[t("table.id"), t("table.insured"), t("table.coverage"), t("table.score"), t("table.status")].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={5} className="td text-center text-slate-600 text-sm py-8">{t("sub.noSubs")}</td></tr>
              ) : recent.map((s, i) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors"
                  style={i !== recent.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                  <td className="td">
                    <Link href={`/dashboard/submissions/${s.id}`} className="font-mono text-xs font-medium" style={{ color: "var(--brand)" }}>
                      {s.id}
                    </Link>
                  </td>
                  <td className="td font-medium text-slate-200 max-w-[140px] truncate">{s.extracted_data?.insured_name ?? "—"}</td>
                  <td className="td text-slate-400 text-xs">{s.extracted_data?.coverage_type ?? "—"}</td>
                  <td className="td"><RiskScore score={s.score} /></td>
                  <td className="td"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Broker leaderboard */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={13} className="text-slate-500" />
              <span className="text-sm font-semibold text-white">{t("dash.topBrokers")}</span>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-600">—</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((b, i) => {
                  const rate = b.count > 0 ? Math.round((b.accepted / b.count) * 100) : 0;
                  return (
                    <div key={b.company}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-700 w-3 tabular-nums">{i + 1}</span>
                          <span className="text-xs text-slate-300 font-medium">{b.company}</span>
                        </div>
                        <span className="text-xs text-slate-500 tabular-nums">
                          {b.count} · <span className="text-emerald-500">{rate}%</span>
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(b.count / (leaderboard[0]?.count || 1)) * 100}%`, background: "var(--brand)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={13} className="text-slate-500" />
              <span className="text-sm font-semibold text-white">{t("dash.activity")}</span>
            </div>
            {auditFeed.length === 0 ? (
              <p className="text-xs text-slate-600">—</p>
            ) : (
              <div className="space-y-3">
                {auditFeed.map(entry => (
                  <div key={entry.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: entry.action === "accepted" ? "#10b981" : entry.action === "declined" ? "#ef4444" : entry.action === "referred" ? "#f59e0b" : "#3b82f6" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 leading-relaxed">{entry.detail}</p>
                      <p className="text-[10px] text-slate-700 mt-0.5">
                        {entry.actor} · {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI engine status */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-emerald-400" />
              <span className="text-sm font-semibold text-white">{t("dash.aiEngine")}</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t("common.online")}
              </span>
            </div>
            <div className="space-y-2">
              {[
                { label: t("dash.model"),     value: "claude-sonnet-4-6" },
                { label: t("dash.avgConf"),   value: "91.5%"             },
                { label: t("dash.processed"), value: `${processed} ${t("common.docs")}` },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-xs text-slate-600">{r.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
