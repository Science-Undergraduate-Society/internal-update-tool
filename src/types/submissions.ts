export type SectionType =
  | "clubs"
  | "tutors"
  | "events"
  | "executives"
  | "booking"
  | "grants"
  | "bluecard";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id?: string;
  section: SectionType;
  data: Record<string, unknown>;
  submittedBy: string;
  submittedAt: Date;
  status: SubmissionStatus;
  reviewedBy?: string;
  reviewNote?: string;
}
