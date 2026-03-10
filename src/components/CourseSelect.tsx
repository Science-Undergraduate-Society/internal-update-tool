"use client";

import { useState, useRef, useEffect } from "react";

const COURSES = [
  "BIOL 112", "BIOL 121", "BIOL 200",
  "CHEM 121", "CHEM 123", "CHEM 203", "CHEM 213", "CHEM 233",
  "DSCI 100",
  "MATH 100", "MATH 101", "MATH 215",
  "MICB 211",
  "PHYS 117", "PHYS 118", "PHYS 131",
];

interface Props {
  selected: string[];
  onChange: (courses: string[]) => void;
}

export default function CourseSelect({ selected, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = COURSES.filter(
    (c) => c.toLowerCase().includes(search.toLowerCase()) && !selected.includes(c)
  );

  const toggle = (course: string) => {
    onChange(selected.includes(course) ? selected.filter((c) => c !== course) : [...selected, course]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {selected.map((c) => (
            <span
              key={c}
              style={{
                background: "var(--navy)",
                color: "white",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {c}
              <button
                onClick={() => toggle(c)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  padding: 0,
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 6,
          maxHeight: 200,
          overflowY: "auto",
          zIndex: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No courses found
            </div>
          )}
          {filtered.map((c) => (
            <div
              key={c}
              onClick={() => { toggle(c); setSearch(""); }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
