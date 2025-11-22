// app/components/EventCard.tsx
"use client";

import React from "react";

type Attachment = { url: string; type: "image" | "video" };
type EventItem = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  attachments: Attachment[];
};

export default function EventCard({ event, compact = false }: { event: EventItem; compact?: boolean }) {
  const thumb = event.attachments?.[0];

  return (
    <div className={`bg-black/40 border border-red-800 rounded-xl p-4 ${compact ? "flex items-center gap-4" : ""}`}>
      <div className={`${compact ? "w-28 h-20 flex-shrink-0" : "w-full md:w-56 h-40" } overflow-hidden rounded-lg`}>
        {thumb ? (thumb.type === "video" ? (
          <video src={thumb.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
        ) : (
          <img src={thumb.url} className="w-full h-full object-cover" alt={event.title} />
        )) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-gray-500">No media</div>
        )}
      </div>

      <div className={`${compact ? "flex-1" : "mt-4 md:ml-4"}`}>
        <h3 className="text-xl font-bold text-red-400">{event.title}</h3>
        <p className="text-sm text-gray-300">{new Date(event.startDate).toLocaleDateString()} → {new Date(event.endDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
