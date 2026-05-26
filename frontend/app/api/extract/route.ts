import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a senior Lloyd's of London insurance underwriter with 20+ years of experience across marine, cyber, D&O, property, crime, and professional indemnity lines. You extract structured risk data from submission documents with extreme precision.`;

const PROMPT = `Analyse the following insurance submission document and extract structured data.

Return ONLY a valid JSON object with EXACTLY these fields (use null if information is not present):

{
  "insured_name":     string | null,
  "coverage_type":    string | null,
  "coverage_limit":   string | null,
  "premium_estimate": string | null,
  "industry":         string | null,
  "effective_date":   string | null,
  "jurisdiction":     string | null,
  "employees":        string | null,
  "revenue":          string | null,
  "naics_code":       string | null,
  "loss_history":     string | null,
  "risk_factors":     string[],
  "confidence_score": number,
  "score":            number
}

Rules:
- coverage_type must be one of: Marine Cargo, Cyber Liability, D&O Liability, Professional Indemnity, Property, Crime, Marine Hull, Aviation, Energy, Other
- risk_factors: 2–6 concise phrases (max 12 words each), specific not generic
- confidence_score: 0.0–1.0, reflecting completeness of extraction
- score: integer 0–100, risk appetite score (higher = better risk, lower = higher risk)
- Include currency symbols in monetary values (e.g. "£5,000,000")
- Return ONLY valid JSON. No markdown code fences, no explanation.

Document:
---
{DOCUMENT}
---`;

function deriveScore(extracted: Record<string, unknown>): number {
  let score = 70;
  const lh = ((extracted.loss_history as string) ?? "").toLowerCase();
  if (lh.includes("no claims") || lh.includes("clean") || lh.includes("no claim")) score += 15;
  else if (lh.includes("claim")) score -= 10;
  if (lh.includes("fraud")) score -= 15;
  if (lh.includes("frequency") || lh.includes("multiple claims")) score -= 8;
  const rf = Array.isArray(extracted.risk_factors) ? extracted.risk_factors.length : 0;
  score -= rf * 4;
  const conf = typeof extracted.confidence_score === "number" ? extracted.confidence_score : 0.5;
  if (conf < 0.65) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    let text = "";
    try { text = await file.text(); } catch { text = ""; }
    if (!text.trim()) return NextResponse.json({ error: "Could not read file text. Ensure the file is a text-based PDF or Word document." }, { status: 422 });

    const truncated = text.slice(0, 14_000);

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      temperature: 0,
      system: SYSTEM,
      messages: [{ role: "user", content: PROMPT.replace("{DOCUMENT}", truncated) }],
    });

    let raw = (msg.content[0] as { text: string }).text.trim();
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
      extracted = JSON.parse(match[0]);
    }

    if (!Array.isArray(extracted.risk_factors)) extracted.risk_factors = [];
    const score = typeof extracted.score === "number" ? extracted.score : deriveScore(extracted);

    const id = `VLX-${Date.now().toString().slice(-4)}`;
    const decision = score >= 70 ? "accepted" : score >= 45 ? "referred" : "declined";

    return NextResponse.json({
      id,
      score,
      status: decision,
      file_name: file.name,
      ...extracted,
    });
  } catch (err) {
    console.error("[/api/extract]", err);
    return NextResponse.json({ error: "Extraction failed. Check your Anthropic API key." }, { status: 500 });
  }
}
