"use client";

interface Props {
  status: "success" | "error" | null;
  message?: string;
}

export default function StatusToast({ status, message }: Props) {
  if (!status) return null;

  return (
    <div style={{ color: status === "success" ? "green" : "red" }}>
      {message ?? (status === "success" ? "Submitted successfully!" : "Something went wrong.")}
    </div>
  );
}
