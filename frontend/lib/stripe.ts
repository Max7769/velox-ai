"use client";

export async function startCheckout(plan: string, email?: string, annual = false) {
  const res = await fetch("/api/stripe/checkout", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ plan, email, annual }),
  });

  if (!res.ok) {
    // Stripe not configured — open a Calendly/contact link instead
    window.open("mailto:uzarek.maksymilian@gmail.com?subject=Velox AI — pricing enquiry", "_blank");
    return;
  }

  const { url } = await res.json() as { url?: string };
  if (url) window.location.href = url;
}
