"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { mockSubmissions, mockAudit } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import {
  Upload, Clock, CheckCircle, TrendingUp, ArrowUpRight,
  FileText, Zap, Activity, Building2
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

const accepted  = mockSubmissions.filter(s => s.status === "accepted").length;
const referred  = mockSubmissions.filter(s => s.status === "referred").length;
const processed = mockSubmissions.filter(s => s.status !== "processing").length;
const bindRate  = Math.round((accepted / processed) * 100);

const metrics = [
  { label: "Submissions today", value: "24",        delta: "+12%",  positive: true,  icon: FileText    },
  { label: "Avg processing time", value: "8.4 min", delta: "−23%",  positive: true,  icon: Clock       },
  { label: "Bind rate",          value: `${bindRate}%`, delta: "+4pp", positive: true, icon: CheckCircle },
  { label: "Monthly volume",     value: "312",       delta: "+18%",  positive: true,  icon: TrendingUp  },
];

// Broker leaderboard derived from mock data
const brokerMap = mockSubmissions.reduce<Record<string, { company: string; count: number; accepted: number }>>((acc, s) => {
  const key = s.broker_company;
  if (!acc[key]) acc[key] = { company: key, count: 0, accepted: 0 };
  acc[key].count++;
  if (s.status === "accepted") acc[key].accepted++;
  return acc;
}, {});
const leaderboard = Object.values(brokerMap)
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

// Activity feed from audit log
const activityFeed = [...mockAudit].reverse().slice(0, 6);

// Processing queue
const processingQueue = mockSubmissions.filter(s => s.status === "processing");

function Greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  const recent = mockSubmissions.slice(0, 5);

  // Simulated auto-refresh every 30s (updates relative timestamps)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white"><Greeting />, Max</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {referred > 0
              ? <><span className="text-amber-400 font-medium">{referred}</span> submission{referred > 1 ? "s" : ""} awaiting your decision.</>
              : "Your queue is clear."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {processingQueue.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300">{processingQueue.length} processing</span>
            </div>
          )}
          <Link href="/dashboard/upload"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: "var(--brand)" }}>
            <Upload size={14} /> New submission
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">{m.label}</span>
              <m.icon size={14} className="text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{m.value}</p>
            <span className={`text-xs font-medium ${m.positive ? "text-emerald-500" : "text-red-400"}`}>{m.delta}</span>
            <span className="text-xs text-slate-600 ml-1">vs last month</span>
          </div>
        ))}
      </div>

      {/* Referred — needs decision */}
      {referred > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.05)" }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-amber-400">Needs your decision ({referred})</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["ID", "Insured", "Type", "Broker", "Score", "Submitted"].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockSubmissions.filter(s => s.status === "referred").map((s, i, arr) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors"
                  style={i !== arr.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                  <td className="td">
                    <Link href={`/dashboard/submissions/${s.id}`} className="font-mono text-xs font-medium" style={{ color: "var(--brand)" }}>
                      {s.id}
                    </Link>
                  </td>
                  <td className="td font-medium text-white">{s.extracted_data?.insured_name}</td>
                  <td className="td text-slate-400">{s.extracted_data?.coverage_type}</td>
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

      {/* Bottom row: recent submissions + sidebar widgets */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent submissions — takes 2 cols */}
        <div className="col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-sm font-semibold text-white">Recent submissions</span>
            <Link href="/dashboard/submissions" className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: "var(--brand)" }}>
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["ID", "Insured", "Coverage", "Score", "Status"].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((s, i) => (
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
              <span className="text-sm font-semibold text-white">Top brokers</span>
            </div>
            <div className="space-y-3">
              {leaderboard.map((b, i) => {
                const rate = Math.round((b.accepted / b.count) * 100);
                return (
                  <div key={b.company}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-700 w-3 tabular-nums">{i + 1}</span>
                        <span className="text-xs text-slate-300 font-medium">{b.company}</span>
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums">{b.count} · <span className="text-emerald-500">{rate}%</span></span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(b.count / leaderboard[0].count) * 100}%`, background: "var(--brand)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={13} className="text-slate-500" />
              <span className="text-sm font-semibold text-white">Activity</span>
            </div>
            <div className="space-y-3">
              {activityFeed.map(entry => (
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
          </div>

          {/* AI status */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-emerald-400" />
              <span className="text-sm font-semibold text-white">AI engine</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
              </span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Model",     value: "claude-sonnet-4-6" },
                { label: "Avg conf.", value: "91.5%"             },
                { label: "Processed", value: `${processed} docs` },
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
