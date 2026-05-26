/* Minimal portal shell — each page controls its own header and layout */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {children}
    </div>
  );
}
