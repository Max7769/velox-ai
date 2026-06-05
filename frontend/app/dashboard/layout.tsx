"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, FileText, BarChart2, Settings, ChevronRight, Zap, ExternalLink, Command, Globe, Kanban, Download } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { NotificationCenter } from "@/components/notification-center";
import { Onboarding } from "@/components/onboarding";
import { LiveFeed } from "@/components/live-feed";
import { KeyboardHelp } from "@/components/keyboard-help";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserButton } from "@/components/user-button";
import { useTranslation } from "@/lib/i18n";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const nav = [
    { labelKey: "nav.dashboard",     href: "/dashboard",            icon: LayoutDashboard },
    { labelKey: "nav.newSubmission", href: "/dashboard/upload",     icon: Upload },
    { labelKey: "nav.submissions",   href: "/dashboard/submissions",icon: FileText },
    { labelKey: "nav.pipeline",      href: "/dashboard/pipeline",   icon: Kanban },
    { labelKey: "nav.analytics",     href: "/dashboard/analytics",  icon: BarChart2 },
    { labelKey: "nav.exposure",      href: "/dashboard/exposure",   icon: Globe },
    { labelKey: "nav.reports",       href: "/dashboard/reports",    icon: Download },
    { labelKey: "nav.settings",      href: "/dashboard/settings",   icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col flex-shrink-0" style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Zap size={13} className="text-white" fill="white" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm tracking-tight">Velox AI</span>
            <span className="block text-slate-600 text-[10px]">Underwriting Platform</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map(({ labelKey, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                style={active ? { background: "rgba(79,110,247,0.15)", color: "#818cf8" } : undefined}
              >
                <Icon size={15} />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/portal" target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors group mb-1"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t("nav.brokerPortal")}
            </span>
            <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="/demo" target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors group mb-2"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Investor demo
            </span>
            <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <UserButton name="Max Uzarek" email="uzarek.maksymilian@gmail.com" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">Max Uzarek</p>
              <p className="text-[10px] text-slate-600 truncate">{t("nav.administrator")}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 flex items-center justify-between px-6 flex-shrink-0" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
          <nav className="flex items-center gap-1 text-xs text-slate-600">
            {pathname.split("/").filter(Boolean).map((seg, i, arr) => (
              <span key={seg} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} />}
                <span className={i === arr.length - 1 ? "text-slate-400 font-medium capitalize" : "capitalize"}>{seg}</span>
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Command size={11} />
              <span>{t("common.search")}</span>
              <kbd className="text-[9px] font-mono text-slate-700 ml-1">⌘K</kbd>
            </button>
            <Link href="/dashboard/upload"
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "var(--brand)" }}>
              <Upload size={11} /> {t("common.newSub")}
            </Link>
            <LanguageSwitcher />
            <KeyboardHelp />
            <LiveFeed />
            <NotificationCenter />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
      <Onboarding />
    </div>
  );
}
