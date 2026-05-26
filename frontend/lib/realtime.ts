"use client";
/**
 * Real-time submission updates.
 *
 * When Supabase is configured → uses postgres_changes channel.
 * When in demo/mock mode      → simulates updates via polling + local state mutations.
 */

import { useEffect, useRef, useCallback } from "react";
import { subscribeToSubmissions, dbMode } from "./db";
import type { Submission } from "./types";

type RealtimeEvent = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  record: Submission;
};

/**
 * Hook that fires `onEvent` whenever a submission is inserted or updated.
 * In demo mode it fires a simulated "processing → accepted/referred" transition
 * for any submission currently in "processing" state.
 */
export function useRealtimeSubmissions(
  submissions: Submission[],
  onEvent: (event: RealtimeEvent) => void,
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const submissionsRef = useRef(submissions);
  submissionsRef.current = submissions;

  // ── Supabase realtime ───────────────────────────────────────────
  useEffect(() => {
    if (dbMode() !== "supabase") return;

    const unsub = subscribeToSubmissions(({ new: record, eventType }) => {
      onEventRef.current({
        eventType: eventType as RealtimeEvent["eventType"],
        record,
      });
    });

    return unsub;
  }, []);

  // ── Demo-mode simulator ─────────────────────────────────────────
  const simulateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSimulation = useCallback(() => {
    if (dbMode() === "supabase") return;

    simulateRef.current = setTimeout(() => {
      const processing = submissionsRef.current.filter(s => s.status === "processing");
      if (processing.length > 0) {
        const target = processing[Math.floor(Math.random() * processing.length)];
        const outcomes: Submission["status"][] = ["accepted", "referred", "declined"];
        const newStatus = outcomes[Math.floor(Math.random() * outcomes.length)];
        const score = newStatus === "accepted" ? 72 + Math.floor(Math.random() * 20)
                    : newStatus === "referred" ? 45 + Math.floor(Math.random() * 20)
                    : 20 + Math.floor(Math.random() * 25);

        onEventRef.current({
          eventType: "UPDATE",
          record: {
            ...target,
            status: newStatus,
            score,
            processed_at: new Date().toISOString(),
            decision_at: newStatus !== "referred" ? new Date().toISOString() : null,
          },
        });
      }
      scheduleSimulation();
    }, 18_000 + Math.random() * 12_000); // 18–30 s
  }, []);

  useEffect(() => {
    scheduleSimulation();
    return () => { if (simulateRef.current) clearTimeout(simulateRef.current); };
  }, [scheduleSimulation]);
}
