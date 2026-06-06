import type { Submission, TeamMember, AppetiteRule, AnalyticsData, AuditEntry, BrokerStat } from "./types";

/* ── Deterministic seeded PRNG (LCG) ─────────────────────────────
   Replaces Math.random() so analytics charts are stable across
   page reloads. Seed 42 produces a realistic-looking 30-day curve.
──────────────────────────────────────────────────────────────────── */
function seededRNG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const rng = seededRNG(42);

/* ══════════════════════════════════════════════════════════════════
   SUBMISSIONS  (11 records — covers 6 coverage classes)
═══════════════════════════════════════════════════════════════════ */
export const mockSubmissions: Submission[] = [

  /* ── VLX-0041 · Marine Cargo · Accepted ──────────────────────── */
  {
    id: "VLX-0041", broker_name: "James Harwick", broker_email: "j.harwick@aon.co.uk", broker_company: "Aon UK",
    status: "accepted", score: 82, file_name: "harwick-shipping-submission.pdf",
    notes: "Strong risk profile. Clean loss history. Recommend standard premium.",
    created_at: "2026-05-25T09:12:00Z", processed_at: "2026-05-25T09:20:00Z",
    decision_at: "2026-05-25T09:35:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "Harwick Shipping Ltd", coverage_type: "Marine Cargo",
      coverage_limit: "£5,000,000", premium_estimate: "£43,500", industry: "Shipping & Logistics",
      effective_date: "01 Jun 2026", jurisdiction: "England & Wales", employees: "340", revenue: "£28M",
      loss_history: "No claims in the past 5 years. One minor incident in 2019, settled below excess.",
      risk_factors: ["High-value cargo routes through Suez Canal", "Refrigerated goods requiring temperature monitoring"],
      confidence_score: 0.94,
      score_factors: [
        { label: "Loss history",        impact: +22, detail: "No material claims in 5 years — well below class average" },
        { label: "Industry profile",    impact: +14, detail: "Shipping & Logistics — established appetite class" },
        { label: "Management quality",  impact: +12, detail: "Experienced board, ISO 9001 certified" },
        { label: "Financial strength",  impact: +9,  detail: "Stable revenue trajectory, low leverage" },
        { label: "Limit adequacy",      impact: +8,  detail: "£5M limit proportionate to declared revenue" },
        { label: "Route concentration", impact: -9,  detail: "Suez Canal exposure adds CAT aggregation risk" },
        { label: "Cargo perishability", impact: -6,  detail: "Refrigerated goods increase spoilage claims probability" },
      ],
      premium_model: { base: 42000, low: 38000, mid: 43500, high: 51000, currency: "GBP", basis: "Annual flat rate on declared value" },
    },
  },

  /* ── VLX-0040 · Cyber Liability · Referred ───────────────────── */
  {
    id: "VLX-0040", broker_name: "Sarah Chen", broker_email: "s.chen@howden.com", broker_company: "Howden",
    status: "referred", score: 61, file_name: "nexus-tech-cyber.pdf", notes: null,
    created_at: "2026-05-25T08:51:00Z", processed_at: "2026-05-25T09:01:00Z",
    decision_at: null, decision_by: null,
    extracted_data: {
      insured_name: "Nexus Tech Partners", coverage_type: "Cyber Liability",
      coverage_limit: "£10,000,000", premium_estimate: "£98,000", industry: "Technology",
      effective_date: "15 Jun 2026", jurisdiction: "England & Wales", employees: "1,200", revenue: "£85M",
      loss_history: "One cyber claim in 2023 for £180,000 following a phishing attack.",
      risk_factors: ["Prior cyber claim", "Large remote workforce with BYOD policy", "SaaS platform with 3rd-party integrations", "Coverage gap 2021–2022"],
      confidence_score: 0.88,
      score_factors: [
        { label: "Prior cyber claim",       impact: -18, detail: "£180K claim in 2023 — within 3-year lookback window" },
        { label: "Coverage gap",            impact: -12, detail: "Uninsured period 2021–2022 creates unknown exposure" },
        { label: "3rd-party integrations",  impact: -9,  detail: "Supply chain / API integrations expand attack surface" },
        { label: "BYOD policy",             impact: -10, detail: "Bring-your-own-device increases endpoint attack surface" },
        { label: "Limit adequacy",          impact: -7,  detail: "£10M limit may be insufficient for scale of operations" },
        { label: "Revenue scale",           impact: +14, detail: "£85M revenue — demonstrates mature business controls" },
        { label: "Industry segment",        impact: +8,  detail: "B2B SaaS — moderate systemic risk" },
      ],
      premium_model: { base: 95000, low: 88000, mid: 98000, high: 118000, currency: "GBP", basis: "Annual premium — incident response sublimit £500K" },
    },
  },

  /* ── VLX-0039 · Prof. Indemnity · Processing ─────────────────── */
  {
    id: "VLX-0039", broker_name: "Tom Walsh", broker_email: "t.walsh@marsh.com", broker_company: "Marsh",
    status: "processing", score: null, file_name: "albion-pi-submission.docx", notes: null,
    created_at: "2026-05-25T08:34:00Z", processed_at: null, decision_at: null, decision_by: null,
    extracted_data: null,
  },

  /* ── VLX-0038 · Marine Cargo · Declined ──────────────────────── */
  {
    id: "VLX-0038", broker_name: "Emma Davis", broker_email: "e.davis@wtw.com", broker_company: "WTW",
    status: "declined", score: 29, file_name: "fairlane-marine.pdf",
    notes: "High claims frequency. Outside appetite. Recommend specialist market.",
    created_at: "2026-05-24T16:20:00Z", processed_at: "2026-05-24T16:31:00Z",
    decision_at: "2026-05-24T16:45:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "Fairlane Logistics", coverage_type: "Marine Cargo",
      coverage_limit: "£2,000,000", premium_estimate: "£78,000", industry: "Logistics",
      effective_date: "01 Jun 2026", jurisdiction: "Scotland", employees: "95", revenue: "£12M",
      loss_history: "4 claims in 3 years totalling £420,000. Claim frequency 3.2× market average.",
      risk_factors: ["High claim frequency", "Inadequate cargo securing procedures", "Routes through high-piracy zones", "No surveyor approval for high-value shipments"],
      confidence_score: 0.91,
      score_factors: [
        { label: "Claims frequency",    impact: -28, detail: "4 claims in 36 months — 3.2× market average frequency" },
        { label: "Claims severity",     impact: -15, detail: "£420K aggregate — 21% of limit over 3 years" },
        { label: "Piracy exposure",     impact: -12, detail: "Gulf of Aden / Indian Ocean routes flagged as high-risk" },
        { label: "Cargo controls",      impact: -10, detail: "No approved surveyor for high-value consignments" },
        { label: "Business size",       impact: +6,  detail: "SME — manageable aggregate exposure" },
        { label: "Revenue trajectory",  impact: +4,  detail: "Revenue growth 15% YoY — improving fundamentals" },
      ],
      premium_model: { base: 38000, low: 62000, mid: 78000, high: 95000, currency: "GBP", basis: "Indicative only — outside current appetite" },
    },
  },

  /* ── VLX-0037 · D&O Liability · Accepted ─────────────────────── */
  {
    id: "VLX-0037", broker_name: "Priya Patel", broker_email: "p.patel@aon.co.uk", broker_company: "Aon UK",
    status: "accepted", score: 78, file_name: "summit-healthcare-do.pdf",
    notes: "Solid D&O risk. Board composition strong. CFO departure noted — standard covenant.",
    created_at: "2026-05-24T11:05:00Z", processed_at: "2026-05-24T11:18:00Z",
    decision_at: "2026-05-24T11:40:00Z", decision_by: "Osk",
    extracted_data: {
      insured_name: "Summit Healthcare", coverage_type: "D&O Liability",
      coverage_limit: "£15,000,000", premium_estimate: "£124,000", industry: "Healthcare",
      effective_date: "01 Jul 2026", jurisdiction: "England & Wales", employees: "2,100", revenue: "£190M",
      loss_history: "No D&O claims in 7-year history.",
      risk_factors: ["Regulatory environment tightening in private healthcare", "Recent CFO departure"],
      confidence_score: 0.92,
      score_factors: [
        { label: "Loss history",        impact: +24, detail: "Zero D&O claims in 7 years — exceptional record" },
        { label: "Board composition",   impact: +16, detail: "3 independent NEDs, Audit & Risk Committee active" },
        { label: "Revenue scale",       impact: +10, detail: "£190M revenue — strong balance sheet" },
        { label: "Jurisdiction",        impact: +8,  detail: "England & Wales — well-defined legal framework" },
        { label: "Limit concentration", impact: +5,  detail: "£15M limit appropriate for turnover" },
        { label: "CFO departure",       impact: -14, detail: "Recent CFO resignation — regulatory scrutiny risk" },
        { label: "Regulatory exposure", impact: -11, detail: "CQC oversight increasing post-pandemic" },
      ],
      premium_model: { base: 120000, low: 110000, mid: 124000, high: 145000, currency: "GBP", basis: "Side A + B, 12-month policy period" },
    },
  },

  /* ── VLX-0036 · Property · Accepted ──────────────────────────── */
  {
    id: "VLX-0036", broker_name: "Tom Walsh", broker_email: "t.walsh@marsh.com", broker_company: "Marsh",
    status: "accepted", score: 85, file_name: "kestrel-energy-property.pdf", notes: null,
    created_at: "2026-05-23T14:30:00Z", processed_at: "2026-05-23T14:42:00Z",
    decision_at: "2026-05-23T15:00:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "Kestrel Energy", coverage_type: "Property",
      coverage_limit: "£25,000,000", premium_estimate: "£188,000", industry: "Energy",
      effective_date: "15 Jun 2026", jurisdiction: "England & Wales", employees: "520", revenue: "£340M",
      loss_history: "No property claims in 10 years.",
      risk_factors: ["Offshore wind installation exposure — PML assessment attached"],
      confidence_score: 0.96,
      score_factors: [
        { label: "Loss history",        impact: +26, detail: "No claims in 10 years — top decile performance" },
        { label: "Risk engineering",    impact: +18, detail: "Annual loss prevention surveys completed, BREEAM A-rated" },
        { label: "Revenue strength",    impact: +14, detail: "£340M revenue — investment grade credit quality" },
        { label: "Business continuity", impact: +12, detail: "Fully tested BCP in place, dual power feed" },
        { label: "Limit vs. TIV",       impact: +8,  detail: "£25M limit conservative relative to total insured value" },
        { label: "Offshore exposure",   impact: -10, detail: "Offshore wind CAT exposure — PML assessment provided" },
      ],
      premium_model: { base: 185000, low: 172000, mid: 188000, high: 210000, currency: "GBP", basis: "All risks property, 12-month, subject to survey" },
    },
  },

  /* ── VLX-0035 · Marine Cargo · Declined ──────────────────────── */
  {
    id: "VLX-0035", broker_name: "Lars Hansen", broker_email: "l.hansen@howden.com", broker_company: "Howden",
    status: "declined", score: 31, file_name: "nordic-shipping.pdf",
    notes: "Outside appetite — Arctic routes. Refer to specialist polar market.",
    created_at: "2026-05-23T10:15:00Z", processed_at: "2026-05-23T10:28:00Z",
    decision_at: "2026-05-23T10:50:00Z", decision_by: "Osk",
    extracted_data: {
      insured_name: "Nordic Shipping AS", coverage_type: "Marine Cargo",
      coverage_limit: "£8,000,000", premium_estimate: "£140,000", industry: "Shipping",
      effective_date: "01 Jul 2026", jurisdiction: "Norway", employees: "215", revenue: "£62M",
      loss_history: "3 claims in 4 years including one major salvage operation in 2023.",
      risk_factors: ["Arctic route exposure", "Ice-class cargo handling", "Limited salvage infrastructure", "High claim severity history"],
      confidence_score: 0.89,
      score_factors: [
        { label: "Arctic routes",          impact: -24, detail: "Northern Sea Route — outside published appetite guidelines" },
        { label: "Salvage history",        impact: -20, detail: "Major salvage operation in 2023 — high severity indicator" },
        { label: "Claims frequency",       impact: -14, detail: "3 claims / 4 years above class benchmark" },
        { label: "Salvage infrastructure", impact: -10, detail: "Limited SAR coverage in Arctic waters" },
        { label: "Revenue scale",          impact: +8,  detail: "£62M revenue — established operator" },
        { label: "Ice-class vessels",      impact: +6,  detail: "Vessels properly certified for route — partial mitigant" },
      ],
      premium_model: { base: 75000, low: 115000, mid: 140000, high: 170000, currency: "GBP", basis: "Indicative — specialist polar market referral recommended" },
    },
  },

  /* ── VLX-0034 · Crime · Referred ─────────────────────────────── */
  {
    id: "VLX-0034", broker_name: "James Harwick", broker_email: "j.harwick@aon.co.uk", broker_company: "Aon UK",
    status: "referred", score: 55, file_name: "apex-financial-crime.pdf", notes: null,
    created_at: "2026-05-22T09:00:00Z", processed_at: "2026-05-22T09:14:00Z",
    decision_at: null, decision_by: null,
    extracted_data: {
      insured_name: "Apex Financial Group", coverage_type: "Crime",
      coverage_limit: "£5,000,000", premium_estimate: "£51,000", industry: "Financial Services",
      effective_date: "01 Jun 2026", jurisdiction: "England & Wales", employees: "430", revenue: "£55M",
      loss_history: "One internal fraud incident 4 years ago, £90,000. Controls since strengthened.",
      risk_factors: ["Prior fraud incident", "Rapid headcount growth", "Multi-jurisdiction operations"],
      confidence_score: 0.87,
      score_factors: [
        { label: "Prior fraud incident", impact: -16, detail: "£90K internal fraud 4 years ago — within lookback window" },
        { label: "Headcount growth",     impact: -10, detail: "45% headcount growth in 18 months — control gap risk" },
        { label: "Multi-jurisdiction",   impact: -8,  detail: "Operations in 6 jurisdictions — AML complexity" },
        { label: "Enhanced controls",    impact: +18, detail: "Post-incident: dual authorisation, quarterly audits" },
        { label: "Regulatory status",    impact: +12, detail: "FCA regulated, clean supervisory record" },
        { label: "Financial strength",   impact: +10, detail: "£55M revenue, positive cash generation" },
      ],
      premium_model: { base: 48000, low: 44000, mid: 51000, high: 63000, currency: "GBP", basis: "Annual crime policy, fidelity + computer crime sublimit" },
    },
  },

  /* ── VLX-0033 · Professional Indemnity · Accepted ────────────── */
  {
    id: "VLX-0033", broker_name: "Lars Hansen", broker_email: "l.hansen@howden.com", broker_company: "Howden",
    status: "accepted", score: 79, file_name: "lexham-partners-pi.pdf",
    notes: "Strong PI risk. Long-standing firm with excellent complaints record. Standard terms.",
    created_at: "2026-05-22T10:05:00Z", processed_at: "2026-05-22T10:18:00Z",
    decision_at: "2026-05-22T10:40:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "Lexham & Partners LLP", coverage_type: "Professional Indemnity",
      coverage_limit: "£10,000,000", premium_estimate: "£65,000", industry: "Legal Services",
      effective_date: "01 Jul 2026", jurisdiction: "England & Wales", employees: "185", revenue: "£28M",
      loss_history: "One minor claim 6 years ago for £22,000 — drafting error, settled amicably.",
      risk_factors: ["Commercial real estate practice — cyclical exposure", "Two new senior partner hires in Q1 2026"],
      confidence_score: 0.93,
      score_factors: [
        { label: "Loss history",        impact: +20, detail: "One minor claim 6 years ago — well outside lookback window" },
        { label: "Firm tenure",         impact: +16, detail: "22-year operating history — stable client relationships" },
        { label: "Regulatory standing", impact: +14, detail: "SRA regulated, no disciplinary proceedings on record" },
        { label: "Revenue quality",     impact: +10, detail: "£28M fee income, diversified across 8 practice areas" },
        { label: "New partners",        impact: -12, detail: "Two senior partner hires — supervision risk during integration" },
        { label: "CRE exposure",        impact: -9,  detail: "Commercial real estate work correlates with property market cycle" },
      ],
      premium_model: { base: 62000, low: 58000, mid: 65000, high: 78000, currency: "GBP", basis: "Annual aggregate and occurrence, retroactive date 2004" },
    },
  },

  /* ── VLX-0032 · Cyber Liability · Declined ───────────────────── */
  {
    id: "VLX-0032", broker_name: "Emma Davis", broker_email: "e.davis@wtw.com", broker_company: "WTW",
    status: "declined", score: 26, file_name: "medpath-analytics-cyber.pdf",
    notes: "Active security incident at time of submission. Outside appetite until remediation confirmed.",
    created_at: "2026-05-21T14:30:00Z", processed_at: "2026-05-21T14:42:00Z",
    decision_at: "2026-05-21T15:00:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "MedPath Analytics Ltd", coverage_type: "Cyber Liability",
      coverage_limit: "£5,000,000", premium_estimate: "£72,000", industry: "Healthcare Technology",
      effective_date: "01 Jun 2026", jurisdiction: "England & Wales", employees: "280", revenue: "£19M",
      loss_history: "Data breach in Nov 2025 — 42,000 patient records exposed. ICO investigation ongoing.",
      risk_factors: ["Active ICO investigation", "Unsupported legacy EMR system", "Third-party data processor breach", "No cyber incident response retainer"],
      confidence_score: 0.90,
      score_factors: [
        { label: "Active breach",        impact: -30, detail: "ICO investigation open — material known loss possible" },
        { label: "Legacy systems",       impact: -20, detail: "EMR system on Windows Server 2012 R2 — end-of-support" },
        { label: "Patient data scope",   impact: -18, detail: "42,000 sensitive health records exposed — regulatory severity" },
        { label: "No IR retainer",       impact: -10, detail: "No incident response firm on retainer — response delay risk" },
        { label: "3P processor breach",  impact: -8,  detail: "Data processor breach — dual liability exposure" },
        { label: "Revenue scale",        impact: +6,  detail: "£19M revenue — SME, contained aggregate exposure" },
      ],
      premium_model: { base: 34000, low: 55000, mid: 72000, high: 95000, currency: "GBP", basis: "Indicative only — declined pending full remediation" },
    },
  },

  /* ── VLX-0031 · Aviation · Referred ──────────────────────────── */
  {
    id: "VLX-0031", broker_name: "Tom Walsh", broker_email: "t.walsh@marsh.com", broker_company: "Marsh",
    status: "referred", score: 58, file_name: "skylink-charter-aviation.pdf", notes: null,
    created_at: "2026-05-21T09:00:00Z", processed_at: "2026-05-21T09:15:00Z",
    decision_at: null, decision_by: null,
    extracted_data: {
      insured_name: "SkyLink Charter Ltd", coverage_type: "Aviation",
      coverage_limit: "£20,000,000", premium_estimate: "£152,000", industry: "Aviation",
      effective_date: "01 Aug 2026", jurisdiction: "England & Wales", employees: "92", revenue: "£14M",
      loss_history: "One hull loss in 2022 (ATR 42 — £2.1M). No liability claims.",
      risk_factors: ["Mixed fleet age (5–22 years)", "New Eastern European routes", "Hull loss within 4 years", "Seasonal demand concentration"],
      confidence_score: 0.86,
      score_factors: [
        { label: "Hull loss history",     impact: -20, detail: "£2.1M hull loss in 2022 — within 5-year aviation lookback" },
        { label: "Fleet age spread",      impact: -14, detail: "Oldest aircraft 22 years — above specialist market threshold" },
        { label: "New route risk",        impact: -10, detail: "Eastern European routes — unfamiliar ATC and airport standards" },
        { label: "Seasonal concentration",impact: -7,  detail: "70% revenue in Q2-Q3 — cash flow stress in low season" },
        { label: "Pilot training record", impact: +18, detail: "All pilots type-rated, recurrent sim training completed" },
        { label: "Safety management",     impact: +14, detail: "CAA-approved SMS, zero incidents in 2024–2025" },
        { label: "Liability record",      impact: +12, detail: "Zero liability claims in operating history" },
      ],
      premium_model: { base: 145000, low: 138000, mid: 152000, high: 175000, currency: "GBP", basis: "Hull + liability, 12-month, specialist aviation market" },
    },
  },

  /* ── VLX-0030 · Property · Accepted ──────────────────────────── */
  {
    id: "VLX-0030", broker_name: "Priya Patel", broker_email: "p.patel@aon.co.uk", broker_company: "Aon UK",
    status: "accepted", score: 88, file_name: "atlas-retail-park.pdf",
    notes: "Excellent risk. Sprinkled throughout, BREEAM Excellent. Best-in-class property risk.",
    created_at: "2026-05-20T11:00:00Z", processed_at: "2026-05-20T11:14:00Z",
    decision_at: "2026-05-20T11:35:00Z", decision_by: "Osk",
    extracted_data: {
      insured_name: "Atlas Retail Park Ltd", coverage_type: "Property",
      coverage_limit: "£30,000,000", premium_estimate: "£220,000", industry: "Retail Property",
      effective_date: "01 Jul 2026", jurisdiction: "England & Wales", employees: "45", revenue: "£8.4M",
      loss_history: "No property claims in 12-year history. Annual risk engineering surveys completed.",
      risk_factors: ["Retail sector occupancy risk — tenant default", "Single-site concentration"],
      confidence_score: 0.97,
      score_factors: [
        { label: "Loss history",          impact: +28, detail: "Zero claims in 12 years — exceptional risk quality" },
        { label: "Construction quality",  impact: +20, detail: "2016 steel frame, full sprinkler system, BREEAM Excellent" },
        { label: "Risk engineering",      impact: +16, detail: "Annual surveys by appointed loss prevention surveyor" },
        { label: "Occupancy quality",     impact: +10, detail: "85% occupied, anchor tenants Sainsbury's + M&S — covenant strength" },
        { label: "Fire protection",       impact: +12, detail: "Full sprinkler coverage, 24h monitored alarm, 2× access routes" },
        { label: "Tenant default risk",   impact: -10, detail: "Retail sector under structural pressure — residual void risk" },
        { label: "Single-site risk",      impact: -8,  detail: "100% geographic concentration — no portfolio diversification" },
      ],
      premium_model: { base: 215000, low: 205000, mid: 220000, high: 245000, currency: "GBP", basis: "All risks + BI, 12-month, subject to annual survey" },
    },
  },
];

/* ══════════════════════════════════════════════════════════════════
   TEAM
═══════════════════════════════════════════════════════════════════ */
export const mockTeam: TeamMember[] = [
  { id: "1", name: "Max Uzarek",    email: "uzarek.maksymilian@gmail.com", role: "admin",       avatar: null, joined_at: "2026-05-01T00:00:00Z" },
  { id: "2", name: "Osk",           email: "osk@velox.ai",                 role: "admin",       avatar: null, joined_at: "2026-05-01T00:00:00Z" },
  { id: "3", name: "Anna Kowalski", email: "a.kowalski@velox.ai",          role: "underwriter", avatar: null, joined_at: "2026-05-15T00:00:00Z" },
];

/* ══════════════════════════════════════════════════════════════════
   APPETITE RULES
═══════════════════════════════════════════════════════════════════ */
export const mockRules: AppetiteRule[] = [
  { id: "1", coverage_type: "Marine Cargo",          field: "score",        operator: "gt",       value: "70",    action: "accept",  priority: 1, active: true },
  { id: "2", coverage_type: "Marine Cargo",          field: "score",        operator: "lt",       value: "40",    action: "decline", priority: 2, active: true },
  { id: "3", coverage_type: "Cyber Liability",       field: "loss_history", operator: "contains", value: "claim", action: "refer",   priority: 3, active: true },
  { id: "4", coverage_type: "Professional Indemnity",field: "score",        operator: "gt",       value: "75",    action: "accept",  priority: 4, active: true },
  { id: "5", coverage_type: "All",                   field: "score",        operator: "gt",       value: "80",    action: "accept",  priority: 5, active: true },
  { id: "6", coverage_type: "All",                   field: "score",        operator: "lt",       value: "35",    action: "decline", priority: 6, active: true },
  { id: "7", coverage_type: "Aviation",              field: "score",        operator: "lt",       value: "65",    action: "refer",   priority: 7, active: true },
];

/* ══════════════════════════════════════════════════════════════════
   AUDIT LOG — full lifecycle trail for every submission
═══════════════════════════════════════════════════════════════════ */
export const mockAudit: AuditEntry[] = [

  /* VLX-0041 — Marine Cargo, Accepted */
  { id:  "1", submission_id: "VLX-0041", action: "submitted",  actor: "James Harwick (Broker)",  detail: "Document uploaded via broker portal — harwick-shipping-submission.pdf",              created_at: "2026-05-25T09:12:00Z" },
  { id:  "2", submission_id: "VLX-0041", action: "processing", actor: "Velox AI",                 detail: "Document parsed — Marine Cargo SLIP format detected, OCR confidence 99%",           created_at: "2026-05-25T09:12:35Z" },
  { id:  "3", submission_id: "VLX-0041", action: "extracted",  actor: "Velox AI",                 detail: "9 fields extracted · Confidence 94% · Risk score 82/100 · Auto-routed: accept",     created_at: "2026-05-25T09:20:00Z" },
  { id:  "4", submission_id: "VLX-0041", action: "accepted",   actor: "Max",                      detail: "Accepted — strong risk profile, clean 5-year loss history. Standard premium £43,500", created_at: "2026-05-25T09:35:00Z" },

  /* VLX-0040 — Cyber Liability, Referred */
  { id:  "5", submission_id: "VLX-0040", action: "submitted",  actor: "Sarah Chen (Broker)",      detail: "Document uploaded via broker portal — nexus-tech-cyber.pdf",                        created_at: "2026-05-25T08:51:00Z" },
  { id:  "6", submission_id: "VLX-0040", action: "processing", actor: "Velox AI",                 detail: "Document parsed — Cyber liability application detected, 14 pages",                   created_at: "2026-05-25T08:51:40Z" },
  { id:  "7", submission_id: "VLX-0040", action: "extracted",  actor: "Velox AI",                 detail: "9 fields extracted · Confidence 88% · Risk score 61/100 · Referred: prior cyber claim rule triggered", created_at: "2026-05-25T09:01:00Z" },
  { id:  "8", submission_id: "VLX-0040", action: "referred",   actor: "Velox AI",                 detail: "Automatically referred — rule 3: Cyber Liability + loss_history contains 'claim'",   created_at: "2026-05-25T09:01:05Z" },

  /* VLX-0039 — Prof. Indemnity, Processing */
  { id:  "9", submission_id: "VLX-0039", action: "submitted",  actor: "Tom Walsh (Broker)",       detail: "Document uploaded via broker portal — albion-pi-submission.docx",                   created_at: "2026-05-25T08:34:00Z" },
  { id: "10", submission_id: "VLX-0039", action: "processing", actor: "Velox AI",                 detail: "DOCX parsed — PI application detected. Extraction in progress…",                    created_at: "2026-05-25T08:34:45Z" },

  /* VLX-0038 — Marine Cargo, Declined */
  { id: "11", submission_id: "VLX-0038", action: "submitted",  actor: "Emma Davis (Broker)",      detail: "Document uploaded via broker portal — fairlane-marine.pdf",                         created_at: "2026-05-24T16:20:00Z" },
  { id: "12", submission_id: "VLX-0038", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Marine Cargo application, 8 pages, loss history appendix detected",    created_at: "2026-05-24T16:20:40Z" },
  { id: "13", submission_id: "VLX-0038", action: "extracted",  actor: "Velox AI",                 detail: "8 fields extracted · Confidence 91% · Risk score 29/100 · Auto-declined: rule 2",  created_at: "2026-05-24T16:31:00Z" },
  { id: "14", submission_id: "VLX-0038", action: "declined",   actor: "Max",                      detail: "Declined — 4 claims in 3 years, 3.2× market frequency. Outside appetite.",          created_at: "2026-05-24T16:45:00Z" },

  /* VLX-0037 — D&O Liability, Accepted */
  { id: "15", submission_id: "VLX-0037", action: "submitted",  actor: "Priya Patel (Broker)",     detail: "Document uploaded via broker portal — summit-healthcare-do.pdf",                    created_at: "2026-05-24T11:05:00Z" },
  { id: "16", submission_id: "VLX-0037", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — D&O liability application, 22 pages including board register",         created_at: "2026-05-24T11:05:50Z" },
  { id: "17", submission_id: "VLX-0037", action: "extracted",  actor: "Velox AI",                 detail: "9 fields extracted · Confidence 92% · Risk score 78/100 · Auto-routed: accept",    created_at: "2026-05-24T11:18:00Z" },
  { id: "18", submission_id: "VLX-0037", action: "accepted",   actor: "Osk",                      detail: "Accepted — 7-year clean D&O record. CFO departure noted, added standard covenant.", created_at: "2026-05-24T11:40:00Z" },

  /* VLX-0036 — Property, Accepted */
  { id: "19", submission_id: "VLX-0036", action: "submitted",  actor: "Tom Walsh (Broker)",       detail: "Document uploaded via broker portal — kestrel-energy-property.pdf",                 created_at: "2026-05-23T14:30:00Z" },
  { id: "20", submission_id: "VLX-0036", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Property all-risks application + PML schedule detected",               created_at: "2026-05-23T14:30:55Z" },
  { id: "21", submission_id: "VLX-0036", action: "extracted",  actor: "Velox AI",                 detail: "8 fields extracted · Confidence 96% · Risk score 85/100 · Auto-routed: accept",    created_at: "2026-05-23T14:42:00Z" },
  { id: "22", submission_id: "VLX-0036", action: "accepted",   actor: "Max",                      detail: "Accepted — 10-year clean record, BREEAM A-rated. Premium £188,000.",                created_at: "2026-05-23T15:00:00Z" },

  /* VLX-0035 — Marine Cargo, Declined */
  { id: "23", submission_id: "VLX-0035", action: "submitted",  actor: "Lars Hansen (Broker)",     detail: "Document uploaded via broker portal — nordic-shipping.pdf",                         created_at: "2026-05-23T10:15:00Z" },
  { id: "24", submission_id: "VLX-0035", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Marine Cargo, Norwegian registration, Arctic route schedule attached", created_at: "2026-05-23T10:15:50Z" },
  { id: "25", submission_id: "VLX-0035", action: "extracted",  actor: "Velox AI",                 detail: "8 fields extracted · Confidence 89% · Risk score 31/100 · Auto-declined: rule 2",  created_at: "2026-05-23T10:28:00Z" },
  { id: "26", submission_id: "VLX-0035", action: "declined",   actor: "Osk",                      detail: "Declined — Arctic routes outside appetite. Advised referral to specialist polar market.", created_at: "2026-05-23T10:50:00Z" },

  /* VLX-0034 — Crime, Referred */
  { id: "27", submission_id: "VLX-0034", action: "submitted",  actor: "James Harwick (Broker)",   detail: "Document uploaded via broker portal — apex-financial-crime.pdf",                    created_at: "2026-05-22T09:00:00Z" },
  { id: "28", submission_id: "VLX-0034", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Crime/fidelity application, 16 pages, loss run attached",              created_at: "2026-05-22T09:00:55Z" },
  { id: "29", submission_id: "VLX-0034", action: "extracted",  actor: "Velox AI",                 detail: "8 fields extracted · Confidence 87% · Risk score 55/100 · Referred: borderline score + prior fraud incident", created_at: "2026-05-22T09:14:00Z" },
  { id: "30", submission_id: "VLX-0034", action: "referred",   actor: "Velox AI",                 detail: "Referred for senior underwriter review — prior fraud incident within lookback window", created_at: "2026-05-22T09:14:10Z" },

  /* VLX-0033 — Professional Indemnity, Accepted */
  { id: "31", submission_id: "VLX-0033", action: "submitted",  actor: "Lars Hansen (Broker)",     detail: "Document uploaded via broker portal — lexham-partners-pi.pdf",                      created_at: "2026-05-22T10:05:00Z" },
  { id: "32", submission_id: "VLX-0033", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Professional Indemnity slip, 11 pages, fee income schedule included",  created_at: "2026-05-22T10:05:50Z" },
  { id: "33", submission_id: "VLX-0033", action: "extracted",  actor: "Velox AI",                 detail: "9 fields extracted · Confidence 93% · Risk score 79/100 · Auto-routed: accept (rule 4)", created_at: "2026-05-22T10:18:00Z" },
  { id: "34", submission_id: "VLX-0033", action: "accepted",   actor: "Max",                      detail: "Accepted — 22-year firm, clean SRA record. Premium £65,000. Standard wording.",     created_at: "2026-05-22T10:40:00Z" },

  /* VLX-0032 — Cyber Liability, Declined */
  { id: "35", submission_id: "VLX-0032", action: "submitted",  actor: "Emma Davis (Broker)",      detail: "Document uploaded via broker portal — medpath-analytics-cyber.pdf",                 created_at: "2026-05-21T14:30:00Z" },
  { id: "36", submission_id: "VLX-0032", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Cyber application, 9 pages, ICO correspondence attached",              created_at: "2026-05-21T14:30:45Z" },
  { id: "37", submission_id: "VLX-0032", action: "extracted",  actor: "Velox AI",                 detail: "9 fields extracted · Confidence 90% · Risk score 26/100 · Auto-declined: active regulatory investigation", created_at: "2026-05-21T14:42:00Z" },
  { id: "38", submission_id: "VLX-0032", action: "declined",   actor: "Max",                      detail: "Declined — ICO investigation open, active breach. Resubmit post-remediation with clean certificate.", created_at: "2026-05-21T15:00:00Z" },

  /* VLX-0031 — Aviation, Referred */
  { id: "39", submission_id: "VLX-0031", action: "submitted",  actor: "Tom Walsh (Broker)",       detail: "Document uploaded via broker portal — skylink-charter-aviation.pdf",                created_at: "2026-05-21T09:00:00Z" },
  { id: "40", submission_id: "VLX-0031", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Aviation hull + liability application, 18 pages, fleet schedule attached", created_at: "2026-05-21T09:00:50Z" },
  { id: "41", submission_id: "VLX-0031", action: "extracted",  actor: "Velox AI",                 detail: "9 fields extracted · Confidence 86% · Risk score 58/100 · Referred: rule 7 — Aviation < 65", created_at: "2026-05-21T09:15:00Z" },
  { id: "42", submission_id: "VLX-0031", action: "referred",   actor: "Velox AI",                 detail: "Referred to specialist aviation underwriter — hull loss + mixed fleet age requires senior review", created_at: "2026-05-21T09:15:10Z" },

  /* VLX-0030 — Property, Accepted */
  { id: "43", submission_id: "VLX-0030", action: "submitted",  actor: "Priya Patel (Broker)",     detail: "Document uploaded via broker portal — atlas-retail-park.pdf",                       created_at: "2026-05-20T11:00:00Z" },
  { id: "44", submission_id: "VLX-0030", action: "processing", actor: "Velox AI",                 detail: "PDF parsed — Property all-risks, 14 pages, BREEAM certificate + survey reports",   created_at: "2026-05-20T11:00:55Z" },
  { id: "45", submission_id: "VLX-0030", action: "extracted",  actor: "Velox AI",                 detail: "9 fields extracted · Confidence 97% · Risk score 88/100 · Auto-routed: accept (rule 5)", created_at: "2026-05-20T11:14:00Z" },
  { id: "46", submission_id: "VLX-0030", action: "accepted",   actor: "Osk",                      detail: "Accepted — best-in-class property risk. Zero claims 12 years. Premium £220,000.",   created_at: "2026-05-20T11:35:00Z" },
];

/* ══════════════════════════════════════════════════════════════════
   BROKER STATS  (accurate against all 11 submissions above)
═══════════════════════════════════════════════════════════════════ */
export const mockBrokerStats: BrokerStat[] = [
  // VLX-0041 (acc 82, £43.5K), VLX-0037 (acc 78, £124K), VLX-0034 (ref 55), VLX-0030 (acc 88, £220K)
  { company: "Aon UK",  submissions: 4, accepted: 3, declined: 0, referred: 1, gwp: 387500, avgScore: 76, bindRate: 75 },
  // VLX-0040 (ref 61), VLX-0035 (dec 31), VLX-0033 (acc 79, £65K)
  { company: "Howden",  submissions: 3, accepted: 1, declined: 1, referred: 1, gwp:  65000, avgScore: 57, bindRate: 33 },
  // VLX-0039 (proc -), VLX-0036 (acc 85, £188K), VLX-0031 (ref 58)
  { company: "Marsh",   submissions: 3, accepted: 1, declined: 0, referred: 1, gwp: 188000, avgScore: 72, bindRate: 50 },
  // VLX-0038 (dec 29), VLX-0032 (dec 26)
  { company: "WTW",     submissions: 2, accepted: 0, declined: 2, referred: 0, gwp:       0, avgScore: 28, bindRate:  0 },
];

/* ══════════════════════════════════════════════════════════════════
   ANALYTICS  (30-day daily data — deterministic, never re-randomises)
═══════════════════════════════════════════════════════════════════ */
export const mockAnalytics: AnalyticsData[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2026-05-25");
  d.setDate(d.getDate() - (29 - i));
  const total    = Math.floor(rng() * 12) + 6;
  const accepted = Math.floor(total * (0.48 + rng() * 0.14));
  const declined = Math.floor(total * (0.18 + rng() * 0.10));
  const referred = total - accepted - declined;
  const gwp      = accepted * (Math.floor(rng() * 120000) + 40000);
  return { date: d.toISOString().slice(0, 10), total, accepted, declined, referred, gwp };
});
