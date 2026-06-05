"use server";

/**
 * Next.js Server Actions — all mutations go through here.
 */

import { revalidatePath } from "next/cache";
import { updateSubmission, addAuditEntry, inviteTeamMember, deleteRule, createRule, createSubmission, getSubmission } from "./db";
import type { Submission, AppetiteRule } from "./types";
import { sendBrokerConfirmation, sendUnderwriterAlert, sendDecisionNotification } from "./email";
import { fireWebhook, type WebhookSubmissionPayload, type WebhookEvent } from "./webhooks";

const API_URL   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const UW_EMAIL  = process.env.UNDERWRITER_EMAIL   ?? "uzarek.maksymilian@gmail.com";

// ── submission decisions ──────────────────────────────────────────────────────

export async function decideAction(
  submissionId: string,
  decision: "accepted" | "declined" | "referred",
  actor: string = "underwriter",
  notes?: string,
) {
  let brokerEmail = "";
  let brokerName  = "";
  let insuredName = "";
  let score       = 0;

  try {
    const sub = await getSubmission(submissionId);
    if (sub) {
      brokerEmail = sub.broker_email ?? "";
      brokerName  = sub.broker_name  ?? "";
      insuredName = sub.extracted_data?.insured_name ?? sub.broker_company;
      score       = sub.score ?? 0;
    }
  } catch { /* non-fatal */ }

  // 1. Try backend API
  try {
    const res = await fetch(`${API_URL}/api/v1/submissions/${submissionId}/decide`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, actor, notes }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch {
    // 2. Fallback: direct Supabase / mock write
    await updateSubmission(submissionId, {
      status: decision,
      decision_by: actor,
      decision_at: new Date().toISOString(),
    });
    await addAuditEntry(submissionId, decision, actor, notes ?? `Manual decision: ${decision}`);
  }

  // Fire email (non-blocking)
  if (brokerEmail) {
    sendDecisionNotification({
      to: brokerEmail, brokerName, insuredName,
      refId: submissionId, decision, score,
    }).catch(() => {});
  }

  // Fire webhook (non-blocking)
  const webhookPayload: WebhookSubmissionPayload = {
    id: submissionId, status: decision, score,
    insured_name: insuredName || null,
    coverage_type: null, broker_email: brokerEmail || null,
    broker_company: null, decided_at: new Date().toISOString(),
    decided_by: actor,
  };
  fireWebhook({ type: `submission.${decision}` as WebhookEvent["type"], data: webhookPayload }).catch(() => {});

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

// ── submission create (dashboard upload) ──────────────────────────────────────

export async function persistSubmissionAction(
  data: Record<string, unknown>,
  fileName: string,
  brokerInfo?: { name: string; email: string; company: string },
) {
  const now = new Date().toISOString();

  const score: number = typeof data.score === "number" ? data.score : 50;
  const rawStatus     = typeof data.status === "string" ? data.status : "referred";
  const status        = (["accepted", "declined", "referred", "processing"] as const)
    .includes(rawStatus as "accepted") ? rawStatus as Submission["status"] : "referred";

  const submission: Omit<Submission, "updated_at"> = {
    id:             typeof data.id === "string" ? data.id : `VLX-${Date.now().toString().slice(-4)}`,
    status,
    score,
    file_name:      fileName,
    broker_name:    brokerInfo?.name    ?? "Self-uploaded",
    broker_email:   brokerInfo?.email   ?? "",
    broker_company: brokerInfo?.company ?? "Direct upload",
    created_at:     now,
    processed_at:   now,
    decision_at:    status !== "referred" ? now : null,
    decision_by:    status !== "referred" ? "AI" : null,
    notes:          null,
    extracted_data: data as unknown as Submission["extracted_data"],
  };

  await createSubmission(submission);
  await addAuditEntry(submission.id, "created", "AI", `Document uploaded: ${fileName}`);

  const insuredName    = typeof data.insured_name  === "string" ? data.insured_name  : submission.broker_company;
  const coverageType   = typeof data.coverage_type === "string" ? data.coverage_type : "Unknown";

  // Email underwriter when referred
  if (status === "referred") {
    const riskFactors = Array.isArray(data.risk_factors) ? (data.risk_factors as string[]) : [];
    sendUnderwriterAlert({
      to: UW_EMAIL, insuredName, refId: submission.id, coverageType, score, riskFactors,
    }).catch(() => {});
  }

  // Webhook: submission.created
  fireWebhook({
    type: "submission.created",
    data: {
      id: submission.id, status, score,
      insured_name:   insuredName,
      coverage_type:  coverageType,
      broker_email:   submission.broker_email || null,
      broker_company: submission.broker_company,
      decided_at:     submission.decision_at,
      decided_by:     submission.decision_by,
    },
  }).catch(() => {});

  revalidatePath("/dashboard/submissions");
  revalidatePath("/dashboard");

  return submission;
}

// ── broker portal ingestion ───────────────────────────────────────────────────

export async function portalSubmitAction(formData: FormData) {
  const brokerName    = String(formData.get("broker_name") ?? "");
  const brokerEmail   = String(formData.get("broker_email") ?? "");
  const brokerCompany = String(formData.get("broker_company") ?? "");
  const insuredName   = String(formData.get("insured_name") ?? "");
  const coverageType  = String(formData.get("coverage_type") ?? "");
  const file          = formData.get("file") as File | null;

  if (!file) throw new Error("No file provided");

  // AI extraction via internal route
  const extractFd = new FormData();
  extractFd.append("file", file);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/extract`, {
    method: "POST",
    body:   extractFd,
  });

  let extracted: Record<string, unknown> = {};
  if (res.ok) {
    extracted = await res.json();
  } else {
    // Fallback: basic structure from form fields
    extracted = { insured_name: insuredName, coverage_type: coverageType, risk_factors: [] };
  }

  const saved = await persistSubmissionAction(extracted, file.name, {
    name: brokerName, email: brokerEmail, company: brokerCompany,
  });

  // Broker confirmation email (non-blocking)
  if (brokerEmail) {
    sendBrokerConfirmation({
      to:           brokerEmail,
      brokerName,
      insuredName:  insuredName || (typeof extracted.insured_name === "string" ? extracted.insured_name : ""),
      refId:        saved.id,
      coverageType: coverageType || (typeof extracted.coverage_type === "string" ? extracted.coverage_type : ""),
    }).catch(() => {});
  }

  return saved;
}

// ── legacy FastAPI ingestion (kept for backwards compat) ──────────────────────

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
