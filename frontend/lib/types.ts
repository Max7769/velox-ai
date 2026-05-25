export type SubmissionStatus = "pending" | "processing" | "accepted" | "declined" | "referred";

export interface ExtractedData {
  insured_name: string | null;
  coverage_type: string | null;
  coverage_limit: string | null;
  premium_estimate: string | null;
  industry: string | null;
  effective_date: string | null;
  loss_history: string | null;
  risk_factors: string[];
  confidence_score: number;
}

export interface Submission {
  id: string;
  broker_name: string;
  broker_email: string;
  broker_company: string;
  status: SubmissionStatus;
  score: number | null;
  extracted_data: ExtractedData | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
  decision_at: string | null;
  decision_by: string | null;
}

export interface AuditEntry {
  id: string;
  submission_id: string;
  action: string;
  actor: string;
  detail: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "underwriter" | "viewer";
  avatar: string | null;
  joined_at: string;
}

export interface AppetiteRule {
  id: string;
  coverage_type: string;
  field: string;
  operator: "gt" | "lt" | "eq" | "contains";
  value: string;
  action: "accept" | "decline" | "refer";
  priority: number;
}

export interface AnalyticsData {
  date: string;
  total: number;
  accepted: number;
  declined: number;
  referred: number;
}
