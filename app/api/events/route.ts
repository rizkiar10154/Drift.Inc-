// app/api/events/route.ts
export const runtime = "nodejs"; // file system allowed

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "events.json");

type Attachment = { url: string; type: "image" | "video" };
type EventItem = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  attachments: Attachment[];
  createdAt: string;
};

// Load events.json or return empty array if missing
function loadEvents(): EventItem[] {
  try {
    if (!fs.existsSync(DATA_PATH)) return [];

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load events.json:", err);
    return [];
  }
}

// Save events to events.json
function saveEvents(events: EventItem[]) {
  try {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(events, null, 2));
  } catch (err) {
    console.error("Failed to save events.json:", err);
  }
}

export async function GET() {
  const events = loadEvents();
  const sorted = events.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return NextResponse.json({ events: sorted }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description = "", startDate, endDate, attachments = [] } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (sd > ed) {
      return NextResponse.json(
        { status: "error", message: "startDate after endDate" },
        { status: 400 }
      );
    }

    const events = loadEvents();

    const newEvent: EventItem = {
      _id: Date.now().toString(),
      title,
      description,
      startDate,
      endDate,
      attachments,
      createdAt: new Date().toISOString(),
    };

    events.push(newEvent);
    saveEvents(events);

    return NextResponse.json({ status: "success", event: newEvent }, { status: 201 });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json(
      { status: "error", message: "Invalid JSON" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Missing id" },
        { status: 400 }
      );
    }

    const events = loadEvents();
    const before = events.length;

    const updated = events.filter((ev) => ev._id !== id);

    if (updated.length === before) {
      return NextResponse.json(
        { status: "error", message: "Event not found" },
        { status: 404 }
      );
    }

    saveEvents(updated);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/events error:", err);
    return NextResponse.json(
      { status: "error", message: "Delete failed" },
      { status: 500 }
    );
  }
}

