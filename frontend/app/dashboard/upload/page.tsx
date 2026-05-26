"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { persistSubmissionAction } from "@/lib/actions";

type Stage = "idle" | "uploading" | "extracting" | "done" | "error";

const stages = [
  { key: "uploading",  label: "Reading document" },
  { key: "extracting", label: "AI extracting risk data" },
  { key: "done",       label: "Extraction complete" },
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(f.type)) { setError("Please upload a PDF, Word document, or text file."); return; }
    setFile(f); setError("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setStage("uploading"); setError("");
    try {
      const fd = new FormData(); fd.append("file", file);
      await new Promise(r => setTimeout(r, 700));
      setStage("extracting");
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Extraction failed"); }
      const data = await res.json();
      // Persist extracted data to DB (or mock store in demo mode)
      const saved = await persistSubmissionAction(data, file.name);
      setStage("done");
      toast.success("Submission processed", { description: `${data.insured_name ?? "Document"} extracted successfully` });
      setTimeout(() => router.push(`/dashboard/submissions/${saved.id}`), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStage("error");
      toast.error("Extraction failed");
    }
  };

  const processing = stage === "uploading" || stage === "extracting";
  const stageIdx = stages.findIndex(s => s.key === stage);

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">New submission</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload a submission document and AI will extract all risk data in seconds.</p>
      </div>

      {/* Drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className="relative rounded-xl p-10 text-center transition-all mb-4 cursor-pointer"
        style={{
          border: `2px dashed ${drag ? "var(--brand)" : file ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`,
          background: drag ? "rgba(79,110,247,0.05)" : file ? "rgba(16,185,129,0.03)" : "rgba(255,255,255,0.02)",
        }}>
        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={processing} />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileText size={36} className="text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            {!processing && (
              <button onClick={e => { e.stopPropagation(); setFile(null); setStage("idle"); }}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors">
                <X size={11} /> Remove
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(79,110,247,0.1)" }}>
              <Upload size={22} style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Drop submission document here</p>
              <p className="text-xs text-slate-600 mt-1">PDF, Word, or TXT · up to 20MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg mb-4 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Processing stages */}
      {(processing || stage === "done") && (
        <div className="card p-4 mb-4 space-y-3">
          {stages.map((s, i) => {
            const done = i < stageIdx || stage === "done";
            const active = s.key === stage;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? "bg-emerald-500" : active ? "" : "bg-white/5"
                }`} style={active ? { background: "var(--brand)" } : undefined}>
                  {done ? <CheckCircle size={12} className="text-white" /> : active ? <Loader2 size={12} className="text-white animate-spin" /> : null}
                </div>
                <span className={`text-sm ${done || active ? "text-slate-200" : "text-slate-600"} ${active ? "font-medium" : ""}`}>
                  {s.label}{active ? "…" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit */}
      {!processing && stage !== "done" && (
        <button onClick={handleSubmit} disabled={!file}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "var(--brand)" }}>
          Extract submission data
        </button>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 rounded-xl text-xs text-slate-600 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
        <p className="text-slate-500 font-medium mb-2">Tips for best results</p>
        <p>· Use original broker submissions, not scanned copies where possible</p>
        <p>· PDFs with selectable text extract faster than image-based PDFs</p>
        <p>· Include loss history and financials in the same document for higher accuracy</p>
      </div>
    </div>
  );
}
