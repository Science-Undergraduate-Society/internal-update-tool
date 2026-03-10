"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";

type Category = "clubs" | "pantry" | "events";

function SubmissionForm() {
  const searchParams = useSearchParams();

  const editId = searchParams.get("editId") ?? "";
  const editCollection = searchParams.get("collection") ?? "";
  const isEdit = !!editId;

  const [category, setCategory] = useState<Category | "">(editCollection as Category || "");
  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const [description, setDescription] = useState(searchParams.get("description") ?? "");
  const [eventDate, setEventDate] = useState(searchParams.get("date") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [link, setLink] = useState(searchParams.get("link") ?? "");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      alert("Fill out required fields");
      return;
    }

    setSubmitting(true);
    try {
      const submissionData: Record<string, unknown> = {
        section: category,
        status: "pending",
        data: {
          title,
          description,
          date: eventDate || null,
          location: location || null,
          link: link || null,
        },
      };

      // Link back to the original document so review can overwrite it
      if (isEdit) {
        submissionData.linkedDocId = editId;
        submissionData.linkedCollection = editCollection;
      }

      await addDoc(collection(db, "submissions"), submissionData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Error saving submission");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, padding: 24 }}>
        <h1>Submitted!</h1>
        <p>Your {isEdit ? "edit" : "submission"} has been sent for review.</p>
        <a href="/submission">← Back to Submission</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, padding: 24 }}>
      <h1>{isEdit ? `Edit: ${title}` : "New Submission"}</h1>
      {isEdit && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Your changes will be reviewed before going live.
        </p>
      )}

      <div className="stack">
        <div>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={isEdit}
          >
            <option value="">Select one</option>
            <option value="clubs">Clubs</option>
            <option value="pantry">Pantry</option>
            <option value="events">Events</option>
          </select>
        </div>

        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {(category === "events" || isEdit) && (
          <div>
            <label>Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
        )}

        <div>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label>Link</label>
          <input
            type="url"
            placeholder="https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        <div>
          <label>Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) setImages(Array.from(e.target.files));
            }}
          />
        </div>

        <button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : isEdit ? "Submit for Review" : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default function SubmissionPage() {
  return (
    <Suspense>
      <SubmissionForm />
    </Suspense>
  );
}
