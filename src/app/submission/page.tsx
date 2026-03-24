"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import CourseSelect from "../../components/CourseSelect";
import PreviewButton from "../../components/EventPreview";
import styles from "./submission.module.css";

type Category = "clubs" | "pantry" | "events" | "tutors" | "initiatives";

function MultiUrlInput({ values, onChange, addLabel }: { values: string[]; onChange: (v: string[]) => void; addLabel: string }) {
  const update = (i: number, val: string) => onChange(values.map((v, idx) => idx === i ? val : v));
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, ""]);

  return (
    <div className={styles.linksField}>
      {values.map((v, i) => (
        <div key={i} className={styles.linkRow}>
          <input type="url" placeholder="https://..." value={v} onChange={(e) => update(i, e.target.value)} />
          {values.length > 1 && (
            <button type="button" className={styles.removeLinkButton} onClick={() => remove(i)}>×</button>
          )}
        </div>
      ))}
      <button type="button" className={styles.addLinkButton} onClick={add}>+ {addLabel}</button>
    </div>
  );
}

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
  const [links, setLinks] = useState<string[]>(
    searchParams.getAll("links").length > 0 ? searchParams.getAll("links")
    : searchParams.get("link") ? [searchParams.get("link")!]
    : [""]
  );
  const [tutorLink, setTutorLink] = useState(searchParams.get("link") ?? "");
  const [images, setImages] = useState<string[]>(
    searchParams.getAll("images").length > 0 ? searchParams.getAll("images")
    : searchParams.get("image") ? [searchParams.get("image")!]
    : [""]
  );
  const [courses, setCourses] = useState<string[]>(
    searchParams.get("courses") ? searchParams.get("courses")!.split(",").map((c) => c.trim()) : []
  );
  const [isFeatured, setIsFeatured] = useState(searchParams.get("isFeatured") === "true");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isTutor = category === "tutors";
  const isEvent = category === "events";
  const isInitiative = category === "initiatives";

  const filteredLinks = links.filter((l) => l.trim());
  const filteredImages = images.filter((img) => img.trim());

  const handleSubmit = async () => {
    if (!category) { alert("Select a category"); return; }
    if (!title) { alert("Fill out required fields"); return; }

    setSubmitting(true);
    try {
      const data: Record<string, unknown> = isTutor
        ? { name: title, bio: description, courses, link: tutorLink || null }
        : isEvent
        ? { type: "event", title, description, date: eventDate || null, time: eventTime || null, location: location || null, links: filteredLinks.length > 0 ? filteredLinks : null, images: filteredImages.length > 0 ? filteredImages : null, isFeatured }
        : isInitiative
        ? { type: "initiative", title, description, links: filteredLinks.length > 0 ? filteredLinks : null, images: filteredImages.length > 0 ? filteredImages : null }
        : { title, description, links: filteredLinks.length > 0 ? filteredLinks : null };

      const submissionData: Record<string, unknown> = { section: category, status: "pending", data };
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
      <div className={styles.formContainer}>
        <h1>Submitted!</h1>
        <p>Your {isEdit ? "edit" : "submission"} has been sent for review.</p>
        <a href="/submission">← Back to Submission</a>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h1>{isEdit ? `Edit: ${title}` : "New Submission"}</h1>
      {isEdit && <p className={styles.editHint}>Your changes will be reviewed before going live.</p>}

      <div className="stack">
        <div>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} disabled={isEdit}>
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
            <div><label>Name</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label>Bio</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
            <div><label>Courses Taught</label><CourseSelect selected={courses} onChange={setCourses} /></div>
            <div><label>Koalender Link</label><input type="url" placeholder="https://..." value={tutorLink} onChange={(e) => setTutorLink(e.target.value)} /></div>
          </>
        )}

        {/* Event fields */}
        {isEvent && (
          <>
            <div><label>Event Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
            <div><label>Date</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></div>
            <div><label>Time</label><input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></div>
            <div><label>Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            <div><label>Links</label><MultiUrlInput values={links} onChange={setLinks} addLabel="Add link" /></div>
            <div><label>Images</label><MultiUrlInput values={images} onChange={setImages} addLabel="Add image" /></div>
            <div className={styles.checkboxField}>
              <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <label htmlFor="isFeatured">Feature in Upcoming Events</label>
            </div>
          </>
        )}

        {/* Initiative fields */}
        {isInitiative && (
          <>
            <div><label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
            <div><label>Links</label><MultiUrlInput values={links} onChange={setLinks} addLabel="Add link" /></div>
            <div><label>Images</label><MultiUrlInput values={images} onChange={setImages} addLabel="Add image" /></div>
          </>
        )}

        {/* Default fields (clubs, pantry) */}
        {!isTutor && !isEvent && !isInitiative && (
          <>
            <div><label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
            <div><label>Links</label><MultiUrlInput values={links} onChange={setLinks} addLabel="Add link" /></div>
          </>
        )}

        <div className={styles.formActions}>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : isEdit ? "Submit for Review" : "Submit"}
          </button>
          {(isEvent || isInitiative) && (
            <PreviewButton data={{ title, description, date: eventDate, time: eventTime, location, link: filteredLinks[0], image: filteredImages[0], isInitiative }} />
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
