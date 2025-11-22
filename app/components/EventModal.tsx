// app/components/EventModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Attachment = { url: string; type: "image" | "video" };
type EventItem = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  attachments: Attachment[];
};

export default function EventModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, event.attachments.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [event.attachments.length, onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const current = event.attachments[index];

  return (
    <div ref={overlayRef} onClick={handleClickOutside} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-6 rounded-2xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-red-400">{event.title}</h3>
            <p className="text-sm text-gray-300">{event.startDate} → {event.endDate}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl">✖</button>
        </div>

        <div className="mt-4">
          {current && current.type === "video" ? (
            <video key={index} src={current.url} controls className="w-full h-64 object-contain" />
          ) : (
            <img key={index} src={current?.url} className="w-full h-64 object-contain" />
          )}
        </div>

        {event.attachments.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {event.attachments.map((a, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-24 h-16 rounded overflow-hidden border ${i === index ? "border-red-500" : "border-zinc-700"}`}>
                {a.type === "video" ? <video src={a.url} className="w-full h-full object-cover" muted autoPlay loop playsInline /> : <img src={a.url} className="w-full h-full object-cover" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
