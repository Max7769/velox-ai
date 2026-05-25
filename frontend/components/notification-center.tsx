"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

type Notif = {
  id: string;
  type: "accepted" | "declined" | "referred" | "processing";
  title: string;
  body: string;
  href: string;
  at: string;
  read: boolean;
};

const initial: Notif[] = [
  { id: "1", type: "accepted",   title: "Submission accepted",     body: "Harwick Shipping Ltd · VLX-0041",    href: "/dashboard/submissions/VLX-0041", at: "2026-05-25T09:35:00Z", read: false },
  { id: "2", type: "referred",   title: "Referred for review",     body: "Nexus Tech Partners · VLX-0040",    href: "/dashboard/submissions/VLX-0040", at: "2026-05-25T09:01:00Z", read: false },
  { id: "3", type: "processing", title: "New submission received",  body: "Albion PI · VLX-0039 — processing", href: "/dashboard/submissions/VLX-0039", at: "2026-05-25T08:34:00Z", read: true  },
  { id: "4", type: "declined",   title: "Submission declined",     body: "Fairlane Logistics · VLX-0038",     href: "/dashboard/submissions/VLX-0038", at: "2026-05-24T16:45:00Z", read: true  },
  { id: "5", type: "referred",   title: "Referred for review",     body: "Apex Financial Group · VLX-0034",   href: "/dashboard/submissions/VLX-0034", at: "2026-05-22T09:14:00Z", read: true  },
];

const iconMap = {
  accepted:   { Icon: CheckCircle, color: "#10b981" },
  declined:   { Icon: X,           color: "#ef4444" },
  referred:   { Icon: AlertCircle, color: "#f59e0b" },
  processing: { Icon: Clock,       color: "#3b82f6" },
};

export function NotificationCenter() {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id: string) => setNotifs(n => n.filter(x => x.id !== id));

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "var(--brand)" }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-80 rounded-2xl shadow-2xl overflow-hidden z-40"
          style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifs.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-8">No notifications</p>
            )}
            {notifs.map(n => {
              const { Icon, color } = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 group transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: n.read ? "transparent" : "rgba(79,110,247,0.04)" }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${color}18` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${n.read ? "text-slate-400" : "text-white"}`}>{n.title}</p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-slate-700 mt-1">
                      {formatDistanceToNow(parseISO(n.at), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(n.id)}
                    className="text-slate-700 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <a href="/dashboard/submissions" className="block text-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1">
              View all submissions →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
