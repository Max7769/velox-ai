"use server";

/**
 * Next.js Server Actions — all mutations go through here.
 * Server actions run on the server, so they can safely use the Supabase
 * service key (full access, bypasses RLS) via the backend API, or fall
 * back to the anon key.
 *
 * The backend API at NEXT_PUBLIC_API_URL is the authoritative source for
 * mutations that require AI processing (ingest). Other mutations (decide,
 * notes, rules) can go directly to Supabase via the db layer.
 */

import { revalidatePath } from "next/cache";
import { updateSubmission, addAuditEntry, inviteTeamMember, deleteRule, createRule, createSubmission } from "./db";
import type { Submission, AppetiteRule } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── submission decisions ──────────────────────────────────────────────────────

export async function decideAction(
  submissionId: string,
  decision: "accepted" | "declined" | "referred",
  actor: string = "underwriter",
  notes?: string,
) {
  // 1. Try backend API (persists to Supabase via service key)
  try {
    const res = await fetch(`${API_URL}/api/v1/submissions/${submissionId}/decide`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, actor, notes }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch {
    // 2. Fallback: direct Supabase write
    await updateSubmission(submissionId, {
      status: decision,
      decision_by: actor,
      decision_at: new Date().toISOString(),
    });
    await addAuditEntry(submissionId, decision, actor, notes ?? `Manual decision: ${decision}`);
  }

  revalidatePath("/dashboard/submissions");
  revalidatePath(`/dashboard/submissions/${submissionId}`);
  revalidatePath("/dashboard");
}

// ── notes ─────────────────────────────────────────────────────────────────────

export async function saveNotesAction(submissionId: string, notes: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/submissions/${submissionId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch {
    await updateSubmission(submissionId, { notes });
    await addAuditEntry(submissionId, "notes_updated", "underwriter", "Notes updated");
  }

  revalidatePath(`/dashboard/submissions/${submissionId}`);
}

// ── team ──────────────────────────────────────────────────────────────────────

export async function inviteTeamAction(email: string) {
  if (!email.includes("@")) throw new Error("Invalid email address");
  const name = email.split("@")[0];
  await inviteTeamMember(email, name, "underwriter");
  revalidatePath("/dashboard/settings");
}

// ── rules ─────────────────────────────────────────────────────────────────────

export async function createRuleAction(rule: Omit<AppetiteRule, "id">): Promise<AppetiteRule> {
  const created = await createRule(rule);
  revalidatePath("/dashboard/settings");
  return created;
}

export async function deleteRuleAction(id: string) {
  await deleteRule(id);
  revalidatePath("/dashboard/settings");
}

// ── submission create ─────────────────────────────────────────────────────────

export async function persistSubmissionAction(
  data: Record<string, unknown>,
  fileName: string,
) {
  const now = new Date().toISOString();

  const score: number    = typeof data.score === "number" ? data.score : 50;
  const rawStatus        = typeof data.status === "string" ? data.status : "referred";
  const status           = (["accepted", "declined", "referred", "processing"] as const)
    .includes(rawStatus as "accepted") ? rawStatus as Submission["status"] : "referred";

  const submission: Omit<Submission, "updated_at"> = {
    id:            typeof data.id === "string" ? data.id : `VLX-${Date.now().toString().slice(-4)}`,
    status,
    score,
    file_name:     fileName,
    broker_name:   "Self-uploaded",
    broker_email:  "",
    broker_company: "Direct upload",
    created_at:    now,
    processed_at:  now,
    decision_at:   status !== "referred" ? now : null,
    decision_by:   status !== "referred" ? "AI" : null,
    notes:         null,
    extracted_data: data as unknown as Submission["extracted_data"],
  };

  await createSubmission(submission);
  await addAuditEntry(submission.id, "created", "AI", `Document uploaded: ${fileName}`);

  revalidatePath("/dashboard/submissions");
  revalidatePath("/dashboard");

  return submission;
}

// ── document ingestion ────────────────────────────────────────────────────────

export async function ingestDocumentAction(formData: FormData) {
  const res = await fetch(`${API_URL}/api/v1/submissions/ingest`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Ingestion failed");
  }
  const data = await res.json();
  revalidatePath("/dashboard/submissions");
  revalidatePath("/dashboard");
  return data as {
    id: string;
    status: string;
    score: number | null;
    extracted_data: Record<string, unknown> | null;
  };
}
