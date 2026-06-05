"use client";
/**
 * Wraps Clerk's UserButton with a graceful fallback when Clerk is not configured.
 * In demo/dev mode renders a static avatar; in production Clerk handles auth.
 */

import dynamic from "next/dynamic";

const ClerkUserButton = dynamic(
  () => import("@clerk/nextjs").then(m => {
    const Button = () => (
      <m.UserButton
        appearance={{
          elements: {
            avatarBox:      "w-6 h-6",
            userButtonPopup: { background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" },
          },
          variables: {
            colorPrimary:    "#4f6ef7",
            colorBackground: "#0d1526",
            colorText:       "#f1f5f9",
          },
        }}
      />
    );
    Button.displayName = "ClerkUserButton";
    return Button;
  }),
  { ssr: false },
);

const hasClerk = Boolean(
  typeof window !== "undefined"
    ? (window as Window & { __clerk_pk__?: string }).__clerk_pk__
    : process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function UserButton({ name = "M", email = "" }: { name?: string; email?: string }) {
  const initials = name.slice(0, 1).toUpperCase();

  if (hasClerk || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ClerkUserButton />;
  }

  // Fallback static avatar (demo mode)
  return (
    <div
      title={email || name}
      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 cursor-default select-none"
      style={{ background: "var(--brand)" }}
    >
      {initials}
    </div>
  );
}
