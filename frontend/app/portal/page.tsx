"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, Shield, Lock } from "lucide-react";
import { toast } from "sonner";

const coverageTypes = [
  "Marine Cargo", "Cyber Liability", "D&O Liability", "Professional Indemnity",
  "Property", "Crime", "Marine Hull", "Aviation", "Energy", "Other",
];

export default function PortalPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    brokerName: "", brokerEmail: "", brokerCompany: "",
    insuredName: "", coverageType: "", notes: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.brokerName && form.brokerEmail && form.brokerCompany && form.insuredName && form.coverageType && file;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1800));
      const ref = `VLX-${Date.now().toString().slice(-4)}`;
      router.push(`/portal/success?ref=${ref}&insured=${encodeURIComponent(form.insuredName)}`);
    } catch {
      toast.error("Submission failed. Please try again or email us directly.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Submit a risk</h1>
        <p className="text-sm text-slate-400">Upload your submission document and we&apos;ll get back to you within 8 minutes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Broker info */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Your name</label>
              <input value={form.brokerName} onChange={e => set("brokerName", e.target.value)}
                placeholder="James Smith" className="input-dark" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Email address</label>
              <input type="email" value={form.brokerEmail} onChange={e => set("brokerEmail", e.target.value)}
                placeholder="j.smith@broker.co.uk" className="input-dark" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Broker company</label>
            <input value={form.brokerCompany} onChange={e => set("brokerCompany", e.target.value)}
              placeholder="Aon UK, Marsh, Howden…" className="input-dark" required />
          </div>
        </div>

        {/* Risk info */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Risk details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Insured name</label>
              <input value={form.insuredName} onChange={e => set("insuredName", e.target.value)}
                placeholder="Company Ltd" className="input-dark" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Coverage type</label>
              <select value={form.coverageType} onChange={e => set("coverageType", e.target.value)}
                className="input-dark" required>
                <option value="">Select…</option>
                {coverageTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Additional notes (optional)</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Any context you'd like the underwriter to know…" rows={2}
              className="input-dark resize-none" />
          </div>
        </div>

        {/* Document upload */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Submission document</p>
          <div onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            className="relative rounded-xl p-6 text-center transition-all"
            style={{
              border: `2px dashed ${drag ? "var(--brand)" : file ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
              background: drag ? "rgba(79,110,247,0.05)" : "rgba(255,255,255,0.02)",
            }}>
            <input type="file" accept=".pdf,.doc,.docx,.txt"
              onChange={e => e.target.files?.[0] && setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={submitting} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={18} className="text-emerald-500" />
                <span className="text-sm text-slate-300 font-medium">{file.name}</span>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-slate-600 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={20} className="text-slate-600" />
                <p className="text-sm text-slate-500">Drop document or <span style={{ color: "var(--brand)" }}>browse</span></p>
                <p className="text-xs text-slate-700">PDF, Word, TXT · max 20MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={!valid || submitting}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "var(--brand)" }}>
          {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : "Submit for review"}
        </button>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 pt-1">
          {[
            { icon: Shield, label: "SOC 2 Type II" },
            { icon: Lock, label: "256-bit encrypted" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-600">
              <Icon size={12} /> {label}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
