"use client";

import { useState, ChangeEvent } from "react";

type Category = "club" | "pantry" | "events";

type FormState = {
  category: Category | "";
  title: string;
  description: string;
  eventDate: string;
  link: string;
  images: File[];
};

export default function Page() {
  const [form, setForm] = useState<FormState>({
    category: "",
    title: "",
    description: "",
    eventDate: "",
    link: "",
    images: [],
  });

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log(form);
    alert("Submitted (check console)");
  };

  return (
    <main className="container">
      <div className="stack">
        <h1>Internal Update Submission</h1>

        <CategorySelect
          value={form.category}
          onChange={(v) => updateField("category", v)}
        />

        <TextInput
          label="Title"
          value={form.title}
          onChange={(v) => updateField("title", v)}
        />

        <TextArea
          label="Description"
          value={form.description}
          onChange={(v) => updateField("description", v)}
        />

        {form.category === "events" && (
          <DateInput
            label="Event Date"
            value={form.eventDate}
            onChange={(v) => updateField("eventDate", v)}
          />
        )}

        <TextInput
          label="Link"
          type="url"
          placeholder="https://..."
          value={form.link}
          onChange={(v) => updateField("link", v)}
        />

        <FileUpload
          label="Upload Images"
          onChange={(files) => updateField("images", files)}
        />

        <button onClick={handleSubmit}>Submit</button>
      </div>
    </main>
  );
}

/* -----------------------------
   Small UI helpers
------------------------------ */

function Debug({ data }: { data: FormState }) {
  return (
    <pre
      style={{
        background: "#111",
        color: "#0f0",
        padding: 12,
        borderRadius: 6,
        fontSize: 12,
      }}
    >
      {JSON.stringify(
        { ...data, images: data.images.map((f) => f.name) },
        null,
        2
      )}
    </pre>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: Category | "";
  onChange: (v: Category | "") => void;
}) {
  return (
    <label>
      Category
      <select value={value} onChange={(e) => onChange(e.target.value as Category)}>
        <option value="">Select one</option>
        <option value="club">Club</option>
        <option value="pantry">Pantry</option>
        <option value="events">Events</option>
      </select>
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function FileUpload({
  label,
  onChange,
}: {
  label: string;
  onChange: (files: File[]) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange(Array.from(e.target.files));
    }
  };

  return (
    <label>
      {label}
      <input type="file" multiple accept="image/*" onChange={handleChange} />
    </label>
  );
}