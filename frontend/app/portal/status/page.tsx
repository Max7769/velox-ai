"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Zap, Search, CheckCircle, Clock, AlertCircle, XCircle, ChevronRight, FileText, Shield, ArrowRight } from "lucide-react";
import { getSubmissions } from "@/lib/db";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";

function StatusIcon({ status }: { status: SubmissionStatus | "not_found" }) {
  if (status === "accepted")   return <CheckCircle size={32} className="text-emerald-400" />;
  if (status === "declined")   return <XCircle size={32} className="text-red-400" />;
  if (status === "referred")   return <AlertCircle size={32} className="text-purple-400" />;
  if (status === "processing") return <Clock size={32} className="text-amber-400" />;
  if (status === "pending")    return <Clock size={32} className="text-slate-400" />;
  return <Search size={32} className="text-slate-600" />;
}

function statusColor(s: SubmissionStatus) {
  if (s === "accepted")   return "#10b981";
  if (s === "declined")   return "#ef4444";
  if (s === "referred")   return "#a78bfa";
  return "#f59e0b";
}

function statusLabel(s: SubmissionStatus) {
  if (s === "accepted")   return "Accepted";
  if (s === "declined")   return "Declined";
  if (s === "referred")   return "Referred for review";
  if (s === "processing") return "Processing";
  return "Pending";
}

function statusMessage(s: SubmissionStatus) {
  if (s === "accepted")   return "Your submission has been accepted. An underwriter will contact you shortly to discuss binding.";
  if (s === "declined")   return "Unfortunately your submission falls outside our current appetite. Please contact your underwriter for alternatives.";
  if (s === "referred")   return "Your submission requires additional review by a senior underwriter. We'll be in touch within 24 hours.";
  if (s === "processing") return "Our AI is currently analysing your submission. This usually takes 5–8 minutes.";
  return "Your submission is in the queue and will be processed shortly.";
}

function Timeline({ sub }: { sub: Submission }) {
  const events: { label: string; time: string | null; done: boolean }[] = [
    { label: "Submission received",  time: sub.created_at,   done: true },
    { label: "AI extraction",        time: sub.processed_at, done: !!sub.processed_at },
    { label: "Risk scoring",         time: sub.processed_at, done: !!sub.processed_at && sub.status !== "pending" },
    { label: "Underwriter review",   time: sub.decision_at,  done: !!sub.decision_at },
    { label: "Decision issued",      time: sub.decision_at,  done: sub.status === "accepted" || sub.status === "declined" },
  ];

  return (
    <div className="space-y-0">
      {events.map((ev, i) => (
        <div key={ev.label} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: ev.done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${ev.done ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}` }}>
              {ev.done && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
            </div>
            {i < events.length - 1 && (
              <div className="w-px flex-1 my-1" style={{ background: ev.done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)", minHeight: 20 }} />
            )}
          </div>
          <div className="pb-4">
            <p className={`text-sm font-medium ${ev.done ? "text-slate-300" : "text-slate-600"}`}>{ev.label}</p>
            {ev.done && ev.time && (
              <p className="text-xs text-slate-600 mt-0.5">
                {formatDistanceToNow(parseISO(ev.time), { addSuffix: true })}
              </p>
            )}
            {!ev.done && <p className="text-xs text-slate-700 mt-0.5">Pending</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PortalStatusPage() {
  const params = useSearchParams();
  const [ref, setRef] = useState(params?.get("ref") ?? "");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<Submission | null | "not_found">(null);

  const search = async (query = ref) => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const all = await getSubmissions();
      const found = all.find(s =>
        s.id.toLowerCase() === query.trim().toLowerCase() ||
        (s.extracted_data?.insured_name ?? "").toLowerCase().includes(query.trim().toLowerCase()) ||
        s.broker_email.toLowerCase() === query.trim().toLowerCase()
      );
      setResult(found ?? "not_found");
    } finally {
      setLoading(false);
    }
  };

  // auto-search if ref param in URL
  useEffect(() => {
    const r = params?.get("ref");
    if (r) { setRef(r); search(r); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sub = result && result !== "not_found" ? result : null;

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
        <span className="text-sm text-slate-500">Submission status</span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/portal/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            My submissions
          </Link>
          <Link href="/portal" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            New submission →
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-16 pb-24 px-4">
        <div className="w-full max-w-lg">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)" }}>
              <Search size={20} style={{ color: "var(--brand)" }} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Track your submission</h1>
            <p className="text-sm text-slate-400">Enter your reference number, insured name, or email address</p>
          </div>

          {/* Search */}
          <div className="flex gap-2 mb-8">
            <input
              value={ref}
              onChange={e => setRef(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="VLX-0041 · Company Ltd · broker@firm.com"
              className="flex-1 input-dark text-sm"
            />
            <button onClick={() => search()} disabled={!ref.trim() || loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background: "var(--brand)" }}>
              {loading ? "…" : "Search"}
            </button>
          </div>

          {/* Result */}
          {!searched && (
            <div className="rounded-2xl p-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm text-slate-600">Enter a reference number or insured name above to look up a submission.</p>
              <div className="flex items-center justify-center gap-6 mt-4">
                {[
                  { icon: Shield, label: "Secure lookup" },
                  { icon: FileText, label: "Real-time status" },
                  { icon: Clock, label: "Full timeline" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-xs text-slate-700">
                    <Icon size={16} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {searched && !loading && result === "not_found" && (
            <div className="rounded-2xl p-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <Search size={28} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300 mb-1">No submission found</p>
              <p className="text-xs text-slate-600">Check your reference number or contact your broker for the correct ID.</p>
            </div>
          )}

          {sub && (
            <div className="space-y-4">
              {/* Status card */}
              <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: `1px solid ${statusColor(sub.status)}22` }}>
                <div className="flex items-start gap-4 mb-4">
                  <StatusIcon status={sub.status} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-lg font-bold text-white">{sub.extracted_data?.insured_name ?? sub.id}</span>
                    </div>
                    <p className="text-xs text-slate-500">{sub.id} · {sub.extracted_data?.coverage_type ?? "Submission"}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: `${statusColor(sub.status)}18`, color: statusColor(sub.status), border: `1px solid ${statusColor(sub.status)}33` }}>
                      {statusLabel(sub.status)}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl px-4 py-3 text-sm text-slate-400"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  {statusMessage(sub.status)}
                </div>
              </div>

              {/* Details */}
              {sub.extracted_data && (
                <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Submission details</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {[
                      ["Coverage type",   sub.extracted_data.coverage_type],
                      ["Coverage limit",  sub.extracted_data.coverage_limit],
                      ["Effective date",  sub.extracted_data.effective_date],
                      ["Jurisdiction",    sub.extracted_data.jurisdiction],
                      ["Submitted by",    sub.broker_name],
                      ["Broker company",  sub.broker_company],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-[10px] text-slate-600">{label}</p>
                        <p className="text-xs text-slate-300 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                  {sub.score !== null && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Risk score</span>
                        <span className="text-sm font-bold" style={{ color: sub.score >= 70 ? "#10b981" : sub.score >= 50 ? "#f59e0b" : "#ef4444" }}>
                          {sub.score} / 100
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Processing timeline</p>
                <Timeline sub={sub} />
              </div>

              {/* Next steps */}
              {(sub.status === "accepted" || sub.status === "referred") && (
                <div className="rounded-2xl p-5" style={{ background: "rgba(79,110,247,0.05)", border: "1px solid rgba(79,110,247,0.15)" }}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Next steps</p>
                  <p className="text-sm text-slate-400 mb-3">
                    {sub.status === "accepted"
                      ? "Your underwriter will reach out to discuss binding terms. You may also request a call directly."
                      : "A senior underwriter is reviewing additional factors. We aim to provide a decision within 24 hours."}
                  </p>
                  <a href={`mailto:${sub.broker_email}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: "var(--brand)" }}>
                    Contact your broker <ArrowRight size={12} />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
