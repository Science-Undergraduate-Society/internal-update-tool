"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase"; // adjust path

type Category = "club" | "pantry" | "events";

export default function SubmissionForm() {
  const [category, setCategory] = useState<Category | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [link, setLink] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "YOUR_UNSIGNED_PRESET");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
      { method: "POST", body: data }
    );
    const json = await res.json();
    return json.secure_url as string;
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      alert("Fill out required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Upload images
      const imageUrls = await Promise.all(images.map(uploadToCloudinary));

      // Save to Firestore
      await addDoc(collection(db, "pending_submissions"), {
        category,
        title,
        description,
        eventDate: category === "events" ? eventDate : null,
        link: link || null,
        images: imageUrls,
        createdAt: new Date(),
      });

      alert("Submission saved!");
      // Reset form
      setCategory("");
      setTitle("");
      setDescription("");
      setEventDate("");
      setLink("");
      setImages([]);
    } catch (err) {
      console.error(err);
      alert("Error saving submission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, padding: 24, fontFamily: "system-ui" }}>
      <h1>Internal Update Submission</h1>

      <label>
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          style={{ display: "block", width: "100%", marginBottom: 12 }}
        >
          <option value="">Select one</option>
          <option value="club">Club</option>
          <option value="pantry">Pantry</option>
          <option value="events">Events</option>
        </select>
      </label>

      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 12 }}
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ display: "block", width: "100%", marginBottom: 12 }}
        />
      </label>

      {category === "events" && (
        <label>
          Event Date
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: 12 }}
          />
        </label>
      )}

      <label>
        Link
        <input
          type="url"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 12 }}
        />
      </label>

      <label>
        Upload Images
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) setImages(Array.from(e.target.files));
          }}
          style={{ display: "block", marginBottom: 16 }}
        />
      </label>

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}