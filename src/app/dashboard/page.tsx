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
import styles from "./dashboard.module.css";

type Category = SectionType | "pantry" | "initiatives";

interface Submission {
  id: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  links?: string[];
  images?: string[];
  isFeatured?: boolean;
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

    for (const cat of DIRECT_COLLECTIONS) {
      const snapshot = await getDocs(collection(db, cat));
      newData[cat] = snapshot.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          title: (raw.title as string) ?? (raw.name as string) ?? "",
          description: (raw.description as string) ?? (raw.bio as string) ?? "",
          date: (raw.date as string) ?? "",
          time: (raw.time as string) ?? "",
          location: (raw.location as string) ?? "",
          links: Array.isArray(raw.links) ? raw.links as string[] : raw.link ? [raw.link as string] : [],
          images: Array.isArray(raw.images) ? raw.images as string[] : (raw.image ?? raw.poster) ? [(raw.image ?? raw.poster) as string] : [],
          isFeatured: raw.isFeatured === true,
        };
      });
    }

    const deletionQuery = query(
      collection(db, "submissions"),
      where("action", "==", "delete"),
      where("status", "==", "pending")
    );
    const deletionSnapshot = await getDocs(deletionQuery);
    setPendingDeletions(new Set(deletionSnapshot.docs.map((d) => d.data().linkedDocId as string)));

    const editQuery = query(collection(db, "submissions"), where("status", "==", "pending"));
    const editSnapshot = await getDocs(editQuery);
    setPendingEdits(new Set(
      editSnapshot.docs
        .filter((d) => d.data().linkedDocId && !d.data().action)
        .map((d) => d.data().linkedDocId as string)
    ));

    setData(newData);
  };

  useEffect(() => { fetchData(); }, []);

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
    await fetchData();
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
      isFeatured: String(item.isFeatured ?? false),
    });
    (item.links ?? []).forEach((l) => params.append("links", l));
    (item.images ?? []).forEach((img) => params.append("images", img));
    router.push(`/submission?${params.toString()}`);
  };

  return (
    <div className={styles.page}>
      <h1>Admin Dashboard</h1>

      <label>
        Select Category:
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as Category)}
          className={styles.categorySelect}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "initiatives" ? "Initiatives" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </label>

      {data[selectedCategory].map((item) => (
        <div
          key={item.id}
          className={`itemCard ${pendingDeletions.has(item.id) ? "itemCardDelete" : pendingEdits.has(item.id) ? "itemCardEdit" : ""}`}
        >
          {pendingDeletions.has(item.id) && (
            <div className="badge badgeDelete">Deletion Pending Review</div>
          )}
          {pendingEdits.has(item.id) && (
            <div className="badge badgeEdit">Edit Pending Review</div>
          )}
          {item.isFeatured && (
            <div className="badge badgeNew">Featured in Upcoming Events</div>
          )}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.date && <p>Date: {item.date}{item.time ? ` at ${item.time}` : ""}</p>}
          {item.location && <p>Location: {item.location}</p>}
          {(item.links ?? []).map((l, i) => (
            <p key={i}>Link: <a href={l} target="_blank" rel="noreferrer">{l}</a></p>
          ))}
          {(item.images ?? []).length > 0 && (
            <div className={styles.thumbnailRow}>
              {item.images!.map((img, i) => (
                <img key={i} src={img} alt={`${item.title} ${i + 1}`} className={styles.itemThumbnail} />
              ))}
            </div>
          )}
          <div className="actionRow">
            <button onClick={() => handleEdit(item)} disabled={pendingDeletions.has(item.id)}>Edit</button>
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
                isInitiative: selectedCategory === "initiatives",
                link: (item.links ?? [])[0],
                image: (item.images ?? [])[0],
              }} />
            )}
          </div>
        </div>
      ))}

      {data[selectedCategory].length === 0 && <p>No submissions found.</p>}
    </div>
  );
}
