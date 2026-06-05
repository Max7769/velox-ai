/**
 * Email notifications via Resend.
 * When RESEND_API_KEY is not set → silently no-ops (demo/dev mode).
 */

import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "placeholder" || key.length < 10) return null;
  return new Resend(key);
}

const FROM = "Velox AI <noreply@velox.ai>";

// ── Broker: submission received ───────────────────────────────────────────────

export async function sendBrokerConfirmation(opts: {
  to: string;
  brokerName: string;
  insuredName: string;
  refId: string;
  coverageType: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `Submission received — ${opts.refId}`,
      html: brokerConfirmationHtml(opts),
    });
  } catch (e) {
    console.warn("[email] sendBrokerConfirmation failed:", e);
  }
}

// ── Underwriter: new referred submission ──────────────────────────────────────

export async function sendUnderwriterAlert(opts: {
  to: string;
  insuredName: string;
  refId: string;
  coverageType: string;
  score: number;
  riskFactors: string[];
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `Referred for review — ${opts.insuredName} (${opts.refId})`,
      html: underwriterAlertHtml(opts),
    });
  } catch (e) {
    console.warn("[email] sendUnderwriterAlert failed:", e);
  }
}

// ── Broker: decision notification ────────────────────────────────────────────

export async function sendDecisionNotification(opts: {
  to: string;
  brokerName: string;
  insuredName: string;
  refId: string;
  decision: "accepted" | "declined" | "referred";
  score: number;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `Decision: ${opts.decision.toUpperCase()} — ${opts.insuredName} (${opts.refId})`,
      html: decisionHtml(opts),
    });
  } catch (e) {
    console.warn("[email] sendDecisionNotification failed:", e);
  }
}

// ── HTML templates ────────────────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080d18;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080d18;min-height:100vh;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:560px;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.06);background:#0d1526;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;height:28px;background:#4f6ef7;border-radius:8px;text-align:center;vertical-align:middle;">
              <span style="color:#fff;font-size:14px;font-weight:700;">⚡</span>
            </td>
            <td style="padding-left:10px;">
              <span style="color:#fff;font-size:15px;font-weight:600;">Velox AI</span>
              <span style="color:#475569;font-size:12px;margin-left:8px;">· Underwriting Platform</span>
            </td>
          </tr></table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
          <p style="margin:0;font-size:11px;color:#334155;">© 2026 Velox AI Ltd · SOC 2 Type II · Lloyd's Blueprint Two compliant</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function brokerConfirmationHtml(opts: {
  brokerName: string; insuredName: string; refId: string; coverageType: string;
}) {
  return base(`
    <div style="width:48px;height:48px;background:rgba(16,185,129,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
      <span style="font-size:24px;">✓</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#fff;text-align:center;">Submission received</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;text-align:center;">Our AI is processing it now — you&apos;ll hear back within 8 minutes.</p>

    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Reference number</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#4f6ef7;font-family:monospace;">${opts.refId}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        ["Insured", opts.insuredName],
        ["Coverage type", opts.coverageType],
        ["Broker", opts.brokerName],
      ].map(([l, v]) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;color:#64748b;">${l}</td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;color:#e2e8f0;text-align:right;font-weight:500;">${v}</td>
      </tr>`).join("")}
    </table>

    <a href="https://velox.ai/portal/status?ref=${opts.refId}" style="display:block;text-align:center;background:#4f6ef7;color:#fff;font-size:14px;font-weight:600;padding:14px;border-radius:10px;text-decoration:none;">
      Track this submission →
    </a>
  `);
}

function underwriterAlertHtml(opts: {
  insuredName: string; refId: string; coverageType: string; score: number; riskFactors: string[];
}) {
  const scoreColor = opts.score >= 70 ? "#10b981" : opts.score >= 45 ? "#f59e0b" : "#ef4444";
  return base(`
    <h1 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#fff;">Referred for review</h1>
    <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;">Requires underwriter decision before binding.</p>

    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;">
        <p style="margin:0 0 4px;font-size:10px;color:#64748b;text-transform:uppercase;">Risk score</p>
        <p style="margin:0;font-size:28px;font-weight:700;color:${scoreColor};">${opts.score}</p>
        <p style="margin:4px 0 0;font-size:10px;color:#64748b;">/100</p>
      </div>
      <div style="flex:2;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;">
        <p style="margin:0 0 6px;font-size:10px;color:#64748b;text-transform:uppercase;">Submission</p>
        <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#fff;">${opts.insuredName}</p>
        <p style="margin:0 0 2px;font-size:12px;color:#94a3b8;">${opts.coverageType}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#4f6ef7;font-family:monospace;">${opts.refId}</p>
      </div>
    </div>

    ${opts.riskFactors.length > 0 ? `
    <div style="margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:11px;color:#f59e0b;text-transform:uppercase;font-weight:600;">⚠ Risk factors flagged</p>
      ${opts.riskFactors.map(f => `
        <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.1);border-radius:6px;padding:8px 12px;margin-bottom:6px;font-size:12px;color:#94a3b8;">
          · ${f}
        </div>`).join("")}
    </div>` : ""}

    <a href="https://velox.ai/dashboard/submissions/${opts.refId}" style="display:block;text-align:center;background:#4f6ef7;color:#fff;font-size:14px;font-weight:600;padding:14px;border-radius:10px;text-decoration:none;">
      Review &amp; decide →
    </a>
  `);
}

function decisionHtml(opts: {
  brokerName: string; insuredName: string; refId: string;
  decision: "accepted" | "declined" | "referred"; score: number;
}) {
  const colors: Record<string, { bg: string; text: string; label: string; emoji: string }> = {
    accepted: { bg: "rgba(16,185,129,0.1)",  text: "#10b981", label: "ACCEPTED",  emoji: "✓" },
    declined: { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", label: "DECLINED",  emoji: "✗" },
    referred: { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", label: "REFERRED",  emoji: "⟳" },
  };
  const c = colors[opts.decision];
  return base(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:56px;height:56px;background:${c.bg};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:24px;color:${c.text};">${c.emoji}</span>
      </div>
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#fff;">
        Submission <span style="color:${c.text};">${c.label}</span>
      </h1>
      <p style="margin:0;font-size:13px;color:#94a3b8;">Dear ${opts.brokerName}, here is the decision on your submission.</p>
    </div>

    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ["Insured name", opts.insuredName],
          ["Reference", opts.refId],
          ["Risk score", `${opts.score}/100`],
          ["Decision", c.label],
        ].map(([l, v]) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;color:#64748b;">${l}</td>
          <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;color:#e2e8f0;text-align:right;font-weight:600;">${v}</td>
        </tr>`).join("")}
      </table>
    </div>

    ${opts.decision === "referred" ? `
    <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:10px;padding:16px;margin-bottom:24px;font-size:13px;color:#94a3b8;">
      Your submission has been referred to an underwriter for manual review. You will receive a further decision within 24 hours.
    </div>` : ""}

    <a href="https://velox.ai/portal/status?ref=${opts.refId}" style="display:block;text-align:center;background:#4f6ef7;color:#fff;font-size:14px;font-weight:600;padding:14px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
      View decision details →
    </a>
  `);
}
