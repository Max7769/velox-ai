"use client";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </LanguageProvider>
  );
}
