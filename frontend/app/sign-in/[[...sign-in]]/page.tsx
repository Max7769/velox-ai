import { SignIn } from "@clerk/nextjs";
import { Zap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand)" }}>
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-white font-semibold tracking-tight">Velox AI</p>
          <p className="text-slate-600 text-xs">Underwriting Platform</p>
        </div>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorBackground: "#0d1526",
            colorText: "#f1f5f9",
            colorTextSecondary: "#94a3b8",
            colorInputBackground: "rgba(255,255,255,0.04)",
            colorInputText: "#f1f5f9",
            colorPrimary: "#4f6ef7",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
          },
          elements: {
            card: { boxShadow: "0 0 0 1px rgba(255,255,255,0.08)", background: "#0d1526" },
            headerTitle: { color: "#f1f5f9", fontSize: "1.1rem", fontWeight: "600" },
            headerSubtitle: { color: "#94a3b8" },
            formButtonPrimary: { background: "#4f6ef7", "&:hover": { background: "#3b5bdb" } },
            footerActionLink: { color: "#818cf8" },
          },
        }}
      />
    </div>
  );
}
