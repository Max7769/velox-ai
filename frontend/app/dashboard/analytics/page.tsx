"use client";
import { useState, useEffect, useMemo } from "react";
import { getAnalytics, getSubmissions, getBrokerStats } from "@/lib/db";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingUp, Clock, CheckCircle, AlertCircle, PoundSterling, BarChart3, Target, RefreshCw } from "lucide-react";
import type { AnalyticsData, Submission, BrokerStat } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

const tooltipStyle = { background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#94a3b8" };
const PIE_COLORS   = ["#4f6ef7", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

type Period = "7d" | "14d" | "30d";
const sliceMap: Record<Period, number> = { "7d": 7, "14d": 14, "30d": 30 };

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [analytics,   setAnalytics]   = useState<AnalyticsData[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [brokerStats, setBrokerStats] = useState<BrokerStat[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [period,      setPeriod]      = useState<Period>("30d");
  const [activeKpi,   setActiveKpi]   = useState<"volume" | "gwp">("gwp");

  useEffect(() => {
    Promise.all([getAnalytics(), getSubmissions(), getBrokerStats()])
      .then(([ana, subs, brokers]) => {
        setAnalytics(ana);
        setSubmissions(subs);
        setBrokerStats(brokers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── derived ──────────────────────────────────────────────────────────────────
  const totalGWP      = useMemo(() => analytics.reduce((a, d) => a + d.gwp, 0), [analytics]);
  const totalVolume   = useMemo(() => analytics.reduce((a, d) => a + d.total, 0), [analytics]);
  const totalAccepted = useMemo(() => analytics.reduce((a, d) => a + d.accepted, 0), [analytics]);
  const bindRate      = totalVolume > 0 ? Math.round((totalAccepted / totalVolume) * 100) : 0;
  const avgGWP        = Math.round(totalGWP / Math.max(totalAccepted, 1));
  const pending          = submissions.filter(s => s.status === "referred").length;
  const referredPipelineGWP = useMemo(() =>
    submissions.filter(s => s.status === "referred")
      .reduce((a, s) => a + (s.extracted_data?.premium_model?.mid ?? 0), 0)
  , [submissions]);

  const chartData = useMemo(() => analytics.map(d => ({
    ...d,
    date: format(parseISO(d.date), "dd MMM"),
    gwpK: Math.round(d.gwp / 1000),
  })), [analytics]);

  // Loss ratio — seeded simulation so it's stable across renders
  const lossData = useMemo(() => analytics.map((d, i) => ({
    date: format(parseISO(d.date), "dd MMM"),
    lossRatio: Math.max(15, Math.min(85, 45 + Math.sin(i / 4) * 20 + Math.sin(i * 1.7) * 5)),
    target: 60,
  })), [analytics]);

  const coverageBreakdown = useMemo(() =>
    submissions.reduce<Record<string, { accepted: number; declined: number; referred: number; gwp: number }>>((acc, s) => {
      const t = s.extracted_data?.coverage_type ?? "Unknown";
      if (!acc[t]) acc[t] = { accepted: 0, declined: 0, referred: 0, gwp: 0 };
      if (s.status === "accepted") { acc[t].accepted++; acc[t].gwp += s.extracted_data?.premium_model?.mid ?? 0; }
      else if (s.status === "declined") acc[t].declined++;
      else if (s.status === "referred") acc[t].referred++;
      return acc;
    }, {})
  , [submissions]);

  const coverageData = useMemo(() =>
    Object.entries(coverageBreakdown)
      .map(([name, v]) => {
        const total    = v.accepted + v.declined + v.referred;
        const bindRate = total > 0 ? Math.round((v.accepted / total) * 100) : 0;
        const avgScore = (() => {
          const scored = submissions.filter(s =>
            (s.extracted_data?.coverage_type ?? "Unknown") === name && s.score !== null
          );
          return scored.length ? Math.round(scored.reduce((a, s) => a + (s.score ?? 0), 0) / scored.length) : null;
        })();
        return {
          name: name.split(" ").slice(0, 2).join(" "),
          fullName: name,
          ...v,
          total,
          bindRate,
          avgScore,
        };
      })
      .sort((a, b) => b.gwp - a.gwp)
  , [coverageBreakdown, submissions]);

  const classPie = useMemo(() =>
    coverageData.map((c, i) => ({ name: c.name, value: c.total, color: PIE_COLORS[i % PIE_COLORS.length] }))
  , [coverageData]);

  const funnelData = useMemo(() => [
    { name: "Received",  value: totalVolume,                                                    fill: "#4f6ef7" },
    { name: "Extracted", value: submissions.filter(s => s.extracted_data).length,              fill: "#6366f1" },
    { name: "Scored",    value: submissions.filter(s => s.score !== null).length,               fill: "#8b5cf6" },
    { name: "Decided",   value: submissions.filter(s => s.decision_at !== null).length,        fill: "#10b981" },
    { name: "Bound",     value: submissions.filter(s => s.status === "accepted").length,        fill: "#059669" },
  ], [submissions, totalVolume]);

  const slicedData = chartData.slice(-sliceMap[period]);
  const slicedLoss = lossData.slice(-sliceMap[period]);

  const kpis = [
    { label: t("ana.gwp"),        value: `£${(totalGWP / 1000).toFixed(0)}K`,    sub: `+24% ${t("ana.priorPeriod")}`,  icon: PoundSterling, color: "#4f6ef7" },
    { label: t("ana.vol30"),      value: String(totalVolume),                     sub: `+18% ${t("ana.priorPeriod")}`,  icon: TrendingUp,    color: "#10b981" },
    { label: t("ana.bindRate"),   value: `${bindRate}%`,                          sub: t("ana.acceptedSub"),             icon: CheckCircle,   color: "#10b981" },
    { label: t("ana.avgPremium"), value: `£${(avgGWP / 1000).toFixed(1)}K`,      sub: t("ana.acrossBound"),             icon: Target,        color: "#f59e0b" },
    { label: t("ana.avgTime"),    value: "8.4 min",                               sub: `−23% ${t("ana.priorPeriod")}`,  icon: Clock,         color: "#6366f1" },
    { label: t("ana.pending"),    value: String(pending),                          sub: referredPipelineGWP > 0 ? `£${(referredPipelineGWP/1000).toFixed(0)}K pipeline` : t("ana.referredSub"), icon: AlertCircle, color: "#f59e0b" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-slate-600" style={{ minHeight: "60vh" }}>
        <RefreshCw size={14} className="animate-spin" />
        <span className="text-sm">{t("common.loading")}…</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">{t("ana.title")}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t("ana.subtitle")}</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {(["7d", "14d", "30d"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={period === p ? { background: "var(--brand)", color: "#fff" } : { color: "#64748b" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map(m => (
          <div key={m.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-500 font-medium leading-tight">{m.label}</span>
              <m.icon size={12} style={{ color: m.color, opacity: 0.7 }} />
            </div>
            <p className="text-xl font-bold text-white mb-0.5">{m.value}</p>
            <p className="text-[10px] text-slate-600">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Volume + GWP chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">{t("ana.mainChart")}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{t("ana.last")} {period}</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            {([["gwp", t("ana.gwpLabel")], ["volume", t("ana.volLabel")]] as [string, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setActiveKpi(k as "volume" | "gwp")}
                className="px-3 py-1 rounded text-xs font-medium transition-all"
                style={activeKpi === k ? { background: "var(--brand)", color: "#fff" } : { color: "#64748b" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          {activeKpi === "gwp" ? (
            <AreaChart data={slicedData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gwpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f6ef7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} interval={Math.floor(sliceMap[period] / 7)} />
              <YAxis tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} tickFormatter={v => `£${v}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`£${v}K`, "GWP"]} />
              <Area type="monotone" dataKey="gwpK" stroke="#4f6ef7" strokeWidth={2} fill="url(#gwpGrad)" name="GWP (£K)" />
            </AreaChart>
          ) : (
            <AreaChart data={slicedData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                {[["acc","#10b981"],["ref","#f59e0b"],["dec","#ef4444"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} interval={Math.floor(sliceMap[period] / 7)} />
              <YAxis tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#64748b" }} />
              <Area type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={1.5} fill="url(#acc)" name={t("status.accepted")} />
              <Area type="monotone" dataKey="referred" stroke="#f59e0b" strokeWidth={1.5} fill="url(#ref)" name={t("status.referred")} />
              <Area type="monotone" dataKey="declined" stroke="#ef4444" strokeWidth={1.5} fill="url(#dec)" name={t("status.declined")} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Loss ratio + Funnel */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={13} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-white">{t("ana.lossRatio")}</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#fcd34d" }}>
              {t("ana.target")}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={slicedLoss} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} interval={Math.floor(sliceMap[period] / 5)} />
              <YAxis tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Line type="monotone" dataKey="lossRatio" stroke="#f59e0b" strokeWidth={2} dot={false} name="Loss ratio" />
              <Line type="monotone" dataKey="target"    stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="4 4" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={13} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-white">{t("ana.funnel")}</h2>
          </div>
          <div className="space-y-2">
            {funnelData.map((step, i) => {
              const pct  = funnelData[0].value > 0 ? Math.round((step.value / funnelData[0].value) * 100) : 0;
              const drop = i > 0 && funnelData[i - 1].value > 0
                ? Math.round(((funnelData[i - 1].value - step.value) / funnelData[i - 1].value) * 100)
                : null;
              return (
                <div key={step.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{step.name}</span>
                    <div className="flex items-center gap-2">
                      {drop !== null && drop > 0 && <span className="text-[10px] text-slate-700">−{drop}%</span>}
                      <span className="text-xs font-semibold text-slate-300 tabular-nums">{step.value}</span>
                    </div>
                  </div>
                  <div className="w-full h-5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full rounded flex items-center px-2 transition-all"
                      style={{ width: `${pct}%`, background: step.fill + "40", border: `1px solid ${step.fill}40` }}>
                      <span className="text-[10px] font-medium" style={{ color: step.fill }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Coverage + pie */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">{t("ana.byCoverage")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={coverageData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10, color: "#64748b" }} />
              <Bar dataKey="accepted" stackId="a" fill="#10b981" name={t("status.accepted")} radius={[0,0,0,0]} />
              <Bar dataKey="referred" stackId="a" fill="#f59e0b" name={t("status.referred")} />
              <Bar dataKey="declined" stackId="a" fill="#ef4444" radius={[3,3,0,0]} name={t("status.declined")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">{t("ana.classBiz")}</h2>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={classPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={2}>
                  {classPie.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5 mt-2">
              {classPie.map(c => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="flex-1 text-slate-400 truncate">{c.name}</span>
                  <span className="text-slate-500 font-medium">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class of business performance table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold text-white">Class of Business Performance</h2>
          <span className="text-[10px] text-slate-600">Sorted by GWP</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Class", "Total", "Accepted", "Referred", "Declined", "GWP", "Bind Rate", "Avg Score"].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coverageData.map((c, i) => (
              <tr key={c.fullName} className="hover:bg-white/[0.02] transition-colors"
                style={i !== coverageData.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                <td className="td font-semibold text-slate-200">{c.fullName}</td>
                <td className="td text-slate-400">{c.total}</td>
                <td className="td"><span className="text-emerald-400 font-medium">{c.accepted}</span></td>
                <td className="td"><span className="text-amber-400 font-medium">{c.referred}</span></td>
                <td className="td"><span className="text-red-400 font-medium">{c.declined}</span></td>
                <td className="td font-medium text-slate-300">
                  {c.gwp > 0 ? `£${c.gwp.toLocaleString("en-GB")}` : "—"}
                </td>
                <td className="td">
                  <span className="text-xs font-semibold"
                    style={{ color: c.bindRate >= 70 ? "#10b981" : c.bindRate >= 40 ? "#f59e0b" : "#ef4444" }}>
                    {c.bindRate}%
                  </span>
                </td>
                <td className="td">
                  {c.avgScore !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${c.avgScore}%`, background: c.avgScore >= 70 ? "#10b981" : c.avgScore >= 50 ? "#f59e0b" : "#ef4444" }} />
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-slate-400">{c.avgScore}</span>
                    </div>
                  ) : <span className="text-slate-700">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Broker performance matrix */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold text-white">{t("ana.brokerMatrix")}</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[t("table.broker"), t("bk.submissions"), t("bk.accepted"), t("bk.declined"), t("bk.referred"), t("bk.gwp"), t("bk.avgScore"), t("bk.bindRate")].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brokerStats.map((b, i) => (
              <tr key={b.company} className="hover:bg-white/[0.02] transition-colors"
                style={i !== brokerStats.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                <td className="td font-semibold text-slate-200">{b.company}</td>
                <td className="td text-slate-400">{b.submissions}</td>
                <td className="td"><span className="text-emerald-400 font-medium">{b.accepted}</span></td>
                <td className="td"><span className="text-red-400 font-medium">{b.declined}</span></td>
                <td className="td"><span className="text-amber-400 font-medium">{b.referred}</span></td>
                <td className="td font-medium text-slate-300">£{b.gwp.toLocaleString("en-GB")}</td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${b.avgScore}%`, background: b.avgScore >= 70 ? "#10b981" : b.avgScore >= 50 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-slate-400">{b.avgScore}</span>
                  </div>
                </td>
                <td className="td">
                  <span className="text-xs font-semibold"
                    style={{ color: b.bindRate >= 70 ? "#10b981" : b.bindRate >= 40 ? "#f59e0b" : "#ef4444" }}>
                    {b.bindRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision breakdown */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-5">{t("ana.decisions")}</h2>
        <div className="space-y-4">
          {[
            { label: t("status.accepted"),   count: submissions.filter(s => s.status === "accepted").length,   color: "#10b981" },
            { label: t("status.referred"),   count: submissions.filter(s => s.status === "referred").length,   color: "#f59e0b" },
            { label: t("status.declined"),   count: submissions.filter(s => s.status === "declined").length,   color: "#ef4444" },
            { label: t("status.processing"), count: submissions.filter(s => s.status === "processing").length, color: "#3b82f6" },
          ].map(({ label, count, color }) => {
            const pct = submissions.length > 0 ? Math.round((count / submissions.length) * 100) : 0;
            return (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-xs text-slate-500">{count} · {pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
