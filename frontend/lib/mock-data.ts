import type { Submission, TeamMember, AppetiteRule, AnalyticsData, AuditEntry } from "./types";

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
      effective_date: "01 Jun 2026", loss_history: "No claims in the past 5 years. One minor incident in 2019, settled below excess.",
      risk_factors: ["High-value cargo routes through Suez Canal", "Refrigerated goods requiring temperature monitoring"],
      confidence_score: 0.94,
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
      effective_date: "15 Jun 2026",
      loss_history: "One cyber claim in 2023 for £180,000 following a phishing attack.",
      risk_factors: ["Prior cyber claim", "Large remote workforce with BYOD policy", "SaaS platform with 3rd-party integrations", "Gap in coverage 2021–2022"],
      confidence_score: 0.88,
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
      effective_date: "01 Jun 2026",
      loss_history: "4 claims in 3 years totalling £420,000. Claim frequency is above market average.",
      risk_factors: ["High claim frequency", "Inadequate cargo securing procedures", "Routes through high-piracy zones", "No surveyor approval for high-value shipments"],
      confidence_score: 0.91,
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
      effective_date: "01 Jul 2026",
      loss_history: "No D&O claims in 7-year history.",
      risk_factors: ["Regulatory environment tightening in private healthcare", "Recent CFO departure"],
      confidence_score: 0.92,
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
      effective_date: "15 Jun 2026", loss_history: "No property claims in 10 years.",
      risk_factors: ["Offshore wind installation exposure"],
      confidence_score: 0.96,
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
      effective_date: "01 Jul 2026", loss_history: "3 claims in 4 years including one major salvage operation.",
      risk_factors: ["Arctic route exposure", "Ice-class cargo handling", "Limited salvage infrastructure", "High claim severity history"],
      confidence_score: 0.89,
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
      effective_date: "01 Jun 2026", loss_history: "One internal fraud incident 4 years ago, £90,000. Controls since strengthened.",
      risk_factors: ["Prior fraud incident", "Rapid headcount growth", "Multi-jurisdiction operations"],
      confidence_score: 0.87,
    },
  },
];

export const mockTeam: TeamMember[] = [
  { id: "1", name: "Max Uzarek", email: "uzarek.maksymilian@gmail.com", role: "admin", avatar: null, joined_at: "2026-05-01T00:00:00Z" },
  { id: "2", name: "Osk", email: "osk@velox.ai", role: "admin", avatar: null, joined_at: "2026-05-01T00:00:00Z" },
  { id: "3", name: "Anna Kowalski", email: "a.kowalski@velox.ai", role: "underwriter", avatar: null, joined_at: "2026-05-15T00:00:00Z" },
];

export const mockRules: AppetiteRule[] = [
  { id: "1", coverage_type: "Marine Cargo", field: "score", operator: "gt", value: "70", action: "accept", priority: 1 },
  { id: "2", coverage_type: "Marine Cargo", field: "score", operator: "lt", value: "40", action: "decline", priority: 2 },
  { id: "3", coverage_type: "Cyber Liability", field: "loss_history", operator: "contains", value: "claim", action: "refer", priority: 3 },
  { id: "4", coverage_type: "All", field: "score", operator: "gt", value: "75", action: "accept", priority: 4 },
  { id: "5", coverage_type: "All", field: "score", operator: "lt", value: "35", action: "decline", priority: 5 },
];

export const mockAnalytics: AnalyticsData[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2026-05-25");
  d.setDate(d.getDate() - (29 - i));
  const total = Math.floor(Math.random() * 15) + 5;
  const accepted = Math.floor(total * 0.55);
  const declined = Math.floor(total * 0.25);
  const referred = total - accepted - declined;
  return { date: d.toISOString().slice(0, 10), total, accepted, declined, referred };
});

export const mockAudit: AuditEntry[] = [
  { id: "1", submission_id: "VLX-0041", action: "submitted", actor: "James Harwick (Broker)", detail: "Document uploaded via portal", created_at: "2026-05-25T09:12:00Z" },
  { id: "2", submission_id: "VLX-0041", action: "processing", actor: "Velox AI", detail: "Document parsed, AI extraction started", created_at: "2026-05-25T09:12:30Z" },
  { id: "3", submission_id: "VLX-0041", action: "extracted", actor: "Velox AI", detail: "Data extracted with 94% confidence. Risk score: 82/100", created_at: "2026-05-25T09:20:00Z" },
  { id: "4", submission_id: "VLX-0041", action: "accepted", actor: "Max", detail: "Accepted — strong risk profile, clean loss history", created_at: "2026-05-25T09:35:00Z" },
];
