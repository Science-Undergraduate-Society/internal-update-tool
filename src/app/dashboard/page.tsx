"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { SectionType } from "../../types/submissions";

type Category = SectionType | "pantry";

interface Submission {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  link?: string;
  poster?: string;
}

const DIRECT_COLLECTIONS: Category[] = ["clubs", "pantry", "events", "tutors"];
const CATEGORIES: Category[] = ["clubs", "pantry", "events", "tutors"];

export default function AdminDashboard() {
  const [data, setData] = useState<Record<Category, Submission[]>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, []])) as unknown as Record<Category, Submission[]>
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>("events");
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
          location: raw.location ?? "",
          link: raw.link ?? "",
          poster: raw.poster ?? "",
        };
      });
    }
    setData(newData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (category: Category, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await deleteDoc(doc(db, category, id));
    fetchData();
  };

  const handleEdit = (item: Submission) => {
    const params = new URLSearchParams({
      editId: item.id,
      collection: selectedCategory,
      title: item.title ?? "",
      description: item.description ?? "",
      date: item.date ?? "",
      location: item.location ?? "",
      link: item.link ?? "",
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
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </label>

      {/* Submissions */}
      {data[selectedCategory].map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 6,
          }}
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.date && <p>Date: {item.date}</p>}
          {item.location && <p>Location: {item.location}</p>}
          {item.link && (
            <p>
              Link:{" "}
              <a href={item.link} target="_blank" rel="noreferrer">
                {item.link}
              </a>
            </p>
          )}
          {item.poster && (
            <img
              src={item.poster}
              alt={item.title}
              style={{ width: 100, height: 100, objectFit: "cover", marginRight: 4 }}
            />
          )}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => handleEdit(item)} style={{ marginRight: 8 }}>
              Edit
            </button>
            <button onClick={() => handleDelete(selectedCategory, item.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {data[selectedCategory].length === 0 && <p>No submissions found.</p>}
    </div>
  );
}