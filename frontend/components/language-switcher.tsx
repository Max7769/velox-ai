"use client";
import { useTranslation, type Language } from "@/lib/i18n";

const LANGS: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "pl", label: "Polski",  flag: "PL" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {LANGS.map(({ code, flag }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className="px-2 py-1 rounded text-[10px] font-semibold tracking-wider transition-all"
          style={lang === code
            ? { background: "var(--brand)", color: "#fff" }
            : { color: "#475569" }
          }
          aria-label={code === "en" ? "Switch to English" : "Przełącz na język polski"}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
