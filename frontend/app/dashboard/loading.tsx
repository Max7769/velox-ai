export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-5 animate-pulse">
      <div className="h-5 w-32 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="h-3 w-20 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="h-7 w-16 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="h-2 w-24 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        ))}
      </div>
      <div className="card p-5 space-y-3">
        <div className="h-4 w-40 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="h-48 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />
      </div>
    </div>
  );
}
