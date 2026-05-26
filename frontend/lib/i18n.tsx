"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "en" | "pl";

const T = {
  en: {
    // Nav
    "nav.dashboard":      "Dashboard",
    "nav.newSubmission":  "New Submission",
    "nav.submissions":    "Submissions",
    "nav.analytics":      "Analytics",
    "nav.exposure":       "Exposure",
    "nav.settings":       "Settings",
    "nav.brokerPortal":   "Broker portal",
    "nav.administrator":  "Administrator",
    "nav.pipeline":       "Pipeline",
    "nav.reports":        "Reports",

    // Common actions / labels
    "common.search":      "Search",
    "common.loading":     "Loading",
    "common.viewAll":     "View all",
    "common.refresh":     "Refresh",
    "common.total":       "total",
    "common.shown":       "shown",
    "common.online":      "Online",
    "common.live":        "Live",
    "common.selected":    "selected",
    "common.all":         "all",
    "common.newSub":      "New submission",
    "common.navigate":    "navigate",
    "common.open":        "open",
    "common.select":      "select",
    "common.search_hint": "search",
    "common.vsLastMonth": "vs last month",
    "common.demoData":    "Demo data",
    "common.docs":        "docs",

    // Statuses
    "status.all":        "All",
    "status.accepted":   "Accepted",
    "status.declined":   "Declined",
    "status.referred":   "Referred",
    "status.processing": "Processing",

    // Dashboard page
    "dash.greetMorning":    "Good morning",
    "dash.greetAfternoon":  "Good afternoon",
    "dash.greetEvening":    "Good evening",
    "dash.queueClear":      "Your queue is clear.",
    "dash.awaitDecision":   "submission awaiting your decision.",
    "dash.awaitDecisions":  "submissions awaiting your decision.",
    "dash.processing":      "processing",
    "dash.needsDecision":   "Needs your decision",
    "dash.recentSubs":      "Recent submissions",
    "dash.topBrokers":      "Top brokers",
    "dash.activity":        "Activity",
    "dash.aiEngine":        "AI engine",
    "dash.model":           "Model",
    "dash.avgConf":         "Avg conf.",
    "dash.processed":       "Processed",

    // Metric cards
    "metrics.today":       "Submissions today",
    "metrics.avgTime":     "Avg processing time",
    "metrics.bindRate":    "Bind rate",
    "metrics.monthlyVol":  "Monthly volume",

    // Table headers
    "table.id":       "ID",
    "table.insured":  "Insured",
    "table.type":     "Type",
    "table.coverage": "Coverage type",
    "table.broker":   "Broker",
    "table.date":     "Date",
    "table.score":    "Risk score",
    "table.status":   "Status",
    "table.submitted":"Submitted",

    // Submissions page
    "sub.noSubs":       "No submissions yet. Upload a document to get started.",
    "sub.noMatch":      "No submissions match your filter.",
    "sub.loading":      "Loading submissions…",
    "sub.placeholder":  "Search… (press /)",
    "sub.acceptAll":    "Accept all",
    "sub.declineAll":   "Decline all",
    "sub.bulkFailed":   "Bulk action failed",

    // Analytics page
    "ana.title":        "Analytics",
    "ana.subtitle":     "Performance overview — Lloyd’s MGA dashboard",
    "ana.gwp":          "Gross Written Premium",
    "ana.vol30":        "30-day volume",
    "ana.bindRate":     "Bind rate",
    "ana.avgPremium":   "Avg premium per bind",
    "ana.avgTime":      "Avg processing time",
    "ana.pending":      "Pending review",
    "ana.gwpLabel":     "GWP (£K)",
    "ana.volLabel":     "Volume",
    "ana.mainChart":    "Submission volume & GWP",
    "ana.last":         "Last",
    "ana.lossRatio":    "Loss ratio tracker",
    "ana.target":       "Target: 60%",
    "ana.funnel":       "Conversion funnel",
    "ana.byCoverage":   "By coverage type",
    "ana.classBiz":     "Class of business",
    "ana.brokerMatrix": "Broker performance matrix",
    "ana.decisions":    "Decision breakdown — all time",
    "ana.acceptedSub":  "Accepted submissions",
    "ana.acrossBound":  "Across accepted risks",
    "ana.referredSub":  "Referred submissions",
    "ana.priorPeriod":  "vs prior period",

    // Broker table
    "bk.submissions": "Submissions",
    "bk.accepted":    "Accepted",
    "bk.declined":    "Declined",
    "bk.referred":    "Referred",
    "bk.gwp":         "GWP",
    "bk.avgScore":    "Avg score",
    "bk.bindRate":    "Bind rate",

    // Exposure page
    "exp.title":       "Portfolio Exposure",
    "exp.subtitle":    "Aggregate risk across all active submissions",
    "exp.limitClass":  "Aggregate limit by class",
    "exp.riskQuality": "Risk quality vs appetite",
    "exp.geographic":  "Geographic exposure",
    "exp.scatter":     "Risk score vs premium",
    "exp.table":       "Portfolio exposure table",
    "exp.class":       "Class",
    "exp.limitM":      "Limit (£M)",
    "exp.count":       "Count",
    "exp.gwp":         "GWP (£K)",
    "exp.region":      "Region",
    "exp.exposure":    "Exposure (£M)",

    // Settings
    "set.title":       "Settings",
  },

  pl: {
    // Nav
    "nav.dashboard":      "Panel główny",
    "nav.newSubmission":  "Nowe zgłoszenie",
    "nav.submissions":    "Zgłoszenia",
    "nav.analytics":      "Analityka",
    "nav.exposure":       "Ekspozycja",
    "nav.settings":       "Ustawienia",
    "nav.brokerPortal":   "Portal brokera",
    "nav.administrator":  "Administrator",
    "nav.pipeline":       "Pipeline",
    "nav.reports":        "Raporty",

    // Common
    "common.search":      "Szukaj",
    "common.loading":     "Ładowanie",
    "common.viewAll":     "Pokaż wszystkie",
    "common.refresh":     "Odśwież",
    "common.total":       "łącznie",
    "common.shown":       "wyświetlanych",
    "common.online":      "Online",
    "common.live":        "Na żywo",
    "common.selected":    "wybranych",
    "common.all":         "wszystkie",
    "common.newSub":      "Nowe zgłoszenie",
    "common.navigate":    "nawigacja",
    "common.open":        "otwórz",
    "common.select":      "zaznacz",
    "common.search_hint": "szukaj",
    "common.vsLastMonth": "w stosunku do ub. miesiąca",
    "common.demoData":    "Dane demo",
    "common.docs":        "dokumenty",

    // Statuses
    "status.all":        "Wszystkie",
    "status.accepted":   "Zaakceptowane",
    "status.declined":   "Odrzucone",
    "status.referred":   "Skierowane",
    "status.processing": "Przetwarzane",

    // Dashboard
    "dash.greetMorning":    "Dzień dobry",
    "dash.greetAfternoon":  "Dzień dobry",
    "dash.greetEvening":    "Dobry wieczór",
    "dash.queueClear":      "Twoja kolejka jest pusta.",
    "dash.awaitDecision":   "zgłoszenie oczekuje na decyzję.",
    "dash.awaitDecisions":  "zgłoszeń oczekuje na decyzję.",
    "dash.processing":      "przetwarzane",
    "dash.needsDecision":   "Wymaga decyzji",
    "dash.recentSubs":      "Ostatnie zgłoszenia",
    "dash.topBrokers":      "Czołowi brokerzy",
    "dash.activity":        "Aktywność",
    "dash.aiEngine":        "Silnik AI",
    "dash.model":           "Model",
    "dash.avgConf":         "Śr. pewność",
    "dash.processed":       "Przetworzone",

    // Metric cards
    "metrics.today":       "Zgłoszenia dziś",
    "metrics.avgTime":     "Śr. czas przetwarzania",
    "metrics.bindRate":    "Wskaźnik akceptacji",
    "metrics.monthlyVol":  "Miesięczny wolumen",

    // Table headers
    "table.id":       "ID",
    "table.insured":  "Ubezpieczony",
    "table.type":     "Rodzaj",
    "table.coverage": "Rodzaj ubezpieczenia",
    "table.broker":   "Broker",
    "table.date":     "Data",
    "table.score":    "Ocena ryzyka",
    "table.status":   "Status",
    "table.submitted":"Złożono",

    // Submissions
    "sub.noSubs":       "Brak zgłoszeń. Prześlij dokument, aby rozpocząć.",
    "sub.noMatch":      "Brak zgłoszeń spełniających kryteria filtrowania.",
    "sub.loading":      "Ładowanie zgłoszeń…",
    "sub.placeholder":  "Szukaj… (wciśnij /)",
    "sub.acceptAll":    "Zaakceptuj wszystkie",
    "sub.declineAll":   "Odrzuć wszystkie",
    "sub.bulkFailed":   "Działanie grupowe nie powiodło się",

    // Analytics
    "ana.title":        "Analityka",
    "ana.subtitle":     "Przegląd wyników — Panel MGA Lloyd’s",
    "ana.gwp":          "Składka przypisana brutto",
    "ana.vol30":        "Wolumen 30-dniowy",
    "ana.bindRate":     "Wskaźnik akceptacji",
    "ana.avgPremium":   "Śr. składka na akceptację",
    "ana.avgTime":      "Śr. czas przetwarzania",
    "ana.pending":      "Oczekujące na weryfikację",
    "ana.gwpLabel":     "Składka (tys. £)",
    "ana.volLabel":     "Wolumen",
    "ana.mainChart":    "Wolumen zgłoszeń i składka",
    "ana.last":         "Ostatnie",
    "ana.lossRatio":    "Wskaźnik szkodowości",
    "ana.target":       "Cel: 60%",
    "ana.funnel":       "Lejek konwersji",
    "ana.byCoverage":   "Wg rodzaju ubezpieczenia",
    "ana.classBiz":     "Klasa działalności",
    "ana.brokerMatrix": "Macierz wydajności brokerów",
    "ana.decisions":    "Podział decyzji — od początku",
    "ana.acceptedSub":  "Zaakceptowane zgłoszenia",
    "ana.acrossBound":  "Wśród zaakceptowanych ryzyk",
    "ana.referredSub":  "Zgłoszenia skierowane do weryfikacji",
    "ana.priorPeriod":  "w stosunku do poprzedniego okresu",

    // Broker table
    "bk.submissions": "Zgłoszenia",
    "bk.accepted":    "Zaakceptowane",
    "bk.declined":    "Odrzucone",
    "bk.referred":    "Skierowane",
    "bk.gwp":         "Składka",
    "bk.avgScore":    "Śr. ocena",
    "bk.bindRate":    "Wsk. akceptacji",

    // Exposure
    "exp.title":       "Ekspozycja portfela",
    "exp.subtitle":    "Łączne ryzyko we wszystkich aktywnych zgłoszeniach",
    "exp.limitClass":  "Łączny limit wg klasy",
    "exp.riskQuality": "Jakość ryzyka vs apetyt",
    "exp.geographic":  "Ekspozycja geograficzna",
    "exp.scatter":     "Ocena ryzyka vs składka",
    "exp.table":       "Tabela ekspozycji portfela",
    "exp.class":       "Klasa",
    "exp.limitM":      "Limit (mln £)",
    "exp.count":       "Liczba",
    "exp.gwp":         "Składka (tys. £)",
    "exp.region":      "Region",
    "exp.exposure":    "Ekspozycja (mln £)",

    // Settings
    "set.title":       "Ustawienia",
  },
} as const;

type Keys = keyof typeof T.en;

interface LangCtx {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: Keys) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => T.en[k],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("velox_lang") as Language | null;
    if (stored === "en" || stored === "pl") setLangState(stored);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("velox_lang", l);
  };

  const t = (key: Keys): string => (T[lang] as Record<string, string>)[key] ?? (T.en as Record<string, string>)[key] ?? key;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useTranslation() {
  return useContext(Ctx);
}
