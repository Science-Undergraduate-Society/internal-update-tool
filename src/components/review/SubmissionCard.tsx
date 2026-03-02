"use client";
import { Submission } from "@/types/submissions";

interface Props {
  submission: Submission;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
}

export default function SubmissionCard({ submission, onApprove, onReject }: Props) {
  return (
    <div>
      <p><strong>Section:</strong> {submission.section}</p>
      <p><strong>Submitted by:</strong> {submission.submittedBy}</p>
      <pre>{JSON.stringify(submission.data, null, 2)}</pre>
      <button onClick={() => onApprove(submission.id!)}>Approve</button>
      <button onClick={() => onReject(submission.id!, "Needs revision")}>Reject</button>
    </div>
  );
}
