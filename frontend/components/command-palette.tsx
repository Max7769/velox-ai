"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mockSubmissions } from "@/lib/mock-data";
import {
  LayoutDashboard, Upload, FileText, BarChart2, Settings,
  Search, ArrowRight, ChevronRight, Zap, Hash, User, Globe
} from "lucide-react";

type Item = {
  id: string;
  type: "page" | "submission" | "action";
  label: string;
  sub?: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  keywords?: string;
};

const pages: Item[] = [
  { id: "dash",     type: "page", label: "Dashboard",      sub: "Overview & metrics",      icon: LayoutDashboard, href: "/dashboard" },
  { id: "upload",   type: "page", label: "New Submission",  sub: "Upload a document",       icon: Upload,          href: "/dashboard/upload" },
  { id: "subs",     type: "page", label: "Submissions",     sub: "All submissions",         icon: FileText,        href: "/dashboard/submissions" },
  { id: "analytics",type: "page", label: "Analytics",       sub: "30-day performance",      icon: BarChart2,       href: "/dashboard/analytics" },
  { id: "exposure", type: "page", label: "Exposure",        sub: "Portfolio & aggregate limits", icon: Globe,       href: "/dashboard/exposure" },
  { id: "settings", type: "page", label: "Settings",        sub: "Team, appetite, integrations, API", icon: Settings, href: "/dashboard/settings" },
  { id: "portal",   type: "page", label: "Broker Portal",   sub: "External submission form", icon: Zap,            href: "/portal" },
];

function score2color(s: number | null) {
  if (s === null) return "#475569";
  return s >= 70 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const submissionItems: Item[] = mockSubmissions.map(s => ({
    id: s.id,
    type: "submission",
    label: s.extracted_data?.insured_name ?? s.id,
    sub: `${s.id} · ${s.extracted_data?.coverage_type ?? "Processing"} · ${s.status}`,
    icon: Hash,
    href: `/dashboard/submissions/${s.id}`,
    keywords: `${s.broker_name} ${s.broker_company} ${s.id}`,
  }));

  const allItems = [...pages, ...submissionItems];

  const filtered = query.trim()
    ? allItems.filter(item => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.sub?.toLowerCase().includes(q) ||
          item.keywords?.toLowerCase().includes(q)
        );
      })
    : pages;

  const navigate = useCallback((item: Item) => {
    setOpen(false);
    setQuery("");
    if (item.href) router.push(item.href);
    else item.action?.();
  }, [router]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setCursor(0);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && filtered[cursor]) navigate(filtered[cursor]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, cursor, filtered, navigate]);

  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const groupedPages = filtered.filter(i => i.type === "page");
  const groupedSubs  = filtered.filter(i => i.type === "submission");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) { setOpen(false); setQuery(""); } }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Search size={15} className="text-slate-600 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search submissions, pages…"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
          <kbd className="text-[10px] text-slate-700 px-1.5 py-0.5 rounded border border-slate-800 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="text-xs text-slate-600 px-4 py-3">No results for &ldquo;{query}&rdquo;</p>
          )}

          {groupedPages.length > 0 && (
            <>
              {query && <p className="text-[10px] font-semibold text-slate-700 px-4 pb-1 uppercase tracking-wider">Pages</p>}
              {groupedPages.map((item, i) => {
                const globalIdx = filtered.indexOf(item);
                const Icon = item.icon;
                return (
                  <button key={item.id} onMouseEnter={() => setCursor(globalIdx)} onClick={() => navigate(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ background: globalIdx === cursor ? "rgba(79,110,247,0.12)" : "transparent" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: globalIdx === cursor ? "rgba(79,110,247,0.2)" : "rgba(255,255,255,0.04)" }}>
                      <Icon size={13} className={globalIdx === cursor ? "text-indigo-400" : "text-slate-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${globalIdx === cursor ? "text-white" : "text-slate-300"}`}>{item.label}</p>
                      {item.sub && <p className="text-xs text-slate-600 truncate">{item.sub}</p>}
                    </div>
                    {globalIdx === cursor && <ChevronRight size={13} className="text-slate-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </>
          )}

          {groupedSubs.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-slate-700 px-4 pt-3 pb-1 uppercase tracking-wider">Submissions</p>
              {groupedSubs.map((item) => {
                const globalIdx = filtered.indexOf(item);
                const sub = mockSubmissions.find(s => s.id === item.id)!;
                return (
                  <button key={item.id} onMouseEnter={() => setCursor(globalIdx)} onClick={() => navigate(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ background: globalIdx === cursor ? "rgba(79,110,247,0.12)" : "transparent" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: globalIdx === cursor ? "rgba(79,110,247,0.2)" : "rgba(255,255,255,0.04)" }}>
                      <User size={13} className={globalIdx === cursor ? "text-indigo-400" : "text-slate-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${globalIdx === cursor ? "text-white" : "text-slate-300"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{item.sub}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.score !== null && (
                        <span className="text-xs font-semibold tabular-nums" style={{ color: score2color(sub.score) }}>
                          {sub.score}
                        </span>
                      )}
                      {globalIdx === cursor && <ArrowRight size={13} className="text-slate-600" />}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[10px] text-slate-700">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-800 font-mono text-slate-600">{key}</kbd>
              {label}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-700">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-800 font-mono text-slate-600">⌘K</kbd> to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
