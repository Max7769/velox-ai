import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "placeholder" || key.length < 10) return null;
  return new Resend(key);
}

const NOTIFY_EMAIL = process.env.UNDERWRITER_EMAIL ?? "uzarek.maksymilian@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };
    if (!email?.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const resend = getResend();
    if (resend) {
      // Notify founder
      await resend.emails.send({
        from:    "Velox AI <noreply@velox.ai>",
        to:      NOTIFY_EMAIL,
        subject: `New waitlist signup — ${email}`,
        html:    `<p style="font-family:sans-serif;color:#111;">New early access signup from <strong>${email}</strong></p>`,
      });

      // Confirm to user
      await resend.emails.send({
        from:    "Max @ Velox AI <max@velox.ai>",
        to:      email,
        subject: "You're on the list — Velox AI",
        html: `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#080d18;color:#e2e8f0;padding:40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;">
            <tr><td style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:32px;">
              <div style="width:40px;height:40px;background:#4f6ef7;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
                <span style="color:#fff;font-size:18px;">⚡</span>
              </div>
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#fff;">You're on the list.</h2>
              <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Thanks for signing up for early access to Velox AI. I'll personally reach out within 24 hours to set up a demo and discuss your submission workflow.
              </p>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">In the meantime, you can explore the platform:</p>
              <a href="https://velox.ai/dashboard" style="display:inline-block;background:#4f6ef7;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
                Open the platform →
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#64748b;">
                — Max Uzarek, Co-founder &amp; CEO<br>
                <a href="mailto:max@velox.ai" style="color:#4f6ef7;">max@velox.ai</a>
              </p>
            </td></tr>
          </table>
        </body></html>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist]", err);
    return NextResponse.json({ ok: true }); // always succeed to the user
  }
}
