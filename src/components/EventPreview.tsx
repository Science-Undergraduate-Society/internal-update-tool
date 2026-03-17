"use client";

import { useState } from "react";

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

const WWW_URL = process.env.NEXT_PUBLIC_WWW_URL ?? "http://localhost:3001";

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
            <button type="button" onClick={() => setOpen(true)}>
                Preview
            </button>

            {open && (
                <div
                    onClick={onClose}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 1000, height: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}
                    >
                        {/* Modal header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Preview on public site</span>
                            <div style={{ display: "flex", gap: 4 }}>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveMode(tab.key)}
                                        style={{
                                            padding: "5px 12px",
                                            fontSize: 12,
                                            fontWeight: activeMode === tab.key ? 600 : 400,
                                            background: activeMode === tab.key ? "#222755" : "transparent",
                                            color: activeMode === tab.key ? "#fff" : "#555",
                                            border: "1px solid #ccc",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#888", lineHeight: 1 }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* iframe */}
                        <iframe
                            key={activeMode}
                            src={buildPreviewUrl(data, activeMode)}
                            style={{ flex: 1, border: "none", width: "100%" }}
                            title="Event preview"
                        />
                    </div>
                </div>
            )}
        </>
    );

    function onClose() {
        setOpen(false);
    }
}
