"use client";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Shield, AlertTriangle, Building, Calendar, DollarSign } from "lucide-react";

const mockData: Record<string, object> = {
  "VLX-0041": {
    id: "VLX-0041",
    status: "accepted",
    broker: "Aon UK",
    brokerEmail: "submissions@aon.co.uk",
    submittedAt: "25 May 2026, 09:12",
    processedAt: "25 May 2026, 09:20",
    extracted: {
      insured_name: "Harwick Shipping Ltd",
      coverage_type: "Marine Cargo",
      coverage_limit: "£5,000,000",
      premium_estimate: "£42,000",
      industry: "Shipping & Logistics",
      effective_date: "01 June 2026",
      loss_history: "No claims in the past 5 years. One minor incident in 2019, settled below excess.",
      risk_factors: ["High-value cargo routes through Suez Canal", "Refrigerated goods requiring temperature monitoring"],
      confidence_score: 0.94,
    },
    score: 82,
  },
};

const fallback = {
  id: "VLX-0040",
  status: "referred",
  broker: "Howden",
  brokerEmail: "submissions@howden.com",
  submittedAt: "25 May 2026, 08:51",
  processedAt: "25 May 2026, 09:01",
  extracted: {
    insured_name: "Nexus Tech Partners",
    coverage_type: "Cyber Liability",
    coverage_limit: "£10,000,000",
    premium_estimate: "£95,000",
    industry: "Technology",
    effective_date: "15 June 2026",
    loss_history: "One cyber claim in 2023 for £180,000 following a phishing attack.",
    risk_factors: ["Prior cyber claim", "Large employee headcount with remote access", "SaaS platform with third-party integrations", "No cyber insurance for 18 months prior"],
    confidence_score: 0.88,
  },
  score: 61,
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  accepted: { label: "Accepted", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  declined: { label: "Declined", icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
  referred: { label: "Referred for review", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  processing: { label: "Processing…", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const sub = (mockData[id] ?? fallback) as typeof fallback;
  const { extracted } = sub;
  const status = statusConfig[sub.status];
  const Icon = status.icon;

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400">{sub.id}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400">Submitted {sub.submittedAt}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{extracted.insured_name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{extracted.coverage_type} · {sub.broker}</p>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status.bg}`}>
          <Icon size={16} className={status.color} />
          <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Risk score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 col-span-1">
          <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5"><Shield size={12} /> Risk score</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">{sub.score}</span>
            <span className="text-slate-400 text-sm pb-1">/100</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${sub.score >= 70 ? "bg-emerald-500" : sub.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${sub.score}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            AI confidence: {Math.round(extracted.confidence_score * 100)}%
          </p>
        </div>

        {/* Key fields */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 col-span-2 grid grid-cols-2 gap-4">
          {[
            { icon: DollarSign, label: "Coverage limit", value: extracted.coverage_limit },
            { icon: DollarSign, label: "Est. premium", value: extracted.premium_estimate },
            { icon: Building, label: "Industry", value: extracted.industry },
            { icon: Calendar, label: "Effective date", value: extracted.effective_date },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <f.icon size={11} /> {f.label}
              </p>
              <p className="text-sm font-semibold text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk factors */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" /> Risk factors identified
        </h3>
        <div className="space-y-2">
          {extracted.risk_factors.map((rf: string) => (
            <div key={rf} className="flex items-start gap-2.5 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              {rf}
            </div>
          ))}
        </div>
      </div>

      {/* Loss history */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Loss history</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{extracted.loss_history}</p>
      </div>

      {/* Actions */}
      {sub.status === "referred" && (
        <div className="flex gap-3">
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <CheckCircle size={15} /> Accept submission
          </button>
          <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <XCircle size={15} /> Decline
          </button>
        </div>
      )}
    </div>
  );
}
