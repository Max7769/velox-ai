import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velox AI — Insurance Submission Platform",
  description: "AI-powered submission intake for the Lloyd's market",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
