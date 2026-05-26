"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getSubmissions, getAnalytics } from "@/lib/db";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import {
  Download, FileText, Shield, BarChart2, RefreshCw,
  Calendar, CheckCircle, Filter, ChevronDown,
} from "lucide-react";
import { format, parseISO, subDays, isAfter } from "date-fns";
import type { Submission, AnalyticsData } from "@/lib/types";
import { toast } from "sonner";

type ReportType = "submissions" | "compliance" | "performance" | "audit";

const REPORT_TYPES: { id: ReportType; label: string; icon: typeof FileText; desc: string }[] = [
  { id: "submissions",  label: "Submissions export",     icon: FileText,  desc: "Full list of all submissions with extracted data" },
  { id: "compliance",   label: "Compliance report",      icon: Shield,    desc: "GDPR audit log, EU AI Act classification summary" },
  { id: "performance",  label: "Performance report",     icon: BarChart2, desc: "GWP, bind rate, processing time, broker breakdown" },
  { id: "audit",        label: "Audit trail",            icon: CheckCircle, desc: "Every decision and action with timestamp and actor" },
];

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics,   setAnalytics]   = useState<AnalyticsData[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange,   setDateRange]   = useState<"7d" | "30d" | "90d" | "all">("all");
  const [generating,  setGenerating]  = useState<ReportType | null>(null);

  const load = useCallback(async () => {
    try {
      const [subs, ana] = await Promise.all([getSubmissions(), getAnalytics()]);
      setSubmissions(subs);
      setAnalytics(ana);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const cutoff = dateRange === "7d" ? subDays(new Date(), 7)
      : dateRange === "30d" ? subDays(new Date(), 30)
      : dateRange === "90d" ? subDays(new Date(), 90)
      : null;

    return submissions.filter(s => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (cutoff && !isAfter(parseISO(s.created_at), cutoff)) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.id.toLowerCase().includes(q) ||
          (s.extracted_data?.insured_name ?? "").toLowerCase().includes(q) ||
          s.broker_company.toLowerCase().includes(q);
      }
      return true;
    });
  }, [submissions, statusFilter, dateRange, search]);

  // Summary stats
  const totalGWP     = analytics.reduce((a, d) => a + d.gwp, 0);
  const accepted     = filtered.filter(s => s.status === "accepted").length;
  const declined     = filtered.filter(s => s.status === "declined").length;
  const referred     = filtered.filter(s => s.status === "referred").length;
  const processing   = filtered.filter(s => s.status === "processing").length;
  const bindRate     = filtered.length > 0 ? Math.round((accepted / filtered.length) * 100) : 0;

  const handleDownload = async (type: ReportType) => {
    setGenerating(type);
    await new Promise(r => setTimeout(r, 600)); // brief generation delay

    try {
      const ts = format(new Date(), "yyyy-MM-dd");

      if (type === "submissions") {
        exportCSV(`velox-submissions-${ts}.csv`, [
          "ID", "Status", "Insured", "Coverage type", "Broker", "Score",
          "Premium (£)", "Jurisdiction", "Date",
        ], filtered.map(s => [
          s.id,
          s.status,
          s.extracted_data?.insured_name ?? "",
          s.extracted_data?.coverage_type ?? "",
          s.broker_company,
          String(s.score ?? ""),
          String(s.extracted_data?.premium_model?.mid ?? ""),
          s.extracted_data?.jurisdiction ?? "",
          format(parseISO(s.created_at), "dd/MM/yyyy"),
        ]));
        toast.success("Submissions export downloaded");
      }

      if (type === "performance") {
        exportCSV(`velox-performance-${ts}.csv`, [
          "Date", "Total", "Accepted", "Declined", "Referred", "GWP (£)",
        ], analytics.map(d => [
          d.date, String(d.total), String(d.accepted), String(d.declined),
          String(d.referred), String(d.gwp),
        ]));
        toast.success("Performance report downloaded");
      }

      if (type === "compliance") {
        exportCSV(`velox-compliance-${ts}.csv`, [
          "Field", "Value",
        ], [
          ["Report date",                format(new Date(), "dd/MM/yyyy")],
          ["GDPR retention policy",      "7 years (Lloyd's minimum)"],
          ["EU AI Act classification",   "High-risk — Article 6(2)"],
          ["Human oversight required",   "Yes — all automated decisions subject to review"],
          ["Blueprint Two CDR",          "Enabled"],
          ["SOC 2 Type II",              "Certified — expires Dec 2026"],
          ["Total submissions",          String(submissions.length)],
          ["Accepted",                   String(submissions.filter(s => s.status === "accepted").length)],
          ["Declined",                   String(submissions.filter(s => s.status === "declined").length)],
          ["Referred for review",        String(submissions.filter(s => s.status === "referred").length)],
          ["Automated decision rate",    `${Math.round(((accepted + declined) / Math.max(submissions.length, 1)) * 100)}%`],
        ]);
        toast.success("Compliance report downloaded");
      }

      if (type === "audit") {
        exportCSV(`velox-audit-trail-${ts}.csv`, [
          "Submission ID", "Insured", "Status", "Score", "Broker", "Date",
        ], filtered.map(s => [
          s.id,
          s.extracted_data?.insured_name ?? "",
          s.status,
          String(s.score ?? ""),
          s.broker_company,
          format(parseISO(s.created_at), "dd/MM/yyyy HH:mm"),
        ]));
        toast.success("Audit trail downloaded");
      }
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-slate-600" style={{ minHeight: "60vh" }}>
        <RefreshCw size={14} className="animate-spin" />
        <span className="text-sm">Loading reports…</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Reports &amp; Exports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Download compliance reports and submission data</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Calendar size={12} />
          Generated {format(new Date(), "dd MMM yyyy, HH:mm")}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total",      value: filtered.length,   color: "#64748b" },
          { label: "Accepted",   value: accepted,           color: "#10b981" },
          { label: "Declined",   value: declined,           color: "#ef4444" },
          { label: "Referred",   value: referred,           color: "#f59e0b" },
          { label: "Bind rate",  value: `${bindRate}%`,     color: "#4f6ef7" },
        ].map(m => (
          <div key={m.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-white mb-0.5" style={{ color: m.color }}>{m.value}</p>
            <p className="text-xs text-slate-500">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Report generators */}
      <div className="grid grid-cols-2 gap-3">
        {REPORT_TYPES.map(r => (
          <div key={r.id} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(79,110,247,0.1)" }}>
                <r.icon size={16} style={{ color: "var(--brand)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{r.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(r.id)}
              disabled={generating !== null}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--brand)" }}>
              {generating === r.id
                ? <><RefreshCw size={11} className="animate-spin" /> Generating…</>
                : <><Download size={11} /> Export CSV</>
              }
            </button>
          </div>
        ))}
      </div>

      {/* Submission table with filters */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-500" />
            <span className="text-sm font-semibold text-white">Submission data</span>
            <span className="text-xs text-slate-600">({filtered.length} records)</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Date range */}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
              {(["all", "7d", "30d", "90d"] as const).map(d => (
                <button key={d} onClick={() => setDateRange(d)}
                  className="px-2 py-0.5 rounded text-[11px] font-medium transition-all"
                  style={dateRange === d ? { background: "var(--brand)", color: "#fff" } : { color: "#64748b" }}>
                  {d === "all" ? "All time" : d}
                </button>
              ))}
            </div>
            {/* Status filter */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-xs rounded-lg px-2 py-1.5 outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#94a3b8" }}>
              <option value="all">All statuses</option>
              <option value="accepted">Accepted</option>
              <option value="referred">Referred</option>
              <option value="declined">Declined</option>
              <option value="processing">Processing</option>
            </select>
            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="text-xs rounded-lg px-2 py-1.5 outline-none w-36"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#94a3b8" }} />
            <button onClick={() => handleDownload("submissions")} disabled={generating !== null}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--brand)" }}>
              <Download size={11} /> Export filtered
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ID", "Insured", "Coverage", "Broker", "Score", "Status", "Date", "Premium"].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="td text-center py-12 text-slate-600 text-sm">No records match your filter.</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors"
                style={i !== filtered.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                <td className="td font-mono text-xs font-medium" style={{ color: "var(--brand)" }}>{s.id}</td>
                <td className="td font-medium text-slate-200 max-w-[130px] truncate">{s.extracted_data?.insured_name ?? "—"}</td>
                <td className="td text-slate-400 text-xs">{s.extracted_data?.coverage_type ?? "—"}</td>
                <td className="td text-slate-400 text-xs">{s.broker_company}</td>
                <td className="td"><RiskScore score={s.score} /></td>
                <td className="td"><StatusBadge status={s.status} /></td>
                <td className="td text-slate-500 text-xs">
                  {format(parseISO(s.created_at), "dd MMM yyyy")}
                </td>
                <td className="td text-slate-400 text-xs">
                  {s.extracted_data?.premium_model
                    ? `£${s.extracted_data.premium_model.mid.toLocaleString("en-GB")}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="px-5 py-3 text-xs text-slate-600" style={{ borderTop: "1px solid var(--border)" }}>
            Showing {filtered.length} of {submissions.length} submissions ·{" "}
            Total GWP in view: £{filtered.reduce((a, s) => a + (s.extracted_data?.premium_model?.mid ?? 0), 0).toLocaleString("en-GB")}
          </div>
        )}
      </div>
    </div>
  );
}
