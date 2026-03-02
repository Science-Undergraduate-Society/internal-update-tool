"use client";
import { SectionType } from "@/types/submissions";

const SECTIONS: { value: SectionType; label: string }[] = [
  { value: "clubs", label: "Clubs" },
  { value: "tutors", label: "Tutors" },
  { value: "events", label: "Events" },
  { value: "executives", label: "Executives" },
  { value: "booking", label: "Booking Info & Fees" },
  { value: "grants", label: "Grants & Subsidies" },
  { value: "bluecard", label: "Blue Card Collaborators" },
];

interface Props {
  value: SectionType | "";
  onChange: (section: SectionType) => void;
}

export default function SectionPicker({ value, onChange }: Props) {
  return (
    <div>
      <label htmlFor="section">What would you like to update?</label>
      <select
        id="section"
        value={value}
        onChange={(e) => onChange(e.target.value as SectionType)}
      >
        <option value="">-- Select a section --</option>
        {SECTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
