"use client";
import { useState } from "react";
import { mockTeam, mockRules } from "@/lib/mock-data";
import { Users, Shield, Building2, Puzzle, Plus, Trash2, Mail, Check } from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "company",    label: "Company",     icon: Building2 },
  { id: "team",       label: "Team",        icon: Users },
  { id: "appetite",   label: "Appetite",    icon: Shield },
  { id: "integrations", label: "Integrations", icon: Puzzle },
];

const roleColors: Record<string, string> = {
  admin:       "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
  underwriter: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  viewer:      "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export default function SettingsPage() {
  const [tab, setTab] = useState("company");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.includes("@")) { toast.error("Enter a valid email address"); return; }
    setInviteSent(true);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setTimeout(() => { setInviteSent(false); setInviteEmail(""); }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your workspace, team, and underwriting rules.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* Company */}
      {tab === "company" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Company details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Company name", defaultValue: "Velox AI Ltd" },
                { label: "Lloyd's coverholder reference", defaultValue: "CHE-2026-0094" },
                { label: "FCA reference number", defaultValue: "987654" },
                { label: "Primary contact email", defaultValue: "underwriting@velox.ai" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">{f.label}</label>
                  <input defaultValue={f.defaultValue}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                </div>
              ))}
            </div>
            <button onClick={() => toast.success("Company details saved")}
              className="mt-5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Save changes
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Danger zone</h2>
            <p className="text-xs text-slate-400 mb-4">These actions are irreversible. Please be certain.</p>
            <button className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Delete workspace
            </button>
          </div>
        </div>
      )}

      {/* Team */}
      {tab === "team" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Team members ({mockTeam.length})</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Member", "Role", "Joined", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockTeam.map((m, i) => (
                  <tr key={m.id} className={i !== mockTeam.length - 1 ? "border-b border-slate-100" : ""}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${roleColors[m.role]}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(m.joined_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      {m.role !== "admin" && (
                        <button onClick={() => toast.error("Remove member: confirmation required")} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Mail size={14} /> Invite a team member</h2>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
              <button onClick={handleInvite}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                {inviteSent ? <><Check size={14} /> Sent</> : <><Plus size={14} /> Invite</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appetite rules */}
      {tab === "appetite" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Underwriting appetite rules</h2>
                <p className="text-xs text-slate-400 mt-0.5">Rules are applied in priority order. First match wins.</p>
              </div>
              <button onClick={() => toast.info("Rule builder coming soon")}
                className="flex items-center gap-1.5 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
                <Plus size={12} /> Add rule
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Priority", "Coverage type", "Condition", "Action", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockRules.map((r, i) => (
                  <tr key={r.id} className={i !== mockRules.length - 1 ? "border-b border-slate-100 hover:bg-slate-50" : "hover:bg-slate-50"}>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">#{r.priority}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{r.coverage_type}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{r.field} {r.operator} {r.value}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        r.action === "accept" ? "bg-emerald-50 text-emerald-700" : r.action === "decline" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      }`}>{r.action}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toast.success("Rule deleted")} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integrations */}
      {tab === "integrations" && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Applied Epic", desc: "Sync submissions to your Epic system of record", status: "available" },
            { name: "Salesforce", desc: "Push submission data to Salesforce CRM", status: "available" },
            { name: "Slack", desc: "Get real-time notifications in Slack", status: "connected" },
            { name: "Email ingestion", desc: "Receive submissions directly via email forwarding", status: "available" },
            { name: "Lloyd's CDR", desc: "Auto-generate Core Data Records for Blueprint Two", status: "coming" },
            { name: "Riskonnect", desc: "Export to Riskonnect TPA system", status: "coming" },
          ].map(int => (
            <div key={int.name} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">{int.name}</p>
                  {int.status === "connected" && <span className="text-xs bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded font-medium">Connected</span>}
                  {int.status === "coming" && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">Soon</span>}
                </div>
                <p className="text-xs text-slate-400">{int.desc}</p>
              </div>
              <button onClick={() => int.status !== "coming" && toast.info(`${int.name} integration: coming soon`)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  int.status === "connected" ? "bg-slate-100 text-slate-500 hover:bg-slate-200" :
                  int.status === "coming" ? "bg-slate-50 text-slate-300 cursor-not-allowed" :
                  "bg-brand-500 text-white hover:bg-brand-600"
                }`}>
                {int.status === "connected" ? "Disconnect" : int.status === "coming" ? "Soon" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
