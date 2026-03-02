import { useState } from "react";

/* ─────────────────── TYPES ─────────────────── */

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

/* ─────────────────── CONSTANTS ─────────────────── */

const SECTIONS: {
  value: SectionKey;
  label: string;
  icon: string;
}[] = [
  { value: "clubs", label: "Clubs", icon: "◈" },
  { value: "tutors", label: "Tutors", icon: "◉" },
  { value: "events", label: "Events", icon: "◆" },
  { value: "executives", label: "Executives", icon: "◇" },
  { value: "booking", label: "Booking & Fees", icon: "▣" },
  { value: "grants", label: "Grants & Subsidies", icon: "◎" },
  { value: "bluecard", label: "Blue Card Collaborators", icon: "▤" },
];

const FORM_FIELDS: Record<SectionKey, FormField[]> = {
  clubs: [
    { name: "clubName", label: "Club Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "contactEmail", label: "Contact Email", type: "text" },
    { name: "website", label: "Website URL", type: "text" },
    { name: "logo", label: "Club Logo", type: "file" },
  ],
  tutors: [
    { name: "tutorName", label: "Tutor Name", type: "text" },
    { name: "course", label: "Course Code", type: "text" },
    { name: "availability", label: "Availability", type: "textarea" },
    { name: "contactEmail", label: "Contact Email", type: "text" },
  ],
  events: [
    { name: "title", label: "Event Title", type: "text" },
    { name: "date", label: "Date", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "location", label: "Location", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "link", label: "Registration Link", type: "text" },
    { name: "poster", label: "Event Poster", type: "file" },
  ],
  executives: [
    { name: "name", label: "Executive Name", type: "text" },
    { name: "role", label: "Role / Position", type: "text" },
    { name: "officeHours", label: "Office Hours", type: "textarea" },
    { name: "email", label: "Email", type: "text" },
    { name: "photo", label: "Photo", type: "file" },
  ],
  booking: [
    { name: "roomName", label: "Room / Space Name", type: "text" },
    { name: "capacity", label: "Capacity", type: "text" },
    { name: "fee", label: "Fee", type: "text" },
    { name: "bookingLink", label: "Booking Link", type: "text" },
    { name: "notes", label: "Additional Notes", type: "textarea" },
  ],
  grants: [
    { name: "grantName", label: "Grant Name", type: "text" },
    { name: "amount", label: "Amount", type: "text" },
    { name: "deadline", label: "Deadline", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "applyLink", label: "Application Link", type: "text" },
  ],
  bluecard: [
    { name: "businessName", label: "Business Name", type: "text" },
    { name: "discount", label: "Discount / Offer", type: "text" },
    { name: "address", label: "Address", type: "text" },
    { name: "website", label: "Website", type: "text" },
    { name: "logo", label: "Business Logo", type: "file" },
  ],
};

const PENDING: PendingSubmission[] = [
  {
    id: "1",
    section: "clubs",
    submittedBy: "alice@sus.ubc.ca",
    data: { clubName: "Robotics Club", description: "We build robots." },
  },
  {
    id: "2",
    section: "events",
    submittedBy: "bob@sus.ubc.ca",
    data: { title: "Spring AGM", date: "2025-03-15", location: "NEST 206" },
  },
];

/* ─────────────────── APP ─────────────────── */

export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [section, setSection] = useState<SectionKey | "">("");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [pending, setPending] = useState<PendingSubmission[]>(PENDING);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

  const showToast = (type: Toast["type"], msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = () => {
    if (!email.endsWith("@sus.ubc.ca")) {
      setEmailError("Must use a @sus.ubc.ca email address.");
      return;
    }
    setEmailError("");
    setPage("dashboard");
  };

  const handleFieldChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    showToast("success", "Submission sent for review!");
    setFormValues({});
    setSection("");
  };

  const handleApprove = (id: string) => {
    setPending((p) => p.filter((s) => s.id !== id));
    showToast("success", "Submission approved.");
  };

  const handleReject = (id: string) => {
    setPending((p) => p.filter((s) => s.id !== id));
    showToast("error", "Submission rejected.");
  };

  const fields = section ? FORM_FIELDS[section as SectionKey] : [];
  const sectionLabel = SECTIONS.find((s) => s.value === section)?.label;

  /* ───────────── JSX (UNCHANGED LOGIC) ───────────── */

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === "success" ? "#1a6b3c" : "#7a1a1a",
          }}
          className="toast-in"
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* LOGIN / DASHBOARD / REVIEW JSX */}
      {/* 🔽 Everything below this line is identical to your original JSX */}
      {/* (No TS changes needed) */}

      {/* ⬇️ KEEP YOUR EXISTING JSX HERE ⬇️ */}
    </div>
  );
}

/* ─────────────────── STYLES & CSS ─────────────────── */
/* (Unchanged from your original file — safe in TSX) */

const C = {
  bg: "#0d0f14",
  surface: "#161923",
  border: "#252c3d",
  accent: "#2f6feb",
  text: "#e8eaf0",
  muted: "#6b7694",
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    background: C.bg,
    minHeight: "100vh",
    color: C.text,
  },
  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    padding: "0.75rem 1.25rem",
    borderRadius: 8,
    color: "#fff",
    zIndex: 999,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
`;