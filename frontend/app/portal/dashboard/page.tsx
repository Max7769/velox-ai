"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Zap, Search, ChevronRight, Upload, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Clock, FileText,
} from "lucide-react";
import { getSubmissions } from "@/lib/db";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";

function statusColor(s: SubmissionStatus) {
  if (s === "accepted")   return "#10b981";
  if (s === "declined")   return "#ef4444";
  if (s === "referred")   return "#a78bfa";
  return "#f59e0b";
}

function StatusIcon({ status }: { status: SubmissionStatus }) {
  if (status === "accepted")   return <CheckCircle size={14} style={{ color: statusColor(status) }} />;
  if (status === "declined")   return <XCircle size={14} style={{ color: statusColor(status) }} />;
  if (status === "referred")   return <AlertCircle size={14} style={{ color: statusColor(status) }} />;
  return <Clock size={14} style={{ color: statusColor(status) }} />;
}

function statusLabel(s: SubmissionStatus) {
  if (s === "accepted")   return "Accepted";
  if (s === "declined")   return "Declined";
  if (s === "referred")   return "Referred for review";
  if (s === "processing") return "Processing";
  return "Pending";
}

export default function PortalDashboardPage() {
  const params = useSearchParams();
  const [email, setEmail]     = useState(params?.get("email") ?? "");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [subs, setSubs]         = useState<Submission[]>([]);
  const [filter, setFilter]     = useState<"all" | SubmissionStatus>("all");

  const search = useCallback(async (query?: string) => {
    const q = (query ?? email).trim().toLowerCase();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const all = await getSubmissions();
      setSubs(all.filter(s => s.broker_email.toLowerCase() === q));
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    const e = params?.get("email");
    if (e) { setEmail(e); search(e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = {
    all:        subs.length,
    processing: subs.filter(s => s.status === "processing").length,
    referred:   subs.filter(s => s.status === "referred").length,
    accepted:   subs.filter(s => s.status === "accepted").length,
    declined:   subs.filter(s => s.status === "declined").length,
  };

  const shown = filter === "all" ? subs : subs.filter(s => s.status === filter);
  const sorted = [...shown].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header className="h-14 flex items-center px-6" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
        <Link href="/portal" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={11} className="text-white" fill="white" />
          </div>
          <span className="text-sm font-semibold text-white">Velox AI</span>
        </Link>
        <ChevronRight size={13} className="text-slate-700 mx-2" />
        <span className="text-sm text-slate-500">My submissions</span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/portal/status" className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
            <Search size={12} /> Track a single submission
          </Link>
          <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--brand)" }}>
            <Upload size={12} /> New submission
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 pt-12 pb-24">
        <div className="w-full max-w-3xl mx-auto">
          {/* Title + lookup */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)" }}>
              <FileText size={20} style={{ color: "var(--brand)" }} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">My submissions</h1>
            <p className="text-sm text-slate-400">Enter the email address you used when submitting to see every risk you&apos;ve sent us, in one place.</p>
          </div>

          <div className="flex gap-2 mb-8 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="j.smith@broker.co.uk"
              className="flex-1 input-dark text-sm"
            />
            <button onClick={() => search()} disabled={!email.trim() || loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background: "var(--brand)" }}>
              {loading ? <RefreshCw size={14} className="animate-spin" /> : "Search"}
            </button>
          </div>

          {!searched && (
            <div className="rounded-2xl p-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm text-slate-600">Enter your email above to see all your submissions and their current status.</p>
            </div>
          )}

          {searched && !loading && subs.length === 0 && (
            <div className="rounded-2xl p-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <Search size={28} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300 mb-1">No submissions found for this email</p>
              <p className="text-xs text-slate-600">Double check the address you used, or submit your first risk to get started.</p>
            </div>
          )}

          {searched && !loading && subs.length > 0 && (
            <>
              {/* Status filter pills */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {([
                  { key: "all" as const,        label: "All",      count: counts.all },
                  { key: "processing" as const, label: "Processing", count: counts.processing },
                  { key: "referred" as const,   label: "Referred",   count: counts.referred },
                  { key: "accepted" as const,   label: "Accepted",   count: counts.accepted },
                  { key: "declined" as const,   label: "Declined",   count: counts.declined },
                ]).map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={filter === f.key
                      ? { background: "rgba(79,110,247,0.15)", color: "#818cf8", border: "1px solid rgba(79,110,247,0.3)" }
                      : { background: "rgba(255,255,255,0.02)", color: "#64748b", border: "1px solid var(--border)" }}>
                    {f.label}
                    <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Submission list */}
              <div className="space-y-2">
                {sorted.map(s => (
                  <Link key={s.id} href={`/portal/status?ref=${s.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white/[0.02]"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <StatusIcon status={s.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.extracted_data?.insured_name ?? s.id}</p>
                      <p className="text-xs text-slate-600 truncate">
                        {s.id} · {s.extracted_data?.coverage_type ?? "Submission"} ·{" "}
                        {formatDistanceToNow(parseISO(s.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {s.score !== null && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ color: s.score >= 70 ? "#10b981" : s.score >= 50 ? "#f59e0b" : "#ef4444",
                                 background: s.score >= 70 ? "rgba(16,185,129,0.1)" : s.score >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)" }}>
                        {s.score}
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                      style={{ color: statusColor(s.status), background: `${statusColor(s.status)}18`, border: `1px solid ${statusColor(s.status)}33` }}>
                      {statusLabel(s.status)}
                    </span>
                    <ChevronRight size={14} className="text-slate-700 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
