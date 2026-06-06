import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PLANS: Record<string, { priceId: string; name: string }> = {
  starter:    { priceId: process.env.STRIPE_PRICE_STARTER    ?? "", name: "Starter"    },
  growth:     { priceId: process.env.STRIPE_PRICE_GROWTH     ?? "", name: "Growth"     },
  enterprise: { priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? "", name: "Enterprise" },
};

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "placeholder" || !key.startsWith("sk_")) return null;
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const { plan, email, annual } = await req.json() as {
      plan: string; email?: string; annual?: boolean;
    };

    const planConfig = PLANS[plan];
    if (!planConfig?.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price: planConfig.priceId,
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { plan, annual: String(annual ?? false) },
      },
      success_url: `${baseUrl}/dashboard?checkout=success&plan=${plan}`,
      cancel_url:  `${baseUrl}/?checkout=cancelled`,
      metadata: { plan },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Checkout session creation failed" }, { status: 500 });
  }
}
