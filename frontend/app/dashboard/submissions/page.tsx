"use client";
import Link from "next/link";
import { useState } from "react";
import { mockSubmissions } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import { Search } from "lucide-react";
import type { SubmissionStatus } from "@/lib/types";

const statuses: (SubmissionStatus | "all")[] = ["all", "accepted", "referred", "processing", "declined"];

export default function SubmissionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SubmissionStatus | "all">("all");

  const filtered = mockSubmissions.filter(s => {
    const matchStatus = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.id.toLowerCase().includes(q) ||
      (s.extracted_data?.insured_name ?? "").toLowerCase().includes(q) ||
      s.broker_company.toLowerCase().includes(q) ||
      (s.extracted_data?.coverage_type ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Submissions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{mockSubmissions.length} total</p>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <Search size={13} className="text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions…"
              className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none w-44" />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  filter === s ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
                style={filter === s ? { background: "var(--brand)" } : undefined}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ID", "Insured", "Coverage type", "Broker", "Date", "Risk score", "Status"].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-600 text-sm">No submissions match your search.</td>
              </tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                style={i !== filtered.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                <td className="td">
                  <Link href={`/dashboard/submissions/${s.id}`} className="font-mono text-xs font-medium" style={{ color: "var(--brand)" }}>
                    {s.id}
                  </Link>
                </td>
                <td className="td font-medium text-slate-200">{s.extracted_data?.insured_name ?? "—"}</td>
                <td className="td text-slate-400">{s.extracted_data?.coverage_type ?? "—"}</td>
                <td className="td text-slate-400">{s.broker_company}</td>
                <td className="td text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="td"><RiskScore score={s.score} /></td>
                <td className="td"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
