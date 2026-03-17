"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { SectionType } from "../../types/submissions";
import PreviewButton from "../../components/EventPreview";

type Category = SectionType | "pantry" | "initiatives";

interface Submission {
  id: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  link?: string;
  image?: string;
}

const DIRECT_COLLECTIONS: Category[] = ["clubs", "pantry", "events", "initiatives", "tutors"];
const CATEGORIES: Category[] = ["clubs", "pantry", "events", "initiatives", "tutors"];

export default function AdminDashboard() {
  const [data, setData] = useState<Record<Category, Submission[]>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, []])) as unknown as Record<Category, Submission[]>
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>("events");
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set());
  const [pendingEdits, setPendingEdits] = useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchData = async () => {
    const newData = Object.fromEntries(CATEGORIES.map((c) => [c, []])) as unknown as Record<Category, Submission[]>;

    // All categories read directly from their own top-level collection
    for (const cat of DIRECT_COLLECTIONS) {
      const snapshot = await getDocs(collection(db, cat));
      newData[cat] = snapshot.docs.map((d) => {
        const raw = d.data() as Record<string, string>;
        return {
          id: d.id,
          title: raw.title ?? raw.name ?? "",
          description: raw.description ?? raw.bio ?? "",
          date: raw.date ?? "",
          time: raw.time ?? "",
          location: raw.location ?? "",
          link: raw.link ?? "",
          image: raw.image ?? raw.poster ?? "",
        };
      });
    }
    // Fetch pending deletion requests to flag items
    const deletionQuery = query(
      collection(db, "submissions"),
      where("action", "==", "delete"),
      where("status", "==", "pending")
    );
    const deletionSnapshot = await getDocs(deletionQuery);
    setPendingDeletions(new Set(deletionSnapshot.docs.map((d) => d.data().linkedDocId as string)));

    // Fetch pending edit requests to flag items
    const editQuery = query(
      collection(db, "submissions"),
      where("status", "==", "pending")
    );
    const editSnapshot = await getDocs(editQuery);
    setPendingEdits(new Set(
      editSnapshot.docs
        .filter((d) => d.data().linkedDocId && !d.data().action)
        .map((d) => d.data().linkedDocId as string)
    ));

    setData(newData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (category: Category, item: Submission) => {
    if (!confirm("Submit this deletion for review?")) return;
    await addDoc(collection(db, "submissions"), {
      section: category,
      status: "pending",
      action: "delete",
      linkedDocId: item.id,
      linkedCollection: category,
      data: { title: item.title, description: item.description },
    });
    alert("Deletion request submitted for review.");
  };

  const handleEdit = (item: Submission) => {
    const params = new URLSearchParams({
      editId: item.id,
      collection: selectedCategory,
      title: item.title ?? "",
      description: item.description ?? "",
      date: item.date ?? "",
      time: item.time ?? "",
      location: item.location ?? "",
      link: item.link ?? "",
      image: item.image ?? "",
    });
    router.push(`/submission?${params.toString()}`);
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Admin Dashboard</h1>

      {/* Category selector */}
      <label>
        Select Category:
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as Category)}
          style={{ display: "block", margin: "12px 0", padding: 6 }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "initiatives" ? "Initiatives" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </label>

      {/* Submissions */}
      {data[selectedCategory].map((item) => (
        <div
          key={item.id}
          style={{
            border: `1px solid ${pendingDeletions.has(item.id) ? "#fca5a5" : pendingEdits.has(item.id) ? "#fde68a" : "#ccc"}`,
            padding: 12,
            marginBottom: 12,
            borderRadius: 6,
          }}
        >
          {pendingDeletions.has(item.id) && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "6px 10px", borderRadius: 4, marginBottom: 8, fontWeight: 600, fontSize: "0.875rem" }}>
              🗑️ Deletion Pending Review
            </div>
          )}
          {pendingEdits.has(item.id) && (
            <div style={{ background: "#fef3c7", color: "#92400e", padding: "6px 10px", borderRadius: 4, marginBottom: 8, fontWeight: 600, fontSize: "0.875rem" }}>
              ✏️ Edit Pending Review
            </div>
          )}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.date && <p>Date: {item.date}{item.time ? ` at ${item.time}` : ""}</p>}
          {item.location && <p>Location: {item.location}</p>}
          {item.link && (
            <p>
              Link:{" "}
              <a href={item.link} target="_blank" rel="noreferrer">
                {item.link}
              </a>
            </p>
          )}
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              style={{ width: 100, height: 100, objectFit: "cover", marginRight: 4 }}
            />
          )}
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button
              onClick={() => handleDelete(selectedCategory, item)}
              disabled={pendingDeletions.has(item.id)}
            >
              Delete
            </button>
            {(selectedCategory === "events" || selectedCategory === "initiatives") && (
              <PreviewButton data={{
                title: item.title,
                description: item.description,
                date: item.date,
                time: item.time,
                location: item.location,
                link: item.link,
                image: item.image,
                isInitiative: selectedCategory === "initiatives",
              }} />
            )}
          </div>
        </div>
      ))}

      {data[selectedCategory].length === 0 && <p>No submissions found.</p>}
    </div>
  );
}