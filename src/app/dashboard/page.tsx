"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; 

type Category = "clubs" | "pantry" | "events";

interface Submission {
  id: string;
  title: string;
  description: string;
  eventDate?: string;
  link?: string;
  images?: string[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<Record<Category, Submission[]>>({
    clubs: [],
    pantry: [],
    events: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<Category>("clubs");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState("");

  // Fetch all collections
  const fetchData = async () => {
    const categories: Category[] = ["clubs", "pantry", "events"];
    const newData: Record<Category, Submission[]> = {
      clubs: [],
      pantry: [],
      events: [],
    };

    for (const cat of categories) {
      const snapshot = await getDocs(collection(db, cat));
      newData[cat] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Submission, "id">),
      }));
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

  const handleEdit = (submission: Submission) => {
    setEditingId(submission.id);
    setEditingTitle(submission.title);
    setEditingDesc(submission.description);
  };

  const handleSave = async () => {
    if (!editingId) return;
    const docRef = doc(db, selectedCategory, editingId);
    await updateDoc(docRef, {
      title: editingTitle,
      description: editingDesc,
    });
    setEditingId(null);
    fetchData();
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
          <option value="clubs">Clubs</option>
          <option value="pantry">Pantry</option>
          <option value="events">Events</option>
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
          {editingId === item.id ? (
            <>
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                style={{ display: "block", marginBottom: 8, width: "100%" }}
              />
              <textarea
                value={editingDesc}
                onChange={(e) => setEditingDesc(e.target.value)}
                rows={3}
                style={{ display: "block", marginBottom: 8, width: "100%" }}
              />
              <button onClick={handleSave} style={{ marginRight: 8 }}>
                Save
              </button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.eventDate && <p>Date: {item.eventDate}</p>}
              {item.link && (
                <p>
                  Link:{" "}
                  <a href={item.link} target="_blank" rel="noreferrer">
                    {item.link}
                  </a>
                </p>
              )}
              {item.images?.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={item.title}
                  style={{ width: 100, height: 100, objectFit: "cover", marginRight: 4 }}
                />
              ))}
              <div style={{ marginTop: 8 }}>
                <button onClick={() => handleEdit(item)} style={{ marginRight: 8 }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(selectedCategory, item.id)}>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {data[selectedCategory].length === 0 && <p>No submissions found.</p>}
    </div>
  );
}