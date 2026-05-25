"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mockSubmissions } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { RiskScore } from "@/components/ui/risk-score";
import { Search, CheckSquare, Square, Minus, CheckCircle, XCircle, ArrowRight, X } from "lucide-react";
import type { SubmissionStatus } from "@/lib/types";
import { toast } from "sonner";

const statuses: (SubmissionStatus | "all")[] = ["all", "accepted", "referred", "processing", "declined"];

export default function SubmissionsPage() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<SubmissionStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cursor, setCursor]     = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  const allSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));
  const someSelected = filtered.some(s => selected.has(s.id));
  const selectedCount = filtered.filter(s => selected.has(s.id)).length;

  const toggleOne = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.delete(s.id)); return n; });
    else setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.add(s.id)); return n; });
  };

  const clearSelection = () => setSelected(new Set());

  const bulkAction = useCallback((action: "accept" | "decline") => {
    const ids = filtered.filter(s => selected.has(s.id)).map(s => s.id);
    const verb = action === "accept" ? "Accepted" : "Declined";
    toast.success(`${verb} ${ids.length} submission${ids.length > 1 ? "s" : ""}`, {
      description: ids.join(", "),
    });
    clearSelection();
  }, [filtered, selected]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "j") { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === "k") { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && filtered[cursor]) router.push(`/dashboard/submissions/${filtered[cursor].id}`);
      if (e.key === "x" && filtered[cursor]) toggleOne(filtered[cursor].id);
      if (e.key === "Escape") { clearSelection(); setSearch(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, cursor, router]);

  useEffect(() => { setCursor(0); }, [search, filter]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Submissions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{mockSubmissions.length} total · {filtered.length} shown</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <Search size={13} className="text-slate-500" />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search… (press /)"
              className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none w-44" />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400">
                <X size={12} />
              </button>
            )}
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

      {/* Bulk action bar */}
      {someSelected && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)" }}
        >
          <span className="text-sm font-medium text-indigo-300">{selectedCount} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => bulkAction("accept")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#10b981" }}
            >
              <CheckCircle size={12} /> Accept all
            </button>
            <button
              onClick={() => bulkAction("decline")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#ef4444" }}
            >
              <XCircle size={12} /> Decline all
            </button>
          </div>
          <button onClick={clearSelection} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors">
            <X size={14} />
          </button>
          <span className="text-[10px] text-slate-600 hidden md:block">Press X to toggle row · ESC to clear</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="th w-10">
                <button onClick={toggleAll} className="text-slate-500 hover:text-slate-300 transition-colors">
                  {allSelected ? <CheckSquare size={14} className="text-indigo-400" /> : someSelected ? <Minus size={14} className="text-indigo-400" /> : <Square size={14} />}
                </button>
              </th>
              {["ID", "Insured", "Coverage type", "Broker", "Date", "Risk score", "Status", ""].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-slate-600 text-sm">No submissions match your search.</td>
              </tr>
            ) : filtered.map((s, i) => {
              const isSelected = selected.has(s.id);
              const isCursor   = i === cursor;
              return (
                <tr key={s.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  style={{
                    borderBottom: i !== filtered.length - 1 ? "1px solid var(--border)" : undefined,
                    background: isSelected ? "rgba(79,110,247,0.08)" : isCursor ? "rgba(255,255,255,0.015)" : undefined,
                    outline: isCursor ? "1px solid rgba(79,110,247,0.2)" : undefined,
                  }}
                  onClick={() => toggleOne(s.id)}
                  onDoubleClick={() => router.push(`/dashboard/submissions/${s.id}`)}
                >
                  <td className="td w-10" onClick={e => { e.stopPropagation(); toggleOne(s.id); }}>
                    {isSelected ? <CheckSquare size={14} className="text-indigo-400" /> : <Square size={14} className="text-slate-700" />}
                  </td>
                  <td className="td">
                    <Link href={`/dashboard/submissions/${s.id}`} className="font-mono text-xs font-medium"
                      style={{ color: "var(--brand)" }} onClick={e => e.stopPropagation()}>
                      {s.id}
                    </Link>
                  </td>
                  <td className="td font-medium text-slate-200">{s.extracted_data?.insured_name ?? "—"}</td>
                  <td className="td text-slate-400">{s.extracted_data?.coverage_type ?? "—"}</td>
                  <td className="td text-slate-400">{s.broker_company}</td>
                  <td className="td text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="td"><RiskScore score={s.score} /></td>
                  <td className="td"><StatusBadge status={s.status} /></td>
                  <td className="td">
                    <Link href={`/dashboard/submissions/${s.id}`} className="text-slate-600 hover:text-slate-300 transition-colors"
                      onClick={e => e.stopPropagation()}>
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Keyboard shortcut hint */}
      {!someSelected && (
        <p className="text-[11px] text-slate-700 text-right">
          <span className="mr-3"><kbd className="font-mono">j/k</kbd> navigate</span>
          <span className="mr-3"><kbd className="font-mono">↵</kbd> open</span>
          <span className="mr-3"><kbd className="font-mono">x</kbd> select</span>
          <span><kbd className="font-mono">/</kbd> search</span>
        </p>
      )}
    </div>
  );
}
