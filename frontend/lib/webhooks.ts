/**
 * Webhook event dispatcher.
 * Fires HTTP POST to configured URLs when submission events occur.
 * All calls are non-blocking and fail silently (webhook failures
 * must never affect the primary user flow).
 */

export type WebhookEvent =
  | { type: "submission.created";  data: WebhookSubmissionPayload }
  | { type: "submission.accepted"; data: WebhookSubmissionPayload }
  | { type: "submission.declined"; data: WebhookSubmissionPayload }
  | { type: "submission.referred"; data: WebhookSubmissionPayload };

export interface WebhookSubmissionPayload {
  id:           string;
  status:       string;
  score:        number | null;
  insured_name: string | null;
  coverage_type: string | null;
  broker_email: string | null;
  broker_company: string | null;
  decided_at:   string | null;
  decided_by:   string | null;
}

function getWebhookUrls(): string[] {
  const raw = process.env.WEBHOOK_URLS ?? "";
  return raw.split(",").map(s => s.trim()).filter(s => s.startsWith("http"));
}

export async function fireWebhook(event: WebhookEvent): Promise<void> {
  const urls = getWebhookUrls();
  if (urls.length === 0) return;

  const body = JSON.stringify({
    event:     event.type,
    timestamp: new Date().toISOString(),
    data:      event.data,
  });

  const headers = {
    "Content-Type": "application/json",
    "X-Velox-Event": event.type,
    "X-Velox-Version": "1",
  };

  await Promise.allSettled(
    urls.map(url =>
      fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(5000) })
        .catch(e => console.warn(`[webhook] ${url} failed:`, e)),
    ),
  );
}
