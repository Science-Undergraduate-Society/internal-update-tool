"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; // adjust path

type Category = "club" | "pantry" | "events";

interface PendingSubmission {
  id: string;
  title: string;
  description: string;
  category: Category;
  eventDate?: string;
  link?: string;
  images?: string[];
  createdAt: any;
}

export default function PendingSubmissionsPage() {
  const [pending, setPending] = useState<PendingSubmission[]>([]);

  // Fetch all pending submissions
  const fetchPending = async () => {
    const snapshot = await getDocs(collection(db, "pending_submissions"));
    const subs: PendingSubmission[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PendingSubmission, "id">),
    }));
    setPending(subs);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Approve: move to permanent collection
  const handleApprove = async (sub: PendingSubmission) => {
    const targetCollection = sub.category + "s"; // clubs / pantries / events
    try {
      // Add to permanent collection
      await addDoc(collection(db, targetCollection), {
        title: sub.title,
        description: sub.description,
        eventDate: sub.eventDate || null,
        link: sub.link || null,
        images: sub.images || [],
        createdAt: sub.createdAt,
      });
      // Delete from pending
      await deleteDoc(doc(db, "pending_submissions", sub.id));
      fetchPending();
    } catch (err) {
      console.error("Error approving submission:", err);
      alert("Failed to approve submission");
    }
  };

  // Reject: just delete
  const handleReject = async (sub: PendingSubmission) => {
    if (!confirm("Are you sure you want to reject this submission?")) return;
    await deleteDoc(doc(db, "pending_submissions", sub.id));
    fetchPending();
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Pending Submissions</h1>

      {pending.length === 0 && <p>No pending submissions.</p>}

      {pending.map((sub) => (
        <div
          key={sub.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 6,
          }}
        >
          <h3>{sub.title}</h3>
          <p>{sub.description}</p>
          <p>
            <strong>Category:</strong> {sub.category}
          </p>
          {sub.eventDate && <p>Date: {sub.eventDate}</p>}
          {sub.link && (
            <p>
              Link:{" "}
              <a href={sub.link} target="_blank" rel="noreferrer">
                {sub.link}
              </a>
            </p>
          )}
          {sub.images?.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={sub.title}
              style={{
                width: 100,
                height: 100,
                objectFit: "cover",
                marginRight: 4,
                marginBottom: 4,
              }}
            />
          ))}

          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => handleApprove(sub)}
              style={{ marginRight: 8, background: "green", color: "white" }}
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(sub)}
              style={{ background: "red", color: "white" }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}