"use client";

import React, { useEffect, useState } from "react";

type Attachment = { url: string; type: "image" | "video" };

type EventItem = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  attachments: Attachment[];
  createdAt?: string;
};

const isVideoUrl = (url: string) =>
  url.includes(".mp4") || url.includes(".webm") || url.includes("youtu");

export default function EventManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Load events
  async function loadEvents() {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (err) {
      console.error("loadEvents", err);
      setEvents([]);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // File input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const newAtt: Attachment[] = [];

  for (const f of Array.from(files)) {
    const base64 = await fileToBase64(f);
    const type: "image" | "video" =
      f.type.startsWith("video") ? "video" : "image";

    newAtt.push({ url: base64, type });
  }

  setAttachments(prev => [...prev, ...newAtt]);
};

// Utility to convert file → base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Publish event
  const publish = async () => {
    if (!title || !startDate || !endDate) {
      alert("Please fill Title, Start Date and End Date");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be before or equal to End date");
      return;
    }

    setPublishing(true);
    try {
      const body = { title, description, startDate, endDate, attachments };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok && json?.status === "success") {
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setAttachments([]);
        await loadEvents();
      } else {
        alert(json?.message || "Publish failed");
      }
    } catch (err) {
      console.error("publish", err);
      alert("Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete event?")) return;

    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json?.status === "success") {
        await loadEvents();
      } else {
        alert(json?.message || "Delete failed");
      }
    } catch (err) {
      console.error("delete", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900/70 border border-red-800 p-8 rounded-2xl">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        🏁 Event Manager
      </h2>

      <div className="space-y-4">
        {/* Title */}
        <label className="block text-sm font-semibold">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-black/50 border border-red-700 rounded-lg text-white"
        />

        {/* Start/End Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-black/50 border border-red-700 rounded-lg text-white cursor-pointer"
              />
              {/* visible calendar icon */}
              <span className="absolute right-3 top-3 text-red-400 pointer-events-none">
                📅
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-black/50 border border-red-700 rounded-lg text-white cursor-pointer"
              />
              <span className="absolute right-3 top-3 text-red-400 pointer-events-none">
                📅
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <label className="block text-sm font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 bg-black/50 border border-red-700 rounded-lg text-white h-28"
        />

        {/* File Upload */}
        <label className="block text-sm font-semibold">
          Attachments (photo/video)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="w-full p-2 bg-black/50 border border-red-700 rounded-lg text-white"
        />

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden border border-red-700"
              >
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute right-1 top-1 bg-black/60 text-white px-2 py-1 rounded z-10"
                >
                  ✖
                </button>

                {a.type === "video" ? (
                  <video
                    src={a.url}
                    controls
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <img
                    src={a.url}
                    alt=""
                    className="w-full h-32 object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Publish button */}
        <button
          onClick={publish}
          disabled={publishing}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {publishing ? "Publishing..." : "➕ Publish Event"}
        </button>
      </div>

      {/* Events list */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-red-400">📅 Created Events</h3>

        {events.length === 0 ? (
          <p className="text-gray-400 italic">No events yet.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="bg-black/50 border border-red-700 p-3 rounded-lg flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="font-semibold text-white">{ev.title}</div>
                  <div className="text-sm text-gray-400">
                    {ev.startDate} → {ev.endDate}
                  </div>
                  {ev.description && (
                    <div className="text-gray-300 text-sm mt-1 line-clamp-2">
                      {ev.description}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  {ev.attachments?.[0] &&
                    (ev.attachments[0].type === "video" ? (
                      <video
                        src={ev.attachments[0].url}
                        className="w-28 h-16 object-cover rounded"
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={ev.attachments[0].url}
                        className="w-28 h-16 object-cover rounded"
                        alt=""
                      />
                    ))}

                  <button
                    onClick={() => handleDeleteEvent(ev._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
