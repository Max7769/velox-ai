import Link from "next/link";
import { mockSubmissions } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import { Upload, Clock, CheckCircle, TrendingUp, ArrowUpRight, FileText } from "lucide-react";

const accepted = mockSubmissions.filter(s => s.status === "accepted").length;
const referred  = mockSubmissions.filter(s => s.status === "referred").length;
const total     = mockSubmissions.filter(s => s.status !== "processing").length;
const bindRate  = Math.round((accepted / total) * 100);

const metrics = [
  { label: "Submissions today", value: "24", delta: "+12%", positive: true, icon: FileText },
  { label: "Avg processing time", value: "8.4 min", delta: "−23%", positive: true, icon: Clock },
  { label: "Bind rate", value: `${bindRate}%`, delta: "+4pp", positive: true, icon: CheckCircle },
  { label: "Monthly volume", value: "312", delta: "+18%", positive: true, icon: TrendingUp },
];

export default function Dashboard() {
  const recent = mockSubmissions.slice(0, 6);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Good morning, Max</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {referred > 0 ? `${referred} submission${referred > 1 ? "s" : ""} awaiting your decision.` : "Your queue is clear."}
          </p>
        </div>
        <Link href="/dashboard/upload"
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all"
          style={{ background: "var(--brand)" }}>
          <Upload size={14} /> New submission
        </Link>
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
                  <td className="td text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent submissions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="text-sm font-semibold text-white">Recent submissions</span>
          <Link href="/dashboard/submissions" className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: "var(--brand)" }}>
            View all <ArrowUpRight size={11} />
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ID", "Insured", "Coverage type", "Broker", "Risk score", "Status", "Time"].map(h => (
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
                <td className="td font-medium text-slate-200">{s.extracted_data?.insured_name ?? "—"}</td>
                <td className="td text-slate-400">{s.extracted_data?.coverage_type ?? "—"}</td>
                <td className="td text-slate-400">{s.broker_company}</td>
                <td className="td"><RiskScore score={s.score} /></td>
                <td className="td"><StatusBadge status={s.status} /></td>
                <td className="td text-slate-500 text-xs">
                  {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
