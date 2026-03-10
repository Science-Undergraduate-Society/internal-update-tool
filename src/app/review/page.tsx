"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface PendingSubmission {
  id: string;
  section: string;
  data: Record<string, string>;
  linkedDocId?: string;
  linkedCollection?: string;
}

export default function PendingSubmissionsPage() {
  const [pending, setPending] = useState<PendingSubmission[]>([]);

  const fetchPending = async () => {
    const q = query(collection(db, "submissions"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    setPending(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PendingSubmission, "id">) })));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (sub: PendingSubmission) => {
    try {
      const payload = { ...sub.data };

      if (sub.linkedDocId && sub.linkedCollection) {
        // Edit of existing doc — overwrite in place
        await setDoc(doc(db, sub.linkedCollection, sub.linkedDocId), payload);
      } else {
        // New submission — add to collection
        await addDoc(collection(db, sub.section), payload);
      }

      await deleteDoc(doc(db, "submissions", sub.id));
      fetchPending();
    } catch (err) {
      console.error("Error approving submission:", err);
      alert("Failed to approve submission");
    }
  };

  const handleReject = async (sub: PendingSubmission) => {
    if (!confirm("Are you sure you want to reject this submission?")) return;
    await deleteDoc(doc(db, "submissions", sub.id));
    fetchPending();
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Pending Submissions</h1>

      {pending.length === 0 && <p>No pending submissions.</p>}

      {pending.map((sub) => (
        <div
          key={sub.id}
          style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12, borderRadius: 6 }}
        >
          <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: 4 }}>
            <strong>Section:</strong> {sub.section}
            {sub.linkedDocId && (
              <span style={{ marginLeft: 8, background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: 4, fontSize: "0.75rem" }}>
                ✏️ Edit of existing item
              </span>
            )}
          </p>
          {Object.entries(sub.data).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong>{" "}
              {value?.startsWith?.("http") ? (
                <a href={value} target="_blank" rel="noreferrer">{value}</a>
              ) : (
                value
              )}
            </p>
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
