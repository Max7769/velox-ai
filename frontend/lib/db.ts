/**
 * Velox AI — isomorphic data layer
 *
 * Checks whether Supabase is configured (non-placeholder env vars).
 * If yes → queries Supabase directly from the client (anon key, RLS).
 * If no  → falls back to mock data so the app always works in dev/demo mode.
 *
 * ALL pages and components should import from this module, not from mock-data.
 */

import { createClient } from "@supabase/supabase-js";
import type {
  Submission, AuditEntry, TeamMember, AppetiteRule, AnalyticsData, BrokerStat,
} from "./types";
import {
  mockSubmissions, mockAudit, mockTeam, mockRules, mockAnalytics, mockBrokerStats,
} from "./mock-data";

// ── configuration check ───────────────────────────────────────────────────────

function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.length > 0 &&
    key.length > 0 &&
    url !== "placeholder" &&
    key !== "placeholder" &&
    url.startsWith("https://")
  );
}

function getClient() {
  if (!supabaseConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ── submissions ───────────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<Submission[]> {
  const client = getClient();
  if (!client) return mockSubmissions;

  try {
    const { data, error } = await client
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return (data ?? []) as Submission[];
  } catch (e) {
    console.warn("[db] getSubmissions fell back to mock:", e);
    return mockSubmissions;
  }
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const client = getClient();
  if (!client) return mockSubmissions.find(s => s.id === id) ?? null;

  try {
    const { data, error } = await client
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Submission;
  } catch (e) {
    console.warn("[db] getSubmission fell back to mock:", e);
    return mockSubmissions.find(s => s.id === id) ?? null;
  }
}

export async function createSubmission(
  submission: Omit<Submission, "updated_at">,
): Promise<Submission> {
  const client = getClient();

  if (!client) {
    // Demo mode: prepend to in-memory mock array so listing works in-session
    mockSubmissions.unshift(submission as Submission);
    return submission as Submission;
  }

  try {
    const { data, error } = await client
      .from("submissions")
      .insert(submission)
      .select()
      .single();

    if (error) throw error;
    return data as Submission;
  } catch (e) {
    console.warn("[db] createSubmission error — falling back to mock prepend:", e);
    mockSubmissions.unshift(submission as Submission);
    return submission as Submission;
  }
}

export async function updateSubmission(
  id: string,
  updates: Partial<Pick<Submission, "status" | "notes" | "decision_by" | "decision_at">>,
): Promise<void> {
  const client = getClient();
  if (!client) return; // mock — no persistence needed in demo mode

  try {
    const { error } = await client
      .from("submissions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  } catch (e) {
    console.warn("[db] updateSubmission error:", e);
  }
}

// ── audit log ─────────────────────────────────────────────────────────────────

export async function getAuditLog(submissionId: string): Promise<AuditEntry[]> {
  const client = getClient();
  if (!client) return mockAudit.filter(e => e.submission_id === submissionId);

  try {
    const { data, error } = await client
      .from("audit_log")
      .select("*")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as AuditEntry[];
  } catch (e) {
    console.warn("[db] getAuditLog fell back to mock:", e);
    return mockAudit.filter(e => e.submission_id === submissionId);
  }
}

export async function addAuditEntry(
  submissionId: string,
  action: string,
  actor: string,
  detail?: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    const { error } = await client.from("audit_log").insert({
      submission_id: submissionId,
      action,
      actor,
      detail: detail ?? null,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.warn("[db] addAuditEntry error:", e);
  }
}

// ── team ──────────────────────────────────────────────────────────────────────

export async function getTeam(): Promise<TeamMember[]> {
  const client = getClient();
  if (!client) return mockTeam;

  try {
    const { data, error } = await client
      .from("team_members")
      .select("*")
      .order("joined_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as TeamMember[];
  } catch (e) {
    console.warn("[db] getTeam fell back to mock:", e);
    return mockTeam;
  }
}

export async function inviteTeamMember(email: string, name: string, role: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    const { error } = await client.from("team_members").insert({
      email,
      name,
      role,
      joined_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.warn("[db] inviteTeamMember error:", e);
  }
}

// ── appetite rules ────────────────────────────────────────────────────────────

export async function getRules(): Promise<AppetiteRule[]> {
  const client = getClient();
  if (!client) return mockRules;

  try {
    const { data, error } = await client
      .from("appetite_rules")
      .select("*")
      .eq("active", true)
      .order("priority", { ascending: true });

    if (error) throw error;
    return (data ?? []) as AppetiteRule[];
  } catch (e) {
    console.warn("[db] getRules fell back to mock:", e);
    return mockRules;
  }
}

export async function createRule(rule: Omit<AppetiteRule, "id">): Promise<AppetiteRule> {
  const client = getClient();
  const newRule: AppetiteRule = { ...rule, id: `rule-${Date.now()}` };

  if (!client) {
    mockRules.push(newRule);
    return newRule;
  }

  try {
    const { data, error } = await client
      .from("appetite_rules")
      .insert({ ...rule, id: newRule.id })
      .select()
      .single();

    if (error) throw error;
    return data as AppetiteRule;
  } catch (e) {
    console.warn("[db] createRule error:", e);
    mockRules.push(newRule);
    return newRule;
  }
}

export async function deleteRule(id: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    const { error } = await client
      .from("appetite_rules")
      .update({ active: false })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    console.warn("[db] deleteRule error:", e);
  }
}

// ── analytics ─────────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData[]> {
  const client = getClient();
  if (!client) return mockAnalytics;

  try {
    // Build daily analytics from submissions table
    const { data, error } = await client
      .from("submissions")
      .select("status, created_at, extracted_data")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data?.length) return mockAnalytics;

    // Group by date
    const grouped: Record<string, AnalyticsData> = {};
    for (const row of data) {
      const date = row.created_at.slice(0, 10);
      if (!grouped[date]) {
        grouped[date] = { date, total: 0, accepted: 0, declined: 0, referred: 0, gwp: 0 };
      }
      grouped[date].total++;
      if (row.status === "accepted") {
        grouped[date].accepted++;
        const pm = row.extracted_data?.premium_model;
        grouped[date].gwp += pm?.mid ?? 0;
      }
      if (row.status === "declined") grouped[date].declined++;
      if (row.status === "referred") grouped[date].referred++;
    }
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    console.warn("[db] getAnalytics fell back to mock:", e);
    return mockAnalytics;
  }
}

export async function getBrokerStats(): Promise<BrokerStat[]> {
  const client = getClient();
  if (!client) return mockBrokerStats;

  try {
    const { data, error } = await client
      .from("submissions")
      .select("broker_company, status, extracted_data, score")
      .neq("status", "processing");

    if (error) throw error;
    if (!data?.length) return mockBrokerStats;

    const map: Record<string, BrokerStat> = {};
    for (const row of data) {
      const co = row.broker_company || "Unknown";
      if (!map[co]) {
        map[co] = { company: co, submissions: 0, accepted: 0, declined: 0, referred: 0, gwp: 0, avgScore: 0, bindRate: 0 };
      }
      map[co].submissions++;
      if (row.status === "accepted") { map[co].accepted++; map[co].gwp += row.extracted_data?.premium_model?.mid ?? 0; }
      if (row.status === "declined") map[co].declined++;
      if (row.status === "referred") map[co].referred++;
      if (row.score) map[co].avgScore += row.score;
    }
    return Object.values(map).map(b => ({
      ...b,
      avgScore: Math.round(b.avgScore / b.submissions),
      bindRate: Math.round((b.accepted / b.submissions) * 100),
    })).sort((a, b) => b.submissions - a.submissions);
  } catch (e) {
    console.warn("[db] getBrokerStats fell back to mock:", e);
    return mockBrokerStats;
  }
}

// ── realtime subscription ─────────────────────────────────────────────────────

export function subscribeToSubmissions(
  callback: (payload: { new: Submission; eventType: string }) => void,
) {
  const client = getClient();
  if (!client) return () => {};

  const channel = client
    .channel("submissions-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "submissions" },
      payload => callback({ new: payload.new as Submission, eventType: payload.eventType }),
    )
    .subscribe();

  return () => { client.removeChannel(channel); };
}

// ── status ────────────────────────────────────────────────────────────────────

export function dbMode(): "supabase" | "mock" {
  return supabaseConfigured() ? "supabase" : "mock";
}
