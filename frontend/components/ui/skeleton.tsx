import React from "react";

function Skeleton({ className = "", width, height, style }: {
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ width, height: height ?? 16, background: "rgba(255,255,255,0.06)", ...style }}
    />
  );
}

/* Legacy light-theme exports kept for backwards compat ─ now dark */
export function SubmissionRowSkeleton() {
  return (
    <tr>
      {[60, 120, 90, 70, 60, 50, 50].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton height={13} width={w} />
        </td>
      ))}
    </tr>
  );
}

export function MetricSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton height={10} width={96} className="mb-4" />
      <Skeleton height={28} width={64} className="mb-2" />
      <Skeleton height={10} width={48} />
    </div>
  );
}

/* New composable skeleton primitives */
export function SkeletonLine({ width = "100%", height = 14 }: { width?: string | number; height?: number }) {
  return <Skeleton width={width} height={height} />;
}

export function SkeletonCard({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <Skeleton width="40%" height={12} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} width={i === rows - 1 ? "60%" : "100%"} height={14} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 px-4 py-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${Math.floor(100 / cols)}%`} height={10} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={`${Math.floor(100 / cols)}%`} height={12} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-4 ${className}`}>
      <Skeleton width="50%" height={10} className="mb-3" />
      <Skeleton width="35%" height={28} className="mb-2" />
      <Skeleton width="55%" height={10} />
    </div>
  );
}

export function SkeletonChart({ height = 180, className = "" }: { height?: number; className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      <Skeleton width="45%" height={12} className="mb-4" />
      <Skeleton width="100%" height={height} className="rounded-xl" />
    </div>
  );
}

export { Skeleton };
