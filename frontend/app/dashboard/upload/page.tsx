"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";

type Stage = "idle" | "uploading" | "extracting" | "done" | "error";

const stages = [
  { key: "uploading", label: "Reading document…" },
  { key: "extracting", label: "AI extracting risk data…" },
  { key: "done", label: "Extraction complete" },
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [resultId, setResultId] = useState("");

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(f.type)) {
      setError("Please upload a PDF, Word document, or text file.");
      return;
    }
    setFile(f);
    setError("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStage("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      await new Promise((r) => setTimeout(r, 800));
      setStage("extracting");

      const res = await fetch("/api/extract", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Extraction failed");
      }

      const data = await res.json();
      setResultId(data.id);
      setStage("done");

      setTimeout(() => router.push(`/dashboard/submissions/${data.id}`), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  };

  const processing = stage === "uploading" || stage === "extracting";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">New submission</h1>
        <p className="text-sm text-slate-500 mt-1">Upload a submission document and AI will extract the risk data automatically.</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
          drag ? "border-brand-500 bg-brand-50" : file ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={onInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={processing}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileText size={36} className="text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            {!processing && (
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={36} className="text-slate-300" />
            <div>
              <p className="text-sm font-medium text-slate-700">Drop your submission here</p>
              <p className="text-xs text-slate-400 mt-0.5">PDF, Word, or TXT — up to 20MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
      )}

      {/* Processing stages */}
      {processing || stage === "done" ? (
        <div className="mt-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          {stages.map((s) => {
            const stageIndex = stages.findIndex((x) => x.key === stage);
            const thisIndex = stages.findIndex((x) => x.key === s.key);
            const done = thisIndex < stageIndex || stage === "done";
            const active = s.key === stage;

            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? "bg-emerald-500" : active ? "bg-brand-500" : "bg-slate-200"
                }`}>
                  {done ? (
                    <CheckCircle size={12} className="text-white" />
                  ) : active ? (
                    <Loader2 size={12} className="text-white animate-spin" />
                  ) : null}
                </div>
                <span className={`text-sm ${done || active ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Submit */}
      {!processing && stage !== "done" && (
        <button
          onClick={handleSubmit}
          disabled={!file}
          className="mt-5 w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-semibold transition-colors"
        >
          Extract submission data
        </button>
      )}
    </div>
  );
}
