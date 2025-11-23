"use client";

import React, { useEffect, useState } from "react";

type Attachment = { url: string; type: "image" | "video" };
type EventItem = {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  attachments: Attachment[];
  created_at?: string;
};

export default function EventManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<Attachment[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [publishing, setPublishing] = useState(false);

  // Load events from DB
  async function loadEvents() {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("loadEvents", err);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);

    const previews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? ("video" as const) : ("image" as const),
    }));

    setPreview((prev) => [...prev, ...previews]);
  };

  const removeAttachment = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload file → Supabase Storage
  async function uploadFile(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "events");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    if (!json.success) return null;
    return json.url;
  }

  // Publish event
  const publish = async () => {
    if (!title || !startDate || !endDate) {
      alert("Please fill Title, Start Date and End Date");
      return;
    }

    setPublishing(true);

    try {
      // Upload attachments first
      const uploadedAttachments: Attachment[] = [];

      for (const file of files) {
        const url = await uploadFile(file);
        if (url) {
          uploadedAttachments.push({
            url,
            type: file.type.startsWith("video") ? ("video" as const) : ("image" as const),
          });
        }
      }

      // Save event into Supabase
      const body = {
        title,
        description,
        startDate,
        endDate,
        attachments: uploadedAttachments,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.status === "success") {
        // Reset form
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setFiles([]);
        setPreview([]);

        loadEvents();
      } else {
        alert("Failed to publish event");
      }
    } catch (err) {
      console.error("publish", err);
      alert("Error publishing event");
    } finally {
      setPublishing(false);
    }
  };

  // Delete event
  async function deleteEvent(id: string) {
    if (!confirm("Delete event?")) return;

    const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    const json = await res.json();

    if (json.success) {
      loadEvents();
    } else {
      alert("Delete failed");
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900/70 border border-red-800 p-8 rounded-2xl">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        🏁 Event Manager
      </h2>

      {/* FORM */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold">Title</label>
        <input
          className="w-full p-3 bg-black/50 border border-red-700 rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Start Date</label>
            <input
              type="date"
              className="w-full p-3 bg-black/50 border border-red-700 rounded-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">End Date</label>
            <input
              type="date"
              className="w-full p-3 bg-black/50 border border-red-700 rounded-lg"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <label className="block text-sm font-semibold">Description</label>
        <textarea
          className="w-full p-3 bg-black/50 border border-red-700 rounded-lg h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block text-sm font-semibold">Attachments</label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="w-full bg-black/50 border border-red-700 p-2 rounded-lg"
        />

        {/* PREVIEW */}
        {preview.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-3">
            {preview.map((p, i) => (
              <div key={i} className="relative border border-red-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute right-1 top-1 bg-black/70 text-white px-2 py-1 rounded"
                >
                  ✖
                </button>
                {p.type === "video" ? (
                  <video src={p.url} className="w-full h-32 object-cover" />
                ) : (
                  <img src={p.url} className="w-full h-32 object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={publish}
          disabled={publishing}
          className="w-full bg-red-600 py-3 rounded-lg"
        >
          {publishing ? "Publishing..." : "Publish Event"}
        </button>
      </div>

      {/* EVENT LIST */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-red-500">Created Events</h3>

        <div className="mt-4 space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="border border-red-700 p-4 rounded-lg flex justify-between">
              <div>
                <p className="font-bold">{ev.title}</p>
                <p className="text-gray-400">
                  {ev.start_date} → {ev.end_date}
                </p>
              </div>

              <button
                onClick={() => deleteEvent(ev.id)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
