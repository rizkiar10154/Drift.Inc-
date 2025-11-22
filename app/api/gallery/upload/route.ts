// app/api/gallery/upload/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const DATA_DIR = path.join(process.cwd(), "data");
const GALLERY_JSON = path.join(DATA_DIR, "gallery.json");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(GALLERY_JSON)) fs.writeFileSync(GALLERY_JSON, "[]", "utf-8");

async function readGallery(): Promise<any[]> {
  try {
    const raw = await fsPromises.readFile(GALLERY_JSON, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.warn("readGallery error:", e);
    return [];
  }
}
async function writeGallery(items: any[]) {
  await fsPromises.writeFile(GALLERY_JSON, JSON.stringify(items, null, 2), "utf-8");
}

export async function POST(req: Request) {
  try {
    // Use formData (simple and supported in Next.js route handlers)
    const formData = await req.formData();

    // category is required
    const categoryRaw = formData.get("category");
    const category: string =
      typeof categoryRaw === "string" && categoryRaw.trim() !== ""
        ? categoryRaw
        : "Uncategorized";

    // collect files (form field can be "files" repeated or "file")
    const files: File[] = [];
    // web FormData.getAll isn't typed here, so iterate keys
    for (const key of formData.keys()) {
      if (key === "files" || key === "file") {
        const all = formData.getAll(key);
        for (const v of all) {
          if (v instanceof File) files.push(v);
        }
      }
    }
    // fallback: maybe single file under "file"
    if (files.length === 0) {
      const maybe = formData.get("file");
      if (maybe instanceof File) files.push(maybe);
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
    }

    // captions: caption_0, caption_1...
    const captions: Record<number, string> = {};
    for (const [k, v] of formData.entries()) {
      if (typeof k === "string" && k.startsWith("caption_") && typeof v === "string") {
        const idx = Number(k.split("_")[1]);
        if (!Number.isNaN(idx)) captions[idx] = v;
      }
    }

    const savedItems: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeBase = `${Date.now()}-${f.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_.]/g, "")}`;
      const outName = `${safeBase}.webp`;
      const outPath = path.join(UPLOAD_DIR, outName);

      // convert + resize -> webp
      await sharp(buffer)
        .rotate()
        .resize({ width: 2048, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outPath);

      const item = {
        id: randomUUID(),
        url: `/uploads/${outName}`,
        category,
        caption: captions[i] || "",
        uploader: null,
        uploadedAt: new Date().toISOString(),
        isDeleted: false,
      };

      savedItems.push(item);
    }

    // persist (newest first)
    const existing = await readGallery();
    const newData = [...savedItems, ...existing];
    await writeGallery(newData);

    return NextResponse.json({ success: true, data: savedItems });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json({ success: false, message: "Upload failed", error: String(err) }, { status: 500 });
  }
}
