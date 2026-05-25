export function RiskScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-700">—</span>;
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const textColor = score >= 70 ? "#6ee7b7" : score >= 50 ? "#fcd34d" : "#fca5a5";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color: textColor }}>{score}</span>
    </div>
  );
}
