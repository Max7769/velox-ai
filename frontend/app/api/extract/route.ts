import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const text = await file.text();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert insurance underwriter. Extract structured data from this insurance submission.

Return ONLY a JSON object with these fields:
- insured_name, coverage_type, coverage_limit, premium_estimate, industry, effective_date
- loss_history (string summary)
- risk_factors (array of strings)
- confidence_score (0-1 float)
- score (integer 0-100, risk appetite score: higher = better risk)

Document:
${text}`,
        },
      ],
    });

    const raw = (message.content[0] as { text: string }).text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const extracted = JSON.parse(raw);
    const id = `VLX-${Date.now().toString().slice(-4)}`;

    return NextResponse.json({ id, ...extracted });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
