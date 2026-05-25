"use client";
import { useState } from "react";
import { mockAnalytics, mockSubmissions, mockBrokerStats } from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, FunnelChart, Funnel, LabelList, PieChart, Pie, Cell
} from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingUp, Clock, CheckCircle, AlertCircle, PoundSterling, BarChart3, Target, Zap } from "lucide-react";

/* ── derived data ─────────────────────────────────────── */
const totalGWP     = mockAnalytics.reduce((a, d) => a + d.gwp, 0);
const totalVolume  = mockAnalytics.reduce((a, d) => a + d.total, 0);
const totalAccepted = mockAnalytics.reduce((a, d) => a + d.accepted, 0);
const bindRate     = Math.round((totalAccepted / totalVolume) * 100);
const pending      = mockSubmissions.filter(s => s.status === "referred").length;
const avgGWP       = Math.round(totalGWP / Math.max(totalAccepted, 1));

const kpis = [
  { label: "Gross Written Premium",     value: `£${(totalGWP / 1000).toFixed(0)}K`,  sub: "+24% vs prior period", icon: PoundSterling, color: "#4f6ef7" },
  { label: "30-day volume",             value: String(totalVolume),                   sub: "+18% vs prior period", icon: TrendingUp,    color: "#10b981" },
  { label: "Bind rate",                 value: `${bindRate}%`,                        sub: "Accepted submissions",  icon: CheckCircle,   color: "#10b981" },
  { label: "Avg premium per bind",      value: `£${(avgGWP / 1000).toFixed(1)}K`,    sub: "Across accepted risks", icon: Target,        color: "#f59e0b" },
  { label: "Avg processing time",       value: "8.4 min",                             sub: "−23% vs prior period",  icon: Clock,         color: "#6366f1" },
  { label: "Pending review",            value: String(pending),                        sub: "Referred submissions",  icon: AlertCircle,   color: "#f59e0b" },
];

const chartData = mockAnalytics.map(d => ({
  ...d,
  date: format(parseISO(d.date), "dd MMM"),
  gwpK: Math.round(d.gwp / 1000),
}));

// Loss ratio (simulated)
const lossData = mockAnalytics.map((d, i) => ({
  date: format(parseISO(d.date), "dd MMM"),
  lossRatio: Math.max(15, Math.min(85, 45 + Math.sin(i / 4) * 20 + (Math.random() - 0.5) * 10)),
  target: 60,
}));

// Coverage type breakdown
const coverageBreakdown = mockSubmissions.reduce<Record<string, { accepted: number; declined: number; referred: number; gwp: number }>>((acc, s) => {
  const t = s.extracted_data?.coverage_type ?? "Unknown";
  if (!acc[t]) acc[t] = { accepted: 0, declined: 0, referred: 0, gwp: 0 };
  if (s.status === "accepted") { acc[t].accepted++; acc[t].gwp += (s.extracted_data?.premium_model?.mid ?? 0); }
  else if (s.status === "declined") acc[t].declined++;
  else if (s.status === "referred") acc[t].referred++;
  return acc;
}, {});

const coverageData = Object.entries(coverageBreakdown).map(([name, v]) => ({
  name: name.split(" ").slice(0, 2).join(" "),
  ...v,
  total: v.accepted + v.declined + v.referred,
})).sort((a, b) => b.total - a.total);

// Pie chart for class of business
const PIE_COLORS = ["#4f6ef7", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const classPie = coverageData.map((c, i) => ({ name: c.name, value: c.total, color: PIE_COLORS[i % PIE_COLORS.length] }));

// Conversion funnel
const funnelData = [
  { name: "Received",   value: totalVolume,                                               fill: "#4f6ef7" },
  { name: "Extracted",  value: mockSubmissions.filter(s => s.extracted_data).length,      fill: "#6366f1" },
  { name: "Scored",     value: mockSubmissions.filter(s => s.score !== null).length,      fill: "#8b5cf6" },
  { name: "Decided",    value: mockSubmissions.filter(s => s.decision_at !== null).length, fill: "#10b981" },
  { name: "Bound",      value: mockSubmissions.filter(s => s.status === "accepted").length, fill: "#059669" },
];

const tooltipStyle = { background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#94a3b8" };

type Period = "7d" | "14d" | "30d";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [activeKpi, setActiveKpi] = useState<"volume" | "gwp">("gwp");

  const sliceMap: Record<Period, number> = { "7d": 7, "14d": 14, "30d": 30 };
  const slicedData = chartData.slice(-sliceMap[period]);
  const slicedLoss = lossData.slice(-sliceMap[period]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance overview — Lloyd&apos;s MGA dashboard</p>
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

      {/* Volume + GWP main chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Submission volume &amp; GWP</h2>
            <p className="text-xs text-slate-600 mt-0.5">Last {period}</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            {[["gwp", "GWP (£K)"], ["volume", "Volume"]] .map(([k, label]) => (
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
              <Area type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={1.5} fill="url(#acc)" name="Accepted" />
              <Area type="monotone" dataKey="referred" stroke="#f59e0b" strokeWidth={1.5} fill="url(#ref)" name="Referred" />
              <Area type="monotone" dataKey="declined" stroke="#ef4444" strokeWidth={1.5} fill="url(#dec)" name="Declined" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Row 2: Loss ratio + Funnel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Loss ratio */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={13} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-white">Loss ratio tracker</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#fcd34d" }}>
              Target: 60%
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

        {/* Conversion funnel */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={13} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-white">Conversion funnel</h2>
          </div>
          <div className="space-y-2">
            {funnelData.map((step, i) => {
              const pct = Math.round((step.value / funnelData[0].value) * 100);
              const drop = i > 0 ? Math.round(((funnelData[i-1].value - step.value) / funnelData[i-1].value) * 100) : null;
              return (
                <div key={step.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{step.name}</span>
                    <div className="flex items-center gap-2">
                      {drop !== null && drop > 0 && (
                        <span className="text-[10px] text-slate-700">−{drop}%</span>
                      )}
                      <span className="text-xs font-semibold text-slate-300 tabular-nums">{step.value}</span>
                    </div>
                  </div>
                  <div className="w-full h-5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full rounded flex items-center px-2 transition-all" style={{ width: `${pct}%`, background: step.fill + "40", border: `1px solid ${step.fill}40` }}>
                      <span className="text-[10px] font-medium" style={{ color: step.fill }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Coverage breakdown + class pie + broker matrix */}
      <div className="grid grid-cols-3 gap-4">
        {/* By coverage type (stacked bar) */}
        <div className="col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">By coverage type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={coverageData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10, color: "#64748b" }} />
              <Bar dataKey="accepted" stackId="a" fill="#10b981" name="Accepted" radius={[0,0,0,0]} />
              <Bar dataKey="referred" stackId="a" fill="#f59e0b" name="Referred" />
              <Bar dataKey="declined" stackId="a" fill="#ef4444" radius={[3,3,0,0]} name="Declined" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Class of business donut */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Class of business</h2>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={classPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                  dataKey="value" paddingAngle={2}>
                  {classPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
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

      {/* Broker performance matrix */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold text-white">Broker performance matrix</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Broker", "Submissions", "Accepted", "Declined", "Referred", "GWP", "Avg score", "Bind rate"].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockBrokerStats.map((b, i) => (
              <tr key={b.company} className="hover:bg-white/[0.02] transition-colors"
                style={i !== mockBrokerStats.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                <td className="td font-semibold text-slate-200">{b.company}</td>
                <td className="td text-slate-400">{b.submissions}</td>
                <td className="td"><span className="text-emerald-400 font-medium">{b.accepted}</span></td>
                <td className="td"><span className="text-red-400 font-medium">{b.declined}</span></td>
                <td className="td"><span className="text-amber-400 font-medium">{b.referred}</span></td>
                <td className="td font-medium text-slate-300">£{b.gwp.toLocaleString("en-GB")}</td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${b.avgScore}%`, background: b.avgScore >= 70 ? "#10b981" : b.avgScore >= 50 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-slate-400">{b.avgScore}</span>
                  </div>
                </td>
                <td className="td">
                  <span className="text-xs font-semibold" style={{ color: b.bindRate >= 70 ? "#10b981" : b.bindRate >= 40 ? "#f59e0b" : "#ef4444" }}>
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
        <h2 className="text-sm font-semibold text-white mb-5">Decision breakdown — all time</h2>
        <div className="space-y-4">
          {[
            { label: "Accepted",   count: mockSubmissions.filter(s=>s.status==="accepted").length,   color: "#10b981" },
            { label: "Referred",   count: mockSubmissions.filter(s=>s.status==="referred").length,   color: "#f59e0b" },
            { label: "Declined",   count: mockSubmissions.filter(s=>s.status==="declined").length,   color: "#ef4444" },
            { label: "Processing", count: mockSubmissions.filter(s=>s.status==="processing").length, color: "#3b82f6" },
          ].map(({ label, count, color }) => {
            const pct = Math.round((count / mockSubmissions.length) * 100);
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
