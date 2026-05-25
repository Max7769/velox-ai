"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Activity, X, CheckCircle, AlertCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type LiveEvent = {
  id: string;
  type: "received" | "extracted" | "accepted" | "declined" | "referred";
  insured: string;
  coverage: string;
  broker: string;
  score: number | null;
  href: string;
  at: Date;
};

const POOL: Omit<LiveEvent, "id" | "at">[] = [
  { type: "received",  insured: "Thornfield Logistics",      coverage: "Marine Cargo",     broker: "Aon UK",  score: null, href: "/dashboard/submissions/VLX-0041" },
  { type: "extracted", insured: "Pacific Rim Holdings",      coverage: "D&O Liability",    broker: "Marsh",   score: 74,   href: "/dashboard/submissions/VLX-0037" },
  { type: "accepted",  insured: "Kestrel Energy",            coverage: "Property",         broker: "Marsh",   score: 85,   href: "/dashboard/submissions/VLX-0036" },
  { type: "referred",  insured: "Nexus Tech Partners",       coverage: "Cyber Liability",  broker: "Howden",  score: 61,   href: "/dashboard/submissions/VLX-0040" },
  { type: "declined",  insured: "Fairlane Logistics",        coverage: "Marine Cargo",     broker: "WTW",     score: 29,   href: "/dashboard/submissions/VLX-0038" },
  { type: "received",  insured: "Meridian Capital Group",    coverage: "Crime",            broker: "Aon UK",  score: null, href: "/dashboard/submissions/VLX-0034" },
  { type: "accepted",  insured: "Summit Healthcare",         coverage: "D&O Liability",    broker: "Aon UK",  score: 78,   href: "/dashboard/submissions/VLX-0037" },
  { type: "extracted", insured: "Aurora Shipping AS",        coverage: "Marine Cargo",     broker: "Howden",  score: 68,   href: "/dashboard/submissions/VLX-0035" },
];

const typeConfig = {
  received:  { label: "Received",  Icon: Activity,     color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  extracted: { label: "Extracted", Icon: Clock,        color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  accepted:  { label: "Accepted",  Icon: CheckCircle,  color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  declined:  { label: "Declined",  Icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  referred:  { label: "Referred",  Icon: AlertCircle,  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
};

let _counter = 100;
function nextId() { return `live-${++_counter}`; }

export function LiveFeed() {
  const [open, setOpen]     = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const addEvent = () => {
    const template = POOL[Math.floor(Math.random() * POOL.length)];
    const ev: LiveEvent = { ...template, id: nextId(), at: new Date() };
    setEvents(prev => [ev, ...prev].slice(0, 20));
    if (!open) setUnread(u => u + 1);
    // schedule next
    timerRef.current = setTimeout(addEvent, 8000 + Math.random() * 12000);
  };

  useEffect(() => {
    // First event after 5s
    timerRef.current = setTimeout(addEvent, 5000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const toggle = () => {
    setOpen(o => !o);
    setUnread(0);
  };

  return (
    <div className="relative">
      <button onClick={toggle}
        className="relative flex items-center gap-1.5 p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
        <Activity size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#10b981" }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-2xl shadow-2xl z-40 overflow-hidden"
          style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-white">Live feed</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-400">
              <X size={13} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity size={20} className="text-slate-700 mb-2" />
                <p className="text-xs text-slate-600">Waiting for submissions…</p>
              </div>
            )}
            {events.map(ev => {
              const cfg = typeConfig[ev.type];
              const Icon = cfg.Icon;
              return (
                <button key={ev.id} onClick={() => { router.push(ev.href); setOpen(false); }}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: cfg.bg }}>
                    <Icon size={13} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                      {ev.score !== null && (
                        <span className="text-[10px] text-slate-700">· score {ev.score}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-200 truncate">{ev.insured}</p>
                    <p className="text-[10px] text-slate-600">{ev.coverage} · {ev.broker}</p>
                    <p className="text-[10px] text-slate-700 mt-0.5">
                      {formatDistanceToNow(ev.at, { addSuffix: true })}
                    </p>
                  </div>
                  <ChevronRight size={11} className="text-slate-700 flex-shrink-0 mt-1.5" />
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={() => { router.push("/dashboard/submissions"); setOpen(false); }}
              className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1">
              View all submissions →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
