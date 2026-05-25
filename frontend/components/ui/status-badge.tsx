import type { SubmissionStatus } from "@/lib/types";

const config: Record<SubmissionStatus, { label: string; dot?: boolean; style: React.CSSProperties }> = {
  pending:    { label: "Pending",     style: { background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" } },
  processing: { label: "Processing",  dot: true, style: { background: "rgba(59,130,246,0.1)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" } },
  accepted:   { label: "Accepted",    style: { background: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.2)" } },
  declined:   { label: "Declined",    style: { background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" } },
  referred:   { label: "Referred",    style: { background: "rgba(245,158,11,0.1)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.2)" } },
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { label, dot, style } = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium" style={style}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
      {label}
    </span>
  );
}
