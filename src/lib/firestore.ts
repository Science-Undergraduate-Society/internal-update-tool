import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { Submission } from "@/types/submissions";

export async function createSubmission(submission: Omit<Submission, "id" | "submittedAt" | "status">) {
  return await addDoc(collection(db, "submissions"), {
    ...submission,
    status: "pending",
    submittedAt: serverTimestamp(),
  });
}

export async function getPendingSubmissions() {
  const q = query(collection(db, "submissions"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateSubmissionStatus(
  id: string,
  status: "approved" | "rejected",
  reviewedBy: string,
  reviewNote?: string
) {
  return await updateDoc(doc(db, "submissions", id), {
    status,
    reviewedBy,
    reviewNote: reviewNote ?? "",
  });
}
