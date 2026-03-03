
type Page = "login" | "dashboard" | "review";

type SectionKey =
  | "clubs"
  | "tutors"
  | "events"
  | "executives"
  | "booking"
  | "grants"
  | "bluecard";

type FieldType = "text" | "textarea" | "file";

type FormField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
};

type Toast = {
  type: "success" | "error";
  msg: string;
};

type PendingSubmission = {
  id: string;
  section: SectionKey;
  submittedBy: string;
  data: Record<string, unknown>;
};