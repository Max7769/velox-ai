"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { getSubmissions } from "@/lib/db";
import type { Submission } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

type NotifType = "accepted" | "declined" | "referred" | "processing";

type Notif = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  href: string;
  at: string;
  read: boolean;
};

const iconMap: Record<NotifType, { Icon: typeof CheckCircle; color: string }> = {
  accepted:   { Icon: CheckCircle, color: "#10b981" },
  declined:   { Icon: X,           color: "#ef4444" },
  referred:   { Icon: AlertCircle, color: "#f59e0b" },
  processing: { Icon: Clock,       color: "#3b82f6" },
};

function submissionToNotif(s: Submission, titleMap: Record<NotifType, string>): Notif {
  const type = (s.status === "pending" ? "processing" : s.status) as NotifType;
  return {
    id:    s.id,
    type,
    title: titleMap[type] ?? type,
    body:  `${s.extracted_data?.insured_name ?? s.broker_company} · ${s.id}`,
    href:  `/dashboard/submissions/${s.id}`,
    at:    s.processed_at ?? s.created_at,
    read:  false,
  };
}

export function NotificationCenter() {
  const { t } = useTranslation();
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const titleMap: Record<NotifType, string> = {
    accepted:   t("notif.accepted"),
    declined:   t("notif.declined"),
    referred:   t("notif.referred"),
    processing: t("notif.received"),
  };

  const load = useCallback(async () => {
    try {
      const subs = await getSubmissions();
      const recent = subs
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
        .map(s => submissionToNotif(s, titleMap));
      setNotifs(recent);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unread = notifs.filter(n => !readIds.has(n.id)).length;

  const markAll  = () => setReadIds(new Set(notifs.map(n => n.id)));
  const dismiss  = (id: string) => setNotifs(n => n.filter(x => x.id !== id));

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Mark all as read when panel opens
  useEffect(() => {
    if (open && notifs.length > 0) {
      setTimeout(() => setReadIds(new Set(notifs.map(n => n.id))), 2500);
    }
  }, [open, notifs]);

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
            <span className="text-sm font-semibold text-white">{t("notif.title")}</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
                {t("notif.markAll")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifs.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-8">{t("notif.empty")}</p>
            )}
            {notifs.map(n => {
              const { Icon, color } = iconMap[n.type] ?? iconMap.processing;
              const isRead = readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 group transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: isRead ? "transparent" : "rgba(79,110,247,0.04)" }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${color}18` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <Link href={n.href} onClick={() => setOpen(false)} className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isRead ? "text-slate-400" : "text-white"}`}>{n.title}</p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-slate-700 mt-1">
                      {formatDistanceToNow(parseISO(n.at), { addSuffix: true })}
                    </p>
                  </Link>
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
            <Link href="/dashboard/submissions" onClick={() => setOpen(false)}
              className="block text-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1">
              {t("nav.submissions")} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
