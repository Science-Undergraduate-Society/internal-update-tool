"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SectionPicker from "@/components/dashboard/SectionPicker";
import StatusToast from "@/components/dashboard/StatusToast";
import ClubsForm from "@/components/dashboard/forms/ClubsForm";
import TutorsForm from "@/components/dashboard/forms/TutorsForm";
import EventsForm from "@/components/dashboard/forms/EventsForm";
import ExecutivesForm from "@/components/dashboard/forms/ExecutivesForm";
import BookingForm from "@/components/dashboard/forms/BookingForm";
import GrantsForm from "@/components/dashboard/forms/GrantsForm";
import BlueCardForm from "@/components/dashboard/forms/BlueCardForm";
import { SectionType } from "@/types/submissions";
import styles from "@/styles/dashboard.css";

const FORM_MAP = {
  clubs: ClubsForm,
  tutors: TutorsForm,
  events: EventsForm,
  executives: ExecutivesForm,
  booking: BookingForm,
  grants: GrantsForm,
  bluecard: BlueCardForm,
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [section, setSection] = useState<SectionType | "">("");
  const [toastStatus, setToastStatus] = useState<"success" | "error" | null>(null);

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const ActiveForm = section ? FORM_MAP[section] : null;

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data, submittedBy: session?.user?.email }),
      });
      setToastStatus(res.ok ? "success" : "error");
    } catch {
      setToastStatus("error");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>SUS Admin Portal</h1>
        <p>Signed in as {session?.user?.email}</p>
      </div>
      <div className={styles.sectionPicker}>
        <SectionPicker value={section} onChange={setSection} />
      </div>
      {ActiveForm && (
        <div className={styles.formArea}>
          <ActiveForm onSubmit={handleSubmit} />
        </div>
      )}
      <StatusToast status={toastStatus} />
    </main>
  );
}
