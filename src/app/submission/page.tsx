"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";

type Category = "clubs" | "pantry" | "events" | "tutors";

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
  const [courses, setCourses] = useState(searchParams.get("courses") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isTutor = category === "tutors";
  const isEvent = category === "events";

  const handleSubmit = async () => {
    if (!category) { alert("Select a category"); return; }
    if (!title) { alert("Fill out required fields"); return; }

    setSubmitting(true);
    try {
      const data: Record<string, unknown> = isTutor
        ? {
            name: title,
            bio: description,
            courses: courses.split(",").map((c) => c.trim()).filter(Boolean),
            link: link || null,
            image: null, // image upload not yet implemented
          }
        : {
            title,
            description,
            date: eventDate || null,
            location: location || null,
            link: link || null,
          };

      const submissionData: Record<string, unknown> = {
        section: category,
        status: "pending",
        data,
      };

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
            <option value="events">Events</option>
            <option value="pantry">Pantry</option>
            <option value="tutors">Tutors</option>
          </select>
        </div>

        {/* Tutor fields */}
        {isTutor && (
          <>
            <div>
              <label>Name</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label>Bio</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label>Courses Taught</label>
              <input
                type="text"
                placeholder="e.g. BIOL 200, CHEM 121"
                value={courses}
                onChange={(e) => setCourses(e.target.value)}
              />
              <small style={{ color: "var(--text-muted)" }}>Comma-separated list of course codes</small>
            </div>
            <div>
              <label>Koalender Link</label>
              <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
          </>
        )}

        {/* Event / default fields */}
        {!isTutor && (
          <>
            <div>
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            {(isEvent || isEdit) && (
              <div>
                <label>Event Date</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
            )}
            <div>
              <label>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label>Link</label>
              <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
          </>
        )}

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
