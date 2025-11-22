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
};

function monthKeyFromDate(d: Date) {
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

function monthsBetween(start: Date, end: Date) {
  const months: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    months.push(monthKeyFromDate(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export default function EventCalendarList() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EventItem | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (err) {
      console.error("load events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Group by month. Multi-month: put event into each month it spans.
  const grouped: Record<string, EventItem[]> = {};
  events.forEach((ev) => {
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    const months = monthsBetween(s, e);
    months.forEach((m) => {
      if (!grouped[m]) grouped[m] = [];
      grouped[m].push(ev);
    });
  });

  const sortedMonthKeys = Object.keys(grouped).sort((a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    return da.getTime() - db.getTime();
  });

  if (loading) return <div className="text-center text-gray-400 py-10">Loading events...</div>;
  if (events.length === 0) return <div className="text-center text-gray-400 py-10">No upcoming events.</div>;

  return (
    <div className="space-y-10">
      {sortedMonthKeys.map((month) => (
        <section key={month}>
          <h2 className="text-3xl font-bold text-red-400 mb-4">{month}</h2>

          {/* ✅ Updated: list view instead of cards */}
          <div className="space-y-3">
            {grouped[month].map((ev) => (
              <div
                key={ev._id}
                onClick={() => setSelected(ev)}
                className="cursor-pointer bg-black/40 rounded-xl p-4 border border-red-700 
                hover:bg-black/60 hover:scale-[0.99] transition-all 
                flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{ev.title}</h3>
                  <p className="text-sm text-gray-300">{ev.startDate} → {ev.endDate}</p>
                </div>

                {ev.attachments?.[0] && (
                  ev.attachments[0].type === "image" ? (
                    <img src={ev.attachments[0].url} alt="" className="w-24 h-16 object-cover rounded-lg ml-4" />
                  ) : (
                    <video src={ev.attachments[0].url} className="w-24 h-16 object-cover rounded-lg ml-4" muted loop />
                  )
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <div className="bg-zinc-900 p-6 rounded-2xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-red-400 mb-2">{selected.title}</h3>
            <p className="text-sm text-gray-300 mb-4">{selected.startDate} → {selected.endDate}</p>
            <p className="text-gray-200 mb-4">{selected.description}</p>

            <div className="grid grid-cols-2 gap-4">
              {selected.attachments.map((a, i) => (
                <div key={i} className="rounded overflow-hidden">
                  {a.type === "image" ? (
                    <img src={a.url} className="w-full h-56 object-cover" />
                  ) : (
                    <video src={a.url} controls className="w-full h-56 object-cover" />
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setSelected(null)} className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
