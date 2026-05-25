"use client";
import { mockSubmissions } from "@/lib/mock-data";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import { Globe, Shield, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

const tooltipStyle = { background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#94a3b8" };

/* ── derived data ─────────────────────────────────────────────────── */
// Aggregate limit by class
const limitByClass = mockSubmissions.reduce<Record<string, { limit: number; count: number; gwp: number }>>((acc, s) => {
  if (!s.extracted_data) return acc;
  const cls = s.extracted_data.coverage_type ?? "Unknown";
  if (!acc[cls]) acc[cls] = { limit: 0, count: 0, gwp: 0 };
  acc[cls].count++;
  const limitStr = (s.extracted_data.coverage_limit ?? "").replace(/[£$€,]/g, "").replace("M", "000000").replace("K", "000");
  acc[cls].limit += parseFloat(limitStr) || 0;
  acc[cls].gwp   += s.extracted_data.premium_model?.mid ?? 0;
  return acc;
}, {});

const limitData = Object.entries(limitByClass)
  .map(([name, v]) => ({
    name: name.split(" ").slice(0, 2).join(" "),
    limitM: parseFloat((v.limit / 1_000_000).toFixed(1)),
    count: v.count,
    gwp: Math.round(v.gwp / 1000),
  }))
  .sort((a, b) => b.limitM - a.limitM);

// Geographic exposure
const geoExposure: { region: string; count: number; limitM: number; color: string }[] = [
  { region: "England & Wales", count: 5, limitM: 57, color: "#4f6ef7" },
  { region: "Scotland",        count: 1, limitM:  2, color: "#6366f1" },
  { region: "Norway",          count: 1, limitM:  8, color: "#8b5cf6" },
  { region: "Continental EU",  count: 0, limitM:  0, color: "#a78bfa" },
  { region: "North America",   count: 0, limitM:  0, color: "#c4b5fd" },
];

// Risk score scatter
const scatterData = mockSubmissions
  .filter(s => s.score !== null && s.extracted_data?.premium_model)
  .map(s => ({
    x: s.score!,
    y: s.extracted_data!.premium_model!.mid / 1000,
    z: parseFloat((s.extracted_data!.coverage_limit ?? "0").replace(/[£$€,M]/g, "")) || 5,
    name: s.extracted_data?.insured_name,
    status: s.status,
  }));

// Radar — risk profile by class
const radarData = [
  { subject: "Marine",    risk: 62, appetite: 70 },
  { subject: "Cyber",     risk: 55, appetite: 65 },
  { subject: "D&O",       risk: 78, appetite: 75 },
  { subject: "Property",  risk: 85, appetite: 80 },
  { subject: "Crime",     risk: 58, appetite: 60 },
  { subject: "PI",        risk: 70, appetite: 72 },
];

// Aggregate totals
const totalLimitM = limitData.reduce((a, d) => a + d.limitM, 0);
const totalGWPK   = limitData.reduce((a, d) => a + d.gwp, 0);
const maxRiskClass = limitData.sort((a, b) => b.limitM - a.limitM)[0]?.name ?? "—";
const avgRisk     = Math.round(mockSubmissions.filter(s => s.score).reduce((a, s) => a + (s.score ?? 0), 0) / mockSubmissions.filter(s => s.score).length);

export default function ExposurePage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Portfolio Exposure</h1>
        <p className="text-sm text-slate-500 mt-0.5">Aggregate limit, geographic spread, and risk concentration.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total aggregate limit",  value: `£${totalLimitM.toFixed(0)}M`,  icon: Shield,    color: "#4f6ef7", sub: "Across all bound risks" },
          { label: "Total GWP",             value: `£${totalGWPK}K`,               icon: DollarSign, color: "#10b981", sub: "Mid-point estimates"    },
          { label: "Largest concentration",  value: maxRiskClass,                   icon: AlertTriangle, color: "#f59e0b", sub: "By aggregate limit"  },
          { label: "Portfolio avg score",    value: String(avgRisk),                icon: TrendingUp, color: "#6366f1", sub: "Risk quality index"     },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-500 font-medium">{m.label}</span>
              <m.icon size={12} style={{ color: m.color, opacity: 0.7 }} />
            </div>
            <p className="text-xl font-bold text-white mb-0.5">{m.value}</p>
            <p className="text-[10px] text-slate-600">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Aggregate limit by class */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Aggregate limit by class (£M)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={limitData} layout="vertical" margin={{ top: 0, right: 20, left: 50, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} tickFormatter={v => `£${v}M`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`£${v}M`, "Aggregate limit"]} />
              <Bar dataKey="limitM" radius={[0, 4, 4, 0]}>
                {limitData.map((_, i) => (
                  <rect key={i} fill={`hsl(${220 + i * 20}, 70%, ${55 - i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk profile radar */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Risk quality vs. appetite</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
              <Radar name="Portfolio risk" dataKey="risk"    stroke="#4f6ef7" fill="#4f6ef7" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Appetite"       dataKey="appetite" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 justify-center mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block" /> Portfolio</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Appetite</span>
          </div>
        </div>
      </div>

      {/* Geographic exposure */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={13} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-white">Geographic exposure</h2>
        </div>
        <div className="space-y-3">
          {geoExposure.map(g => {
            const pct = totalLimitM > 0 ? (g.limitM / totalLimitM) * 100 : 0;
            return (
              <div key={g.region}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                    <span className="text-sm text-slate-300">{g.region}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{g.count} risk{g.count !== 1 ? "s" : ""}</span>
                    <span className="font-semibold text-slate-300 w-12 text-right">£{g.limitM}M</span>
                    <span className="w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk / Premium scatter */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-1">Risk score vs. premium (£K)</h2>
        <p className="text-xs text-slate-600 mb-4">Bubble size = coverage limit. Accepted risks in green, declined in red.</p>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis type="number" dataKey="x" name="Risk score" domain={[0, 100]} tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} label={{ value: "Risk score", position: "insideBottom", offset: -5, fontSize: 10, fill: "#475569" }} />
            <YAxis type="number" dataKey="y" name="Premium (£K)" tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} tickFormatter={v => `£${v}K`} />
            <ZAxis type="number" dataKey="z" range={[40, 200]} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ ...tooltipStyle, padding: "8px 12px" }}>
                    <p className="font-semibold text-slate-200 text-xs">{d.name}</p>
                    <p className="text-slate-400 text-xs">Score: {d.x} · Premium: £{d.y}K</p>
                  </div>
                );
              }}
            />
            <Scatter data={scatterData.filter(d => d.status === "accepted")} fill="#10b981" fillOpacity={0.7} />
            <Scatter data={scatterData.filter(d => d.status === "declined")} fill="#ef4444" fillOpacity={0.7} />
            <Scatter data={scatterData.filter(d => d.status === "referred")} fill="#f59e0b" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Limit table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold text-white">Exposure table — by class</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Class of business", "Risks", "Agg. limit (£M)", "GWP (£K)", "% of portfolio", "Avg risk score"].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {limitData.map((row, i) => {
              const pct = (row.limitM / totalLimitM * 100).toFixed(1);
              const avgScore = Math.round(
                mockSubmissions
                  .filter(s => s.extracted_data?.coverage_type?.startsWith(row.name.split(" ")[0]) && s.score)
                  .reduce((a, s) => a + (s.score ?? 0), 0) /
                Math.max(1, mockSubmissions.filter(s => s.extracted_data?.coverage_type?.startsWith(row.name.split(" ")[0]) && s.score).length)
              );
              return (
                <tr key={row.name} className="hover:bg-white/[0.02] transition-colors"
                  style={i !== limitData.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                  <td className="td font-medium text-slate-200">{row.name}</td>
                  <td className="td text-slate-400">{row.count}</td>
                  <td className="td font-semibold text-slate-200">£{row.limitM}M</td>
                  <td className="td text-slate-400">£{row.gwp}K</td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  </td>
                  <td className="td">
                    <span className="text-xs font-semibold" style={{ color: avgScore >= 70 ? "#10b981" : avgScore >= 50 ? "#f59e0b" : "#ef4444" }}>
                      {avgScore || "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
