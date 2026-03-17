"use client";

import { useState } from "react";
import styles from "./EventPreview.module.css";

export interface EventPreviewData {
  title: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  link?: string;
  image?: string;
  isInitiative?: boolean;
}

type Mode = "current" | "upcoming" | "initiative";

const WWW_URL = process.env.NEXT_PUBLIC_WWW_URL ?? "http://localhost:3000";

function buildPreviewUrl(data: EventPreviewData, mode: Mode): string {
  const params = new URLSearchParams({ mode });
  if (data.title) params.set("title", data.title);
  if (data.description) params.set("description", data.description);
  if (data.date) params.set("date", data.date);
  if (data.time) params.set("time", data.time);
  if (data.location) params.set("location", data.location);
  if (data.link) params.set("link", data.link);
  if (data.image) params.set("image", data.image);
  return `${WWW_URL}/preview/events?${params.toString()}`;
}

export default function PreviewButton({ data }: { data: EventPreviewData }) {
  const [open, setOpen] = useState(false);

  const tabs: { key: Mode; label: string }[] = data.isInitiative
    ? [{ key: "initiative", label: "Initiative" }]
    : [
        { key: "current", label: "Current Month" },
        { key: "upcoming", label: "Upcoming" },
        { key: "initiative", label: "As Initiative" },
      ];

  const [activeMode, setActiveMode] = useState<Mode>(data.isInitiative ? "initiative" : "current");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Preview</button>

      {open && (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderText}>Preview on public site</span>
              <div className={styles.tabList}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveMode(tab.key)}
                    className={`${styles.tab} ${activeMode === tab.key ? styles.tabActive : ""}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button className={styles.closeButton} onClick={() => setOpen(false)}>✕</button>
            </div>

            <iframe
              key={activeMode}
              src={buildPreviewUrl(data, activeMode)}
              className={styles.iframe}
              title="Event preview"
            />
          </div>
        </div>
      )}
    </>
  );
}
