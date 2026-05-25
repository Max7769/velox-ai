"use client";
import { useEffect, useState } from "react";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { group: "Global",
    items: [
      { keys: ["Ctrl", "K"], desc: "Open command palette" },
      { keys: ["?"],         desc: "Show keyboard shortcuts" },
      { keys: ["Esc"],       desc: "Close modal / go back" },
    ]
  },
  { group: "Submissions list",
    items: [
      { keys: ["j", "k"],   desc: "Move cursor up / down" },
      { keys: ["↵"],        desc: "Open selected submission" },
      { keys: ["x"],        desc: "Toggle row selection" },
      { keys: ["/"],        desc: "Focus search" },
    ]
  },
  { group: "Submission detail",
    items: [
      { keys: ["A"],        desc: "Accept submission" },
      { keys: ["D"],        desc: "Decline submission" },
      { keys: ["1", "2", "3"], desc: "Switch tabs (Overview / AI / Premium)" },
    ]
  },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "?") setOpen(o => !o);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 text-slate-600 hover:text-slate-400 transition-colors rounded-lg hover:bg-white/5"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={14} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-96 rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <Keyboard size={14} className="text-slate-400" />
                <span className="text-sm font-semibold text-white">Keyboard shortcuts</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-400 transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {SHORTCUTS.map(group => (
                <div key={group.group}>
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">{group.group}</p>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <div key={item.desc} className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{item.desc}</span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((k, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {i > 0 && <span className="text-slate-700 text-[10px]">/</span>}
                              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                {k}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] text-slate-700 text-center">Press <kbd className="font-mono text-slate-600">?</kbd> to toggle this panel</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
