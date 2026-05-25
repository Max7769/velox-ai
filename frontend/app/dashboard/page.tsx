import Link from "next/link";
import { Upload, Clock, CheckCircle, TrendingUp, ArrowUpRight } from "lucide-react";

const metrics = [
  { label: "Submissions today", value: "24", change: "+12%", icon: Upload, color: "text-brand-500" },
  { label: "Avg processing time", value: "8 min", change: "-23%", icon: Clock, color: "text-emerald-500" },
  { label: "Acceptance rate", value: "67%", change: "+4%", icon: CheckCircle, color: "text-emerald-500" },
  { label: "Monthly volume", value: "312", change: "+18%", icon: TrendingUp, color: "text-brand-500" },
];

const recentSubmissions = [
  { id: "VLX-0041", insured: "Harwick Shipping Ltd", type: "Marine Cargo", broker: "Aon UK", status: "accepted", time: "2 min ago", score: 82 },
  { id: "VLX-0040", insured: "Nexus Tech Partners", type: "Cyber Liability", broker: "Howden", status: "referred", time: "18 min ago", score: 61 },
  { id: "VLX-0039", insured: "Albion Construction Group", type: "Professional Indemnity", broker: "Marsh", status: "processing", time: "34 min ago", score: null },
  { id: "VLX-0038", insured: "Fairlane Logistics", type: "Marine Cargo", broker: "WTW", status: "declined", time: "1 hr ago", score: 29 },
  { id: "VLX-0037", insured: "Summit Healthcare", type: "D&O Liability", broker: "Aon UK", status: "accepted", time: "2 hr ago", score: 78 },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  declined: { label: "Declined", className: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  referred: { label: "Referred", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  processing: { label: "Processing…", className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
};

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Good morning, Max</h1>
          <p className="text-sm text-slate-500 mt-0.5">Here&apos;s what&apos;s happening in your queue today.</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Upload size={15} />
          New submission
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">{m.label}</span>
              <m.icon size={16} className={m.color} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-slate-900">{m.value}</span>
              <span className="text-xs text-emerald-600 font-medium pb-0.5">{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submissions table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent submissions</h2>
          <Link href="/dashboard/submissions" className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["ID", "Insured", "Coverage type", "Broker", "Risk score", "Status", "Time"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentSubmissions.map((s, i) => (
              <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${i !== recentSubmissions.length - 1 ? "border-b border-slate-100" : ""}`}>
                <td className="px-5 py-3.5">
                  <Link href={`/dashboard/submissions/${s.id}`} className="text-xs font-mono text-brand-500 hover:text-brand-600 font-medium">
                    {s.id}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-900 font-medium">{s.insured}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{s.type}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{s.broker}</td>
                <td className="px-5 py-3.5">
                  {s.score !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.score >= 70 ? "bg-emerald-500" : s.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 font-medium">{s.score}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusConfig[s.status].className}`}>
                    {statusConfig[s.status].label}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
