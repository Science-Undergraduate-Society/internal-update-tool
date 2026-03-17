"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import CourseSelect from "../../components/CourseSelect";
import PreviewButton from "../../components/EventPreview";

type Category = "clubs" | "pantry" | "events" | "tutors" | "initiatives";

function SubmissionForm() {
  const searchParams = useSearchParams();

  const editId = searchParams.get("editId") ?? "";
  const editCollection = searchParams.get("collection") ?? "";
  const isEdit = !!editId;

  const [category, setCategory] = useState<Category | "">(editCollection as Category || "");
  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const [description, setDescription] = useState(searchParams.get("description") ?? "");
  const [eventDate, setEventDate] = useState(searchParams.get("date") ?? "");
  const [eventTime, setEventTime] = useState(searchParams.get("time") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [link, setLink] = useState(searchParams.get("link") ?? "");
  const [image, setImage] = useState(searchParams.get("image") ?? "");
  const [courses, setCourses] = useState<string[]>(
    searchParams.get("courses") ? searchParams.get("courses")!.split(",").map((c) => c.trim()) : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isTutor = category === "tutors";
  const isEvent = category === "events";
  const isInitiative = category === "initiatives";

  const handleSubmit = async () => {
    if (!category) { alert("Select a category"); return; }
    if (!title) { alert("Fill out required fields"); return; }

    setSubmitting(true);
    try {
      const data: Record<string, unknown> = isTutor
        ? {
            name: title,
            bio: description,
            courses,
            link: link || null,
            image: null, // image upload not yet implemented
          }
        : isEvent
        ? {
            title,
            description,
            date: eventDate || null,
            time: eventTime || null,
            location: location || null,
            link: link || null,
            image: image || null,
          }
        : isInitiative
        ? {
            title,
            description,
            link: link || null,
            image: image || null,
          }
        : {
            title,
            description,
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
            <option value="initiatives">Initiatives</option>
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
              <CourseSelect selected={courses} onChange={setCourses} />
            </div>
            <div>
              <label>Koalender Link</label>
              <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
          </>
        )}

        {/* Event fields */}
        {isEvent && (
          <>
            <div>
              <label>Event Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label>Date</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div>
              <label>Time</label>
              <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
            </div>
            <div>
              <label>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label>Event Link</label>
              <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div>
              <label>Image URL</label>
              <input type="url" placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
          </>
        )}

        {/* Initiative fields */}
        {isInitiative && (
          <>
            <div>
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label>Link</label>
              <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div>
              <label>Image URL</label>
              <input type="url" placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
          </>
        )}

        {/* Default fields (clubs, pantry) */}
        {!isTutor && !isEvent && !isInitiative && (
          <>
            <div>
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label>Link</label>
              <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : isEdit ? "Submit for Review" : "Submit"}
          </button>
          {(isEvent || isInitiative) && (
            <PreviewButton data={{ title, description, date: eventDate, time: eventTime, location, link, image, isInitiative }} />
          )}
        </div>
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
