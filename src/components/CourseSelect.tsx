"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./CourseSelect.module.css";

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
    <div ref={containerRef} className={styles.container}>
      {selected.length > 0 && (
        <div className={styles.tagList}>
          {selected.map((c) => (
            <span key={c} className={styles.tag}>
              {c}
              <button className={styles.tagRemoveButton} onClick={() => toggle(c)}>×</button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />

      {open && (
        <div className={styles.dropdown}>
          {filtered.length === 0 && (
            <div className={styles.dropdownEmpty}>No courses found</div>
          )}
          {filtered.map((c) => (
            <div
              key={c}
              className={styles.dropdownOption}
              onClick={() => { toggle(c); setSearch(""); }}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
