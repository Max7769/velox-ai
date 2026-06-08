"use client";
import { useState, useEffect, useCallback } from "react";
import { getTeam, getRules, deleteRule as dbDeleteRule } from "@/lib/db";
import {
  Users, Shield, Building2, Puzzle, Plus, Trash2, Mail, Check,
  Key, Copy, RefreshCw, Webhook, CheckCircle, ExternalLink,
  GripVertical, Eye, EyeOff, Zap, X, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { TeamMember, AppetiteRule } from "@/lib/types";
import { deleteRuleAction, inviteTeamAction, createRuleAction } from "@/lib/actions";
import { useTranslation } from "@/lib/i18n";

// Coverage types for rule builder
const COVERAGE_TYPES = [
  "Marine Cargo", "Cyber Liability", "D&O Liability", "Property",
  "Crime", "Professional Indemnity", "Liability", "Aviation", "Energy", "Terrorism",
];
const FIELDS    = ["score", "revenue", "employees", "loss_history", "jurisdiction", "coverage_limit"];
const OPERATORS: AppetiteRule["operator"][] = ["gt", "lt", "eq", "contains"];
const ACTIONS   = ["accept", "refer", "decline"] as const;

type Action = typeof ACTIONS[number];

type RuleOperator = AppetiteRule["operator"];

interface RuleForm {
  coverage_type: string;
  field:         string;
  operator:      RuleOperator;
  value:         string;
  action:        Action;
  priority:      number;
}

const BLANK_FORM: RuleForm = {
  coverage_type: "Marine Cargo",
  field:         "score",
  operator:      "gt",
  value:         "",
  action:        "refer",
  priority:      10,
};

const FAKE_KEY = "vlx_live_sk_3hKq9mPwRxN2jLdY7vFcBtAeZsUo1Gi";

export default function SettingsPage() {
  const { t } = useTranslation();
  const tabs = [
    { id: "company",      label: t("set.company"),      icon: Building2 },
    { id: "team",         label: t("set.team"),         icon: Users },
    { id: "appetite",     label: t("set.appetite"),     icon: Shield },
    { id: "integrations", label: t("set.integrations"), icon: Puzzle },
    { id: "api",          label: t("set.api"),          icon: Key },
  ];
  const [tab,         setTab]         = useState("company");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting,    setInviting]    = useState(false);
  const [showKey,     setShowKey]     = useState(false);
  const [rules,       setRules]       = useState<AppetiteRule[]>([]);
  const [team,        setTeam]        = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [webhookUrl,  setWebhookUrl]  = useState("https://hooks.yoursystem.com/velox");
  const [showModal,   setShowModal]   = useState(false);
  const [ruleForm,    setRuleForm]    = useState<RuleForm>(BLANK_FORM);
  const [savingRule,  setSavingRule]  = useState(false);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([getTeam(), getRules()]);
      setTeam(t);
      setRules(r);
    } catch (e) { console.error(e); }
    finally { setLoadingTeam(false); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleInvite = async () => {
    if (!inviteEmail.includes("@")) { toast.error(t("set.team.invalidEmail")); return; }
    setInviting(true);
    try {
      await inviteTeamAction(inviteEmail);
      toast.success(`${t("set.team.invited")} ${inviteEmail}`);
      setInviteEmail("");
      loadSettings();
    } catch { toast.error(t("set.team.inviteFailed")); }
    finally { setInviting(false); }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteRuleAction(id);
      setRules(r => r.filter(x => x.id !== id));
      toast.success(t("set.appetite.deleted"));
    } catch { toast.error(t("set.appetite.deleteFailed")); }
  };

  const handleAddRule = async () => {
    if (!ruleForm.value.trim()) { toast.error(t("set.modal.valueRequired")); return; }
    setSavingRule(true);
    try {
      const newRule = await createRuleAction({
        coverage_type: ruleForm.coverage_type,
        field:         ruleForm.field,
        operator:      ruleForm.operator,
        value:         ruleForm.value,
        action:        ruleForm.action,
        priority:      ruleForm.priority,
        active:        true,
      });
      setRules(r => [...r, newRule].sort((a, b) => a.priority - b.priority));
      setShowModal(false);
      setRuleForm(BLANK_FORM);
      toast.success(t("set.modal.added"));
    } catch { toast.error(t("set.modal.saveFailed")); }
    finally { setSavingRule(false); }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(FAKE_KEY);
    toast.success(t("set.api.copied"));
  };

  const section = (title: string, sub?: string) => (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">{t("set.title")}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t("set.subtitle")}</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={tab === t.id ? { background: "var(--brand)", color: "#fff" } : { color: "#64748b" }}>
            <t.icon size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* ── Company ──────────────────────────────────────────── */}
      {tab === "company" && (
        <div className="space-y-4">
          <div className="card p-5">
            {section(t("set.companyDetails"))}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t("set.company.name"),         val: "Velox AI Ltd" },
                { label: t("set.company.coverholder"),  val: "CHE-2026-0094" },
                { label: t("set.company.fca"),          val: "987654" },
                { label: t("set.company.syndicate"),    val: "2026" },
                { label: t("set.company.email"),        val: "underwriting@velox.ai" },
                { label: t("set.company.jurisdiction"), val: "England & Wales" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs text-slate-500 mb-1.5">{f.label}</label>
                  <input defaultValue={f.val} className="input-dark w-full" />
                </div>
              ))}
            </div>
            <button onClick={() => toast.success(t("set.company.saved"))}
              className="mt-5 btn-primary px-4 py-2 text-sm">
              {t("set.company.save")}
            </button>
          </div>

          <div className="card p-5">
            {section(t("set.compliance.title"), t("set.compliance.sub"))}
            <div className="space-y-3">
              {[
                { label: t("set.compliance.gdpr"),   val: t("set.compliance.gdprVal"),   desc: t("set.compliance.gdprDesc") },
                { label: t("set.compliance.aiAct"),  val: t("set.compliance.aiActVal"),  desc: t("set.compliance.aiActDesc") },
                { label: t("set.compliance.cdr"),    val: t("set.compliance.cdrVal"),    desc: t("set.compliance.cdrDesc") },
                { label: t("set.compliance.soc2"),   val: t("set.compliance.soc2Val"),   desc: t("set.compliance.soc2Desc") },
              ].map(c => (
                <div key={c.label} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div>
                    <p className="text-xs font-medium text-slate-300">{c.label}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{c.desc}</p>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">{c.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
            <h2 className="text-sm font-semibold text-red-400 mb-1">{t("set.danger.title")}</h2>
            <p className="text-xs text-slate-600 mb-4">{t("set.danger.sub")}</p>
            <button onClick={() => toast.error(t("set.danger.toast"))}
              className="text-xs px-3 py-2 rounded-lg text-red-400 font-medium transition-all"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {t("set.danger.delete")}
            </button>
          </div>
        </div>
      )}

      {/* ── Team ─────────────────────────────────────────────── */}
      {tab === "team" && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-sm font-semibold text-white">{t("set.team.heading")} ({team.length})</h2>
              <span className="text-xs text-slate-600">{team.length} {t("set.team.seats")}</span>
            </div>
            {loadingTeam ? (
              <div className="py-8 flex items-center justify-center gap-2 text-slate-600">
                <RefreshCw size={13} className="animate-spin" />
                <span className="text-xs">{t("set.team.loading")}</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {[t("set.team.member"), t("set.team.role"), t("set.team.joined"), ""].map(h => <th key={h} className="th">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {team.map((m, i) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors"
                      style={i !== team.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "var(--brand)" }}>
                            {m.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{m.name}</p>
                            <p className="text-xs text-slate-500">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="td">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold capitalize"
                          style={{
                            background: m.role === "admin" ? "rgba(79,110,247,0.1)" : m.role === "underwriter" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                            color:      m.role === "admin" ? "#818cf8" : m.role === "underwriter" ? "#6ee7b7" : "#64748b",
                          }}>
                          {m.role}
                        </span>
                      </td>
                      <td className="td text-slate-500 text-xs">
                        {new Date(m.joined_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="td">
                        {m.role !== "admin" && (
                          <button onClick={() => toast.error(t("set.team.removeToast"))} className="text-slate-700 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Mail size={13} className="text-slate-500" /> {t("set.inviteMember")}
            </h2>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder={t("set.team.placeholder")} className="input-dark flex-1"
                onKeyDown={e => e.key === "Enter" && handleInvite()} />
              <button onClick={handleInvite} disabled={inviting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--brand)" }}>
                {inviting ? <><RefreshCw size={13} className="animate-spin" /> {t("set.team.sending")}</> : <><Plus size={13} /> {t("set.team.invite")}</>}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">{t("set.team.hint")}</p>
          </div>
        </div>
      )}

      {/* ── Appetite rules ────────────────────────────────────── */}
      {tab === "appetite" && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h2 className="text-sm font-semibold text-white">{t("set.appetite.heading")}</h2>
                <p className="text-xs text-slate-600 mt-0.5">{t("set.appetite.sub")}</p>
              </div>
              <button onClick={() => { setRuleForm(BLANK_FORM); setShowModal(true); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                style={{ background: "var(--brand)" }}>
                <Plus size={11} /> {t("set.addRule")}
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["", t("set.appetite.priority"), t("set.appetite.coverageType"), t("set.appetite.condition"), t("set.appetite.action"), ""].map(h => <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr><td colSpan={6} className="td text-center py-8 text-slate-600 text-sm">
                    {t("set.noRules")}
                  </td></tr>
                ) : rules.map((r, i) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors"
                    style={i !== rules.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}>
                    <td className="td w-8"><GripVertical size={13} className="text-slate-700 cursor-grab" /></td>
                    <td className="td"><span className="font-mono text-xs text-slate-600">#{r.priority}</span></td>
                    <td className="td font-medium text-slate-300">{r.coverage_type}</td>
                    <td className="td">
                      <code className="text-xs px-1.5 py-0.5 rounded font-mono text-slate-400"
                        style={{ background: "rgba(255,255,255,0.05)" }}>
                        {r.field} {r.operator} {r.value}
                      </code>
                    </td>
                    <td className="td">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          background: r.action === "accept" ? "rgba(16,185,129,0.1)" : r.action === "decline" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                          color:      r.action === "accept" ? "#6ee7b7" : r.action === "decline" ? "#fca5a5" : "#fcd34d",
                        }}>
                        {r.action}
                      </span>
                    </td>
                    <td className="td">
                      <button onClick={() => handleDeleteRule(r.id)} className="text-slate-700 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rule tester */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-3">{t("set.appetite.testerTitle")}</h2>
            <p className="text-xs text-slate-500 mb-3">{t("set.appetite.testerSub")}</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">{t("set.appetite.coverageType")}</label>
                <select className="input-dark w-full text-xs">
                  {COVERAGE_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">{t("set.appetite.testerScore")}</label>
                <input type="number" defaultValue={65} min={0} max={100} className="input-dark w-full text-xs" />
              </div>
              <div className="flex items-end">
                <button onClick={() => toast.success(t("set.appetite.testResult"))}
                  className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "var(--brand)" }}>
                  {t("set.appetite.testBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Integrations ─────────────────────────────────────── */}
      {tab === "integrations" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Applied Epic",    desc: "Sync submissions to your Epic system of record",           status: "available", category: "MGA system" },
              { name: "Salesforce",      desc: "Push submission and pipeline data to Salesforce CRM",      status: "available", category: "CRM" },
              { name: "Slack",           desc: "Real-time decision notifications in your Slack workspace", status: "connected", category: "Notifications" },
              { name: "Email ingestion", desc: "Receive submissions via email — Postmark/Mailgun/SendGrid", status: "connected", category: "Inbound" },
              { name: "Lloyd's CDR",     desc: "Auto-generate Core Data Records (Blueprint Two compliant)", status: "available", category: "Lloyd's" },
              { name: "Riskonnect",      desc: "Export to Riskonnect TPA and claims system",               status: "coming",   category: "Claims" },
              { name: "Canopy Connect",  desc: "Ingest structured risk data from digital brokers",         status: "coming",   category: "Data" },
              { name: "Sequel Impact",   desc: "Push bound risks to Sequel policy admin system",           status: "coming",   category: "Policy admin" },
            ].map(int => (
              <div key={int.name} className="card p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{int.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-600"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      {int.category}
                    </span>
                    {int.status === "connected" && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {t("set.int.connected")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{int.desc}</p>
                </div>
                <button
                  onClick={() => int.status !== "coming" ? toast.info(`${int.name} ${t("set.int.configToast")}`) : undefined}
                  disabled={int.status === "coming"}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{
                    background: int.status === "connected" ? "rgba(255,255,255,0.05)" : int.status === "coming" ? "rgba(255,255,255,0.03)" : "var(--brand)",
                    color:      int.status === "connected" ? "#64748b" : int.status === "coming" ? "#334155" : "#fff",
                    cursor:     int.status === "coming" ? "not-allowed" : "pointer",
                  }}>
                  {int.status === "connected" ? t("set.int.configure") : int.status === "coming" ? t("set.int.soon") : t("set.int.connect")}
                </button>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Webhook size={13} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-white">{t("set.webhook")}</h2>
            </div>
            <p className="text-xs text-slate-600 mb-3">{t("set.int.webhookDesc")}</p>
            <div className="flex gap-2">
              <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="input-dark flex-1 text-xs font-mono" />
              <button onClick={() => toast.success(t("set.int.saved"))}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--brand)" }}>
                {t("set.int.save")}
              </button>
              <button onClick={() => toast.info(t("set.int.tested"))}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium text-slate-400"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                {t("set.int.test")}
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">{t("set.int.events")}</p>
              {["submission.received", "submission.extracted", "submission.accepted", "submission.declined", "submission.referred"].map(ev => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-slate-400">{ev}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── API ──────────────────────────────────────────────── */}
      {tab === "api" && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Key size={13} style={{ color: "var(--brand)" }} />
              <h2 className="text-sm font-semibold text-white">{t("set.apiKey")}</h2>
              <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t("set.api.live")}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">{t("set.api.desc")}</p>
            <div className="flex items-center gap-2 p-3 rounded-xl font-mono text-xs"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
              <span className="flex-1 text-slate-300 truncate">
                {showKey ? FAKE_KEY : FAKE_KEY.slice(0, 12) + "•".repeat(24)}
              </span>
              <button onClick={() => setShowKey(v => !v)} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={copyKey} className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0">
                <Copy size={13} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => setShowRotateConfirm(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-amber-400 font-medium transition-all"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <RefreshCw size={11} /> {t("set.rotateKey")}
              </button>
              <span className="text-[10px] text-slate-700">{t("set.api.created")}</span>
            </div>

            {showRotateConfirm && (
              <div className="mt-4 p-4 rounded-xl flex items-start gap-3"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-400 mb-1">{t("set.api.rotateTitle")}</p>
                  <p className="text-xs text-slate-500 mb-3">{t("set.api.rotateDesc")}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { toast.success(t("set.api.rotated")); setShowRotateConfirm(false); }}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                      style={{ background: "#f59e0b" }}>
                      {t("set.api.rotateYes")}
                    </button>
                    <button onClick={() => setShowRotateConfirm(false)}
                      className="text-xs px-3 py-1.5 rounded-lg text-slate-400"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      {t("set.api.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">{t("set.api.reference")}</h2>
            <div className="space-y-2">
              {[
                { method: "POST",  path: "/api/v1/submissions/ingest", desc: "Ingest a submission document" },
                { method: "GET",   path: "/api/v1/submissions",        desc: "List all submissions" },
                { method: "GET",   path: "/api/v1/submissions/:id",    desc: "Get a submission by ID" },
                { method: "PATCH", path: "/api/v1/submissions/:id/decide", desc: "Accept / decline / refer" },
                { method: "PATCH", path: "/api/v1/submissions/:id/notes",  desc: "Update underwriter notes" },
                { method: "GET",   path: "/api/v1/submissions/:id/audit",  desc: "Get audit trail" },
                { method: "GET",   path: "/api/v1/analytics",          desc: "Retrieve analytics data" },
                { method: "GET",   path: "/api/v1/rules",              desc: "List appetite rules" },
              ].map(e => (
                <div key={e.path} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-[10px] font-bold w-10 flex-shrink-0"
                    style={{ color: e.method === "POST" ? "#4f6ef7" : e.method === "GET" ? "#10b981" : "#f59e0b" }}>
                    {e.method}
                  </span>
                  <code className="text-xs font-mono text-slate-400 flex-1">{e.path}</code>
                  <span className="text-xs text-slate-600">{e.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">{t("set.api.usage")}</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t("set.api.requests"),           value: "1,247", limit: "10,000" },
                { label: t("set.api.extractions"),        value: "89",    limit: "500"    },
                { label: t("set.api.webhookDeliveries"),  value: "312",   limit: "∞"      },
              ].map(u => (
                <div key={u.label} className="p-3 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <p className="text-xl font-bold text-white">{u.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{u.label}</p>
                  <p className="text-[10px] text-slate-700 mt-1">{t("set.api.ofLimit")} {u.limit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-3">{t("set.api.quickStart")}</h2>
            <pre className="text-xs font-mono p-4 rounded-xl overflow-x-auto leading-relaxed"
              style={{ background: "rgba(0,0,0,0.3)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.05)" }}>
{`curl -X POST https://api.velox.ai/v1/submissions/ingest \\
  -H "Authorization: Bearer ${FAKE_KEY.slice(0, 20)}..." \\
  -F "file=@submission.pdf" \\
  -F "broker_email=broker@firm.com" \\
  -F "broker_company=Aon UK"`}
            </pre>
          </div>
        </div>
      )}

      {/* ── Add Rule Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">{t("set.modal.title")}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Coverage type */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{t("set.modal.coverageType")}</label>
                <select value={ruleForm.coverage_type}
                  onChange={e => setRuleForm(f => ({ ...f, coverage_type: e.target.value }))}
                  className="input-dark w-full">
                  {COVERAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Condition row */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{t("set.modal.condition")}</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={ruleForm.field}
                    onChange={e => setRuleForm(f => ({ ...f, field: e.target.value }))}
                    className="input-dark">
                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={ruleForm.operator}
                    onChange={e => setRuleForm(f => ({ ...f, operator: e.target.value as RuleOperator }))}
                    className="input-dark">
                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input
                    value={ruleForm.value}
                    onChange={e => setRuleForm(f => ({ ...f, value: e.target.value }))}
                    placeholder="e.g. 70"
                    className="input-dark" />
                </div>
                <p className="text-[10px] text-slate-700 mt-1.5">
                  {t("set.modal.preview")}: <code className="font-mono">{ruleForm.field} {ruleForm.operator} {ruleForm.value || "…"}</code>
                </p>
              </div>

              {/* Action */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{t("set.modal.action")}</label>
                <div className="flex gap-2">
                  {ACTIONS.map(a => (
                    <button key={a} type="button"
                      onClick={() => setRuleForm(f => ({ ...f, action: a }))}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                      style={ruleForm.action === a ? {
                        background: a === "accept" ? "#10b981" : a === "decline" ? "#ef4444" : "#f59e0b",
                        color: "#fff",
                      } : { background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid var(--border)" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{t("set.modal.priority")}</label>
                <input type="number" value={ruleForm.priority} min={1} max={999}
                  onChange={e => setRuleForm(f => ({ ...f, priority: Number(e.target.value) }))}
                  className="input-dark w-32" />
              </div>

              {/* Rule summary */}
              <div className="p-3 rounded-xl" style={{ background: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.15)" }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t("set.modal.summary")}</p>
                <p className="text-xs text-slate-300">
                  {t("set.modal.summaryIf")} <span className="text-white font-semibold">{ruleForm.coverage_type}</span> {t("set.modal.summaryHas")}{" "}
                  <code className="font-mono text-indigo-300">{ruleForm.field} {ruleForm.operator} {ruleForm.value || "…"}</code>,
                  {" "}{t("set.modal.summaryThen")} <span className="font-semibold" style={{
                    color: ruleForm.action === "accept" ? "#10b981" : ruleForm.action === "decline" ? "#ef4444" : "#f59e0b",
                  }}>{ruleForm.action}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <button onClick={handleAddRule} disabled={savingRule || !ruleForm.value.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--brand)" }}>
                {savingRule ? t("set.modal.saving") : t("set.modal.add")}
              </button>
              <button onClick={() => setShowModal(false)}
                className="py-2.5 px-5 rounded-xl text-sm font-medium text-slate-400 transition-all hover:text-slate-300"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                {t("set.modal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
