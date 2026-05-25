import Link from "next/link";
import { Search, Filter } from "lucide-react";

const submissions = [
  { id: "VLX-0041", insured: "Harwick Shipping Ltd", type: "Marine Cargo", broker: "Aon UK", status: "accepted", date: "25 May 2026", score: 82 },
  { id: "VLX-0040", insured: "Nexus Tech Partners", type: "Cyber Liability", broker: "Howden", status: "referred", date: "25 May 2026", score: 61 },
  { id: "VLX-0039", insured: "Albion Construction Group", type: "Professional Indemnity", broker: "Marsh", status: "processing", date: "25 May 2026", score: null },
  { id: "VLX-0038", insured: "Fairlane Logistics", type: "Marine Cargo", broker: "WTW", status: "declined", date: "24 May 2026", score: 29 },
  { id: "VLX-0037", insured: "Summit Healthcare", type: "D&O Liability", broker: "Aon UK", status: "accepted", date: "24 May 2026", score: 78 },
  { id: "VLX-0036", insured: "Kestrel Energy", type: "Property", broker: "Marsh", status: "accepted", date: "23 May 2026", score: 85 },
  { id: "VLX-0035", insured: "Nordic Shipping AS", type: "Marine Cargo", broker: "Howden", status: "declined", date: "23 May 2026", score: 31 },
  { id: "VLX-0034", insured: "Apex Financial Group", type: "Crime", broker: "Aon UK", status: "referred", date: "22 May 2026", score: 55 },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  declined: { label: "Declined", className: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  referred: { label: "Referred", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  processing: { label: "Processing…", className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
};

export default function SubmissionsPage() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">All submissions</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-slate-400" />
            <input placeholder="Search…" className="text-sm outline-none w-40 text-slate-700 placeholder:text-slate-400" />
          </div>
          <button className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["ID", "Insured", "Coverage type", "Broker", "Date", "Risk score", "Status"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => (
              <tr key={s.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${i !== submissions.length - 1 ? "border-b border-slate-100" : ""}`}>
                <td className="px-5 py-4">
                  <Link href={`/dashboard/submissions/${s.id}`} className="text-xs font-mono text-brand-500 hover:text-brand-600 font-medium">
                    {s.id}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-slate-900 font-medium">{s.insured}</td>
                <td className="px-5 py-4 text-sm text-slate-500">{s.type}</td>
                <td className="px-5 py-4 text-sm text-slate-500">{s.broker}</td>
                <td className="px-5 py-4 text-xs text-slate-400">{s.date}</td>
                <td className="px-5 py-4">
                  {s.score !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.score >= 70 ? "bg-emerald-500" : s.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 font-medium">{s.score}</span>
                    </div>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusConfig[s.status].className}`}>
                    {statusConfig[s.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
