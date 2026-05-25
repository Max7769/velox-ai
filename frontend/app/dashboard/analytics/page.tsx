"use client";
import { mockAnalytics, mockSubmissions } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

const coverageBreakdown = mockSubmissions.reduce<Record<string, { accepted: number; declined: number; referred: number }>>((acc, s) => {
  const t = s.extracted_data?.coverage_type ?? "Unknown";
  if (!acc[t]) acc[t] = { accepted: 0, declined: 0, referred: 0 };
  if (s.status === "accepted") acc[t].accepted++;
  else if (s.status === "declined") acc[t].declined++;
  else if (s.status === "referred") acc[t].referred++;
  return acc;
}, {});

const coverageData = Object.entries(coverageBreakdown).map(([name, v]) => ({ name, ...v }));
const bindRate = Math.round((mockSubmissions.filter(s => s.status === "accepted").length / mockSubmissions.filter(s => s.status !== "processing").length) * 100);
const totalVolume = mockAnalytics.reduce((a, d) => a + d.total, 0);
const pending = mockSubmissions.filter(s => s.status === "referred").length;

const kpis = [
  { label: "30-day volume", value: String(totalVolume), sub: "+18% vs prior period", icon: TrendingUp },
  { label: "Avg processing time", value: "8.4 min", sub: "−23% vs prior period", icon: Clock },
  { label: "Bind rate", value: `${bindRate}%`, sub: "Accepted submissions", icon: CheckCircle },
  { label: "Pending review", value: String(pending), sub: "Referred submissions", icon: AlertCircle },
];

const chartData = mockAnalytics.map(d => ({ ...d, date: format(parseISO(d.date), "dd MMM") }));

const tooltipStyle = { background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#94a3b8" };

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">30-day performance overview.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {kpis.map(m => (
          <div key={m.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">{m.label}</span>
              <m.icon size={13} className="text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{m.value}</p>
            <p className="text-xs text-slate-600">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Volume chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-5">Submission volume — last 30 days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              {[["acc","#10b981"],["ref","#f59e0b"],["dec","#ef4444"]].map(([id, c]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#64748b" }} />
            <Area type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={1.5} fill="url(#acc)" name="Accepted" />
            <Area type="monotone" dataKey="referred"  stroke="#f59e0b" strokeWidth={1.5} fill="url(#ref)" name="Referred" />
            <Area type="monotone" dataKey="declined"  stroke="#ef4444" strokeWidth={1.5} fill="url(#dec)" name="Declined" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">By coverage type</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={coverageData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="accepted" stackId="a" fill="#10b981" name="Accepted" />
              <Bar dataKey="referred"  stackId="a" fill="#f59e0b" name="Referred" />
              <Bar dataKey="declined"  stackId="a" fill="#ef4444" radius={[3,3,0,0]} name="Declined" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-5">Decision breakdown</h2>
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
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
