import type { Submission, TeamMember, AppetiteRule, AnalyticsData, AuditEntry, BrokerStat } from "./types";

export const mockSubmissions: Submission[] = [
  {
    id: "VLX-0041", broker_name: "James Harwick", broker_email: "j.harwick@aon.co.uk", broker_company: "Aon UK",
    status: "accepted", score: 82, file_name: "harwick-shipping-submission.pdf",
    notes: "Strong risk profile. Clean loss history. Recommend standard premium.",
    created_at: "2026-05-25T09:12:00Z", processed_at: "2026-05-25T09:20:00Z",
    decision_at: "2026-05-25T09:35:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "Harwick Shipping Ltd", coverage_type: "Marine Cargo",
      coverage_limit: "£5,000,000", premium_estimate: "£42,000", industry: "Shipping & Logistics",
      effective_date: "01 Jun 2026", jurisdiction: "England & Wales", employees: "340", revenue: "£28M",
      loss_history: "No claims in the past 5 years. One minor incident in 2019, settled below excess.",
      risk_factors: ["High-value cargo routes through Suez Canal", "Refrigerated goods requiring temperature monitoring"],
      confidence_score: 0.94,
      score_factors: [
        { label: "Loss history",         impact: +22, detail: "No material claims in 5 years — well below class average" },
        { label: "Industry profile",     impact: +14, detail: "Shipping & Logistics — established appetite class" },
        { label: "Limit adequacy",       impact: +8,  detail: "£5M limit proportionate to declared revenue" },
        { label: "Route concentration",  impact: -9,  detail: "Suez Canal exposure adds CAT aggregation risk" },
        { label: "Cargo perishability",  impact: -6,  detail: "Refrigerated goods increase spoilage claims probability" },
        { label: "Management quality",   impact: +12, detail: "Experienced board, ISO 9001 certified" },
        { label: "Financial strength",   impact: +9,  detail: "Stable revenue trajectory, low leverage" },
      ],
      premium_model: { base: 42000, low: 38000, mid: 43500, high: 51000, currency: "GBP", basis: "Annual flat rate on declared value" },
    },
  },
  {
    id: "VLX-0040", broker_name: "Sarah Chen", broker_email: "s.chen@howden.com", broker_company: "Howden",
    status: "referred", score: 61, file_name: "nexus-tech-cyber.pdf", notes: null,
    created_at: "2026-05-25T08:51:00Z", processed_at: "2026-05-25T09:01:00Z",
    decision_at: null, decision_by: null,
    extracted_data: {
      insured_name: "Nexus Tech Partners", coverage_type: "Cyber Liability",
      coverage_limit: "£10,000,000", premium_estimate: "£95,000", industry: "Technology",
      effective_date: "15 Jun 2026", jurisdiction: "England & Wales", employees: "1,200", revenue: "£85M",
      loss_history: "One cyber claim in 2023 for £180,000 following a phishing attack.",
      risk_factors: ["Prior cyber claim", "Large remote workforce with BYOD policy", "SaaS platform with 3rd-party integrations", "Gap in coverage 2021–2022"],
      confidence_score: 0.88,
      score_factors: [
        { label: "Prior cyber claim",    impact: -18, detail: "£180K claim in 2023 — within 3-year lookback window" },
        { label: "Coverage gap",         impact: -12, detail: "Uninsured period 2021–2022 creates unknown exposure" },
        { label: "BYOD policy",          impact: -10, detail: "Bring-your-own-device increases endpoint attack surface" },
        { label: "Revenue scale",        impact: +14, detail: "£85M revenue — demonstrates mature business controls" },
        { label: "Industry segment",     impact: +8,  detail: "B2B SaaS — moderate systemic risk" },
        { label: "Limit adequacy",       impact: -7,  detail: "£10M limit may be insufficient for scale of operations" },
        { label: "3rd-party integrations", impact: -9, detail: "Supply chain / API integrations expand attack surface" },
      ],
      premium_model: { base: 95000, low: 88000, mid: 98000, high: 118000, currency: "GBP", basis: "Annual premium — incident response sublimit £500K" },
    },
  },
  {
    id: "VLX-0039", broker_name: "Tom Walsh", broker_email: "t.walsh@marsh.com", broker_company: "Marsh",
    status: "processing", score: null, file_name: "albion-pi-submission.docx", notes: null,
    created_at: "2026-05-25T08:34:00Z", processed_at: null, decision_at: null, decision_by: null,
    extracted_data: null,
  },
  {
    id: "VLX-0038", broker_name: "Emma Davis", broker_email: "e.davis@wtw.com", broker_company: "WTW",
    status: "declined", score: 29, file_name: "fairlane-marine.pdf", notes: "High claims frequency. Outside appetite.",
    created_at: "2026-05-24T16:20:00Z", processed_at: "2026-05-24T16:31:00Z",
    decision_at: "2026-05-24T16:45:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "Fairlane Logistics", coverage_type: "Marine Cargo",
      coverage_limit: "£2,000,000", premium_estimate: "£38,000", industry: "Logistics",
      effective_date: "01 Jun 2026", jurisdiction: "Scotland", employees: "95", revenue: "£12M",
      loss_history: "4 claims in 3 years totalling £420,000. Claim frequency is above market average.",
      risk_factors: ["High claim frequency", "Inadequate cargo securing procedures", "Routes through high-piracy zones", "No surveyor approval for high-value shipments"],
      confidence_score: 0.91,
      score_factors: [
        { label: "Claims frequency",     impact: -28, detail: "4 claims in 36 months — 3.2× market average frequency" },
        { label: "Claims severity",      impact: -15, detail: "£420K aggregate — 21% of limit over 3 years" },
        { label: "Piracy exposure",      impact: -12, detail: "Gulf of Aden / Indian Ocean routes flagged as HOT zones" },
        { label: "Cargo controls",       impact: -10, detail: "No approved surveyor for high-value consignments" },
        { label: "Business size",        impact: +6,  detail: "SME — manageable aggregate exposure" },
        { label: "Revenue trajectory",   impact: +4,  detail: "Revenue growth 15% YoY — business improving" },
      ],
      premium_model: { base: 38000, low: 62000, mid: 78000, high: 95000, currency: "GBP", basis: "Indicative only — outside current appetite" },
    },
  },
  {
    id: "VLX-0037", broker_name: "Priya Patel", broker_email: "p.patel@aon.co.uk", broker_company: "Aon UK",
    status: "accepted", score: 78, file_name: "summit-healthcare-do.pdf",
    notes: "Solid D&O risk. Board composition strong.",
    created_at: "2026-05-24T11:05:00Z", processed_at: "2026-05-24T11:18:00Z",
    decision_at: "2026-05-24T11:40:00Z", decision_by: "Osk",
    extracted_data: {
      insured_name: "Summit Healthcare", coverage_type: "D&O Liability",
      coverage_limit: "£15,000,000", premium_estimate: "£120,000", industry: "Healthcare",
      effective_date: "01 Jul 2026", jurisdiction: "England & Wales", employees: "2,100", revenue: "£190M",
      loss_history: "No D&O claims in 7-year history.",
      risk_factors: ["Regulatory environment tightening in private healthcare", "Recent CFO departure"],
      confidence_score: 0.92,
      score_factors: [
        { label: "Loss history",         impact: +24, detail: "Zero D&O claims in 7 years — exceptional record" },
        { label: "Board composition",    impact: +16, detail: "3 independent NEDs, Audit & Risk Committee active" },
        { label: "Revenue scale",        impact: +10, detail: "£190M revenue — strong balance sheet" },
        { label: "CFO departure",        impact: -14, detail: "Recent CFO resignation — regulatory scrutiny risk" },
        { label: "Regulatory exposure",  impact: -11, detail: "CQC oversight increasing post-pandemic" },
        { label: "Jurisdiction",         impact: +8,  detail: "England & Wales — well-defined legal framework" },
        { label: "Limit concentration",  impact: +5,  detail: "£15M limit appropriate for turnover" },
      ],
      premium_model: { base: 120000, low: 110000, mid: 124000, high: 145000, currency: "GBP", basis: "Side A + B, 12-month policy period" },
    },
  },
  {
    id: "VLX-0036", broker_name: "Tom Walsh", broker_email: "t.walsh@marsh.com", broker_company: "Marsh",
    status: "accepted", score: 85, file_name: "kestrel-energy-property.pdf", notes: null,
    created_at: "2026-05-23T14:30:00Z", processed_at: "2026-05-23T14:42:00Z",
    decision_at: "2026-05-23T15:00:00Z", decision_by: "Max",
    extracted_data: {
      insured_name: "Kestrel Energy", coverage_type: "Property",
      coverage_limit: "£25,000,000", premium_estimate: "£185,000", industry: "Energy",
      effective_date: "15 Jun 2026", jurisdiction: "England & Wales", employees: "520", revenue: "£340M",
      loss_history: "No property claims in 10 years.",
      risk_factors: ["Offshore wind installation exposure"],
      confidence_score: 0.96,
      score_factors: [
        { label: "Loss history",         impact: +26, detail: "No claims in 10 years — top decile performance" },
        { label: "Risk engineering",     impact: +18, detail: "Annual loss prevention surveys completed, BREEAM A-rated" },
        { label: "Revenue strength",     impact: +14, detail: "£340M revenue — investment grade credit quality" },
        { label: "Offshore exposure",    impact: -10, detail: "Offshore wind CAT exposure — PML assessment required" },
        { label: "Limit vs. TIV",        impact: +8,  detail: "£25M limit conservative relative to TIV" },
        { label: "Business continuity",  impact: +12, detail: "Fully tested BCP in place, dual power feed" },
      ],
      premium_model: { base: 185000, low: 172000, mid: 188000, high: 210000, currency: "GBP", basis: "All risks property, 12-month, subject to survey" },
    },
  },
  {
    id: "VLX-0035", broker_name: "Lars Hansen", broker_email: "l.hansen@howden.com", broker_company: "Howden",
    status: "declined", score: 31, file_name: "nordic-shipping.pdf", notes: "Outside appetite — Arctic routes.",
    created_at: "2026-05-23T10:15:00Z", processed_at: "2026-05-23T10:28:00Z",
    decision_at: "2026-05-23T10:50:00Z", decision_by: "Osk",
    extracted_data: {
      insured_name: "Nordic Shipping AS", coverage_type: "Marine Cargo",
      coverage_limit: "£8,000,000", premium_estimate: "£75,000", industry: "Shipping",
      effective_date: "01 Jul 2026", jurisdiction: "Norway", employees: "215", revenue: "£62M",
      loss_history: "3 claims in 4 years including one major salvage operation.",
      risk_factors: ["Arctic route exposure", "Ice-class cargo handling", "Limited salvage infrastructure", "High claim severity history"],
      confidence_score: 0.89,
      score_factors: [
        { label: "Arctic routes",        impact: -24, detail: "Northern Sea Route — outside published appetite guidelines" },
        { label: "Salvage history",      impact: -20, detail: "Major salvage operation in 2023 — high severity indicator" },
        { label: "Claims frequency",     impact: -14, detail: "3 claims / 4 years above class benchmark" },
        { label: "Salvage infrastructure", impact: -10, detail: "Limited SAR coverage in Arctic waters" },
        { label: "Revenue scale",        impact: +8,  detail: "£62M revenue — established operator" },
        { label: "Ice-class vessels",    impact: +6,  detail: "Vessels properly certified for route — mitigant" },
      ],
      premium_model: { base: 75000, low: 115000, mid: 140000, high: 170000, currency: "GBP", basis: "Indicative — specialist market referral recommended" },
    },
  },
  {
    id: "VLX-0034", broker_name: "James Harwick", broker_email: "j.harwick@aon.co.uk", broker_company: "Aon UK",
    status: "referred", score: 55, file_name: "apex-financial-crime.pdf", notes: null,
    created_at: "2026-05-22T09:00:00Z", processed_at: "2026-05-22T09:14:00Z",
    decision_at: null, decision_by: null,
    extracted_data: {
      insured_name: "Apex Financial Group", coverage_type: "Crime",
      coverage_limit: "£5,000,000", premium_estimate: "£48,000", industry: "Financial Services",
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
      premium_model: { base: 48000, low: 44000, mid: 51000, high: 63000, currency: "GBP", basis: "Annual crime policy, fidelity + computer crime" },
    },
  },
];

export const mockTeam: TeamMember[] = [
  { id: "1", name: "Max Uzarek",    email: "uzarek.maksymilian@gmail.com", role: "admin",        avatar: null, joined_at: "2026-05-01T00:00:00Z" },
  { id: "2", name: "Osk",           email: "osk@velox.ai",                 role: "admin",        avatar: null, joined_at: "2026-05-01T00:00:00Z" },
  { id: "3", name: "Anna Kowalski", email: "a.kowalski@velox.ai",          role: "underwriter",  avatar: null, joined_at: "2026-05-15T00:00:00Z" },
];

export const mockRules: AppetiteRule[] = [
  { id: "1", coverage_type: "Marine Cargo",    field: "score",        operator: "gt",       value: "70",    action: "accept",  priority: 1 },
  { id: "2", coverage_type: "Marine Cargo",    field: "score",        operator: "lt",       value: "40",    action: "decline", priority: 2 },
  { id: "3", coverage_type: "Cyber Liability", field: "loss_history", operator: "contains", value: "claim", action: "refer",   priority: 3 },
  { id: "4", coverage_type: "All",             field: "score",        operator: "gt",       value: "75",    action: "accept",  priority: 4 },
  { id: "5", coverage_type: "All",             field: "score",        operator: "lt",       value: "35",    action: "decline", priority: 5 },
];

export const mockAnalytics: AnalyticsData[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2026-05-25");
  d.setDate(d.getDate() - (29 - i));
  const total    = Math.floor(Math.random() * 15) + 5;
  const accepted = Math.floor(total * 0.55);
  const declined = Math.floor(total * 0.25);
  const referred = total - accepted - declined;
  const gwp      = accepted * (Math.floor(Math.random() * 80000) + 40000);
  return { date: d.toISOString().slice(0, 10), total, accepted, declined, referred, gwp };
});

export const mockAudit: AuditEntry[] = [
  { id: "1", submission_id: "VLX-0041", action: "submitted",  actor: "James Harwick (Broker)",  detail: "Document uploaded via broker portal",                       created_at: "2026-05-25T09:12:00Z" },
  { id: "2", submission_id: "VLX-0041", action: "processing", actor: "Velox AI",                 detail: "Document parsed — marine cargo SLIP detected",              created_at: "2026-05-25T09:12:30Z" },
  { id: "3", submission_id: "VLX-0041", action: "extracted",  actor: "Velox AI",                 detail: "Data extracted with 94% confidence. Risk score: 82/100",    created_at: "2026-05-25T09:20:00Z" },
  { id: "4", submission_id: "VLX-0041", action: "accepted",   actor: "Max",                      detail: "Accepted — strong risk profile, clean 5-year loss history",  created_at: "2026-05-25T09:35:00Z" },
];

export const mockBrokerStats: BrokerStat[] = [
  { company: "Aon UK",  submissions: 3, accepted: 2, declined: 0, referred: 1, gwp: 210000, avgScore: 72, bindRate: 100 },
  { company: "Howden",  submissions: 2, accepted: 0, declined: 1, referred: 1, gwp:  95000, avgScore: 46, bindRate:  50 },
  { company: "Marsh",   submissions: 2, accepted: 1, declined: 0, referred: 0, gwp: 185000, avgScore: 83, bindRate: 100 },
  { company: "WTW",     submissions: 1, accepted: 0, declined: 1, referred: 0, gwp:      0, avgScore: 29, bindRate:   0 },
];
