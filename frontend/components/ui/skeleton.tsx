import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-100", className)} />;
}

export function SubmissionRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      {[60, 120, 90, 70, 60, 50, 50].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className={`h-3.5 w-${w > 100 ? "full" : `[${w}px]`}`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export function MetricSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-2.5 w-10" />
    </div>
  );
}
