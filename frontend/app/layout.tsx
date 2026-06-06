import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://velox.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Velox AI — AI-Powered Insurance Submission Platform",
    template: "%s · Velox AI",
  },
  description:
    "Velox AI automates insurance submission intake for Lloyd's MGAs and coverholders. Extract risk data, score submissions, and deliver underwriting decisions in under 8 minutes.",
  keywords: [
    "insurance submission automation", "Lloyd's MGA platform", "AI underwriting",
    "insurance technology", "coverholder software", "risk scoring",
    "insurance intake", "insurtech", "submission portal",
  ],
  authors: [{ name: "Velox AI Ltd" }],
  creator: "Velox AI Ltd",
  publisher: "Velox AI Ltd",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "Velox AI",
    title: "Velox AI — AI-Powered Insurance Submission Platform",
    description:
      "Automate insurance submission intake for Lloyd's MGAs. Extract, score, and decide in under 8 minutes.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Velox AI Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Velox AI — AI-Powered Insurance Submission Platform",
    description: "Automate insurance submission intake for Lloyd's MGAs and coverholders.",
    images: ["/og-image.png"],
    creator: "@veloxai",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (clerkKey) {
    return <ClerkProvider publishableKey={clerkKey}>{content}</ClerkProvider>;
  }
  return content;
}
