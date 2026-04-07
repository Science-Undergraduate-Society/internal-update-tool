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
import PreviewButton from "../../components/EventPreview";
import styles from "./review.module.css";

interface PendingSubmission {
  id: string;
  section: string;
  action?: "delete";
  data: Record<string, unknown>;
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

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (sub: PendingSubmission) => {
    try {
      if (sub.action === "delete" && sub.linkedDocId && sub.linkedCollection) {
        await deleteDoc(doc(db, sub.linkedCollection, sub.linkedDocId));
      } else if (sub.linkedDocId && sub.linkedCollection) {
        await setDoc(doc(db, sub.linkedCollection, sub.linkedDocId), { ...sub.data });
      } else {
        await addDoc(collection(db, sub.section), { ...sub.data });
      }

      await deleteDoc(doc(db, "submissions", sub.id));

      await fetch(`${process.env.NEXT_PUBLIC_WWW_URL}/api/revalidate`, {
        method: "POST",
        headers: { "x-revalidate-secret": process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? "" },
      }).catch(() => {});

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
    <div className={styles.page}>
      <h1>Pending Submissions</h1>

      {pending.length === 0 && <p>No pending submissions.</p>}

      {pending.map((sub) => (
        <div
          key={sub.id}
          className={`itemCard ${sub.action === "delete" ? "itemCardDelete" : sub.linkedDocId ? "itemCardEdit" : ""}`}
        >
          {sub.action === "delete" && (
            <div className="badge badgeDelete">Deletion Request</div>
          )}
          {!sub.action && sub.linkedDocId && (
            <div className="badge badgeEdit">Edit Request</div>
          )}
          {!sub.action && !sub.linkedDocId && (
            <div className="badge badgeNew">New Submission</div>
          )}
          <p className={styles.sectionLabel}><strong>Section:</strong> {sub.section}</p>
          {(() => {
            const d = sub.data;
            const isEvent = sub.section === "events" || sub.section === "initiatives";
            const ordered = isEvent
              ? ["title", "date", "time", "location", "description", "links", "images"]
              : Object.keys(d);
            const remaining = Object.keys(d).filter(
              (k) => !ordered.includes(k) && k !== "isFeatured"
            );
            const keys = [...ordered, ...remaining];

            const isEmpty = (v: unknown) =>
              v === null || v === undefined || v === "" ||
              (Array.isArray(v) && v.filter(Boolean).length === 0);

            return (
              <>
                {keys.map((key) => {
                  const value = d[key];
                  if (isEmpty(value)) {
                    return <p key={key}><strong>{key}:</strong> <span className={styles.none}>none specified</span></p>;
                  }
                  if (Array.isArray(value)) {
                    return value.filter(Boolean).map((v, i) => (
                      <p key={`${key}-${i}`}>
                        <strong>{key}:</strong>{" "}
                        {typeof v === "string" && v.startsWith("http")
                          ? <a href={v} target="_blank" rel="noreferrer">{v}</a>
                          : String(v)}
                      </p>
                    ));
                  }
                  return (
                    <p key={key}>
                      <strong>{key}:</strong>{" "}
                      {typeof value === "string" && value.startsWith("http")
                        ? <a href={value} target="_blank" rel="noreferrer">{value}</a>
                        : String(value)}
                    </p>
                  );
                })}
                <p><strong>Featured:</strong> {d.isFeatured === true ? "Yes" : "No"}</p>
              </>
            );
          })()}

          <div className="actionRow">
            <button className={styles.approveButton} onClick={() => handleApprove(sub)}>Approve</button>
            <button className={styles.rejectButton} onClick={() => handleReject(sub)}>Reject</button>
            {(sub.section === "events" || sub.section === "initiatives") && (
              <PreviewButton data={{
                title: (sub.data.title as string) ?? "",
                description: (sub.data.description as string) ?? "",
                date: sub.data.date as string | undefined,
                time: sub.data.time as string | undefined,
                location: sub.data.location as string | undefined,
                link: Array.isArray(sub.data.links) ? (sub.data.links as string[])[0] : sub.data.link as string | undefined,
                image: Array.isArray(sub.data.images) ? (sub.data.images as string[])[0] : sub.data.image as string | undefined,
                isInitiative: sub.section === "initiatives",
              }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
