// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import fsPromises from "fs/promises";
import path from "path";

const GALLERY_JSON = path.join(process.cwd(), "data", "gallery.json");

async function readGallery() {
  try {
    const raw = await fsPromises.readFile(GALLERY_JSON, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export async function GET() {
  const all = await readGallery();
  const published = all.filter((i) => !i.isDeleted).length;
  const total = all.length;
  const lastUpload =
    all
      .filter((i) => !i.isDeleted)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]
      ?.uploadedAt || null;

  return NextResponse.json({
    success: true,
    stats: { total, published, lastUpload },
  });
}
