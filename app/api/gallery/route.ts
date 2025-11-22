// app/api/gallery/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const GALLERY_JSON = path.join(DATA_DIR, "gallery.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(GALLERY_JSON)) fs.writeFileSync(GALLERY_JSON, "[]", "utf-8");

async function readGallery(): Promise<any[]> {
  try {
    const raw = await fsPromises.readFile(GALLERY_JSON, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.warn("readGallery err:", e);
    return [];
  }
}
async function writeGallery(items: any[]) {
  await fsPromises.writeFile(GALLERY_JSON, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(200, Number(searchParams.get("limit") || "24"));
    const showTrash = searchParams.get("showTrash") === "true";

    const all = await readGallery();

    let filtered = all.filter((i) => (showTrash ? true : !i.isDeleted));

    if (category && category.toLowerCase() !== "all") {
      filtered = filtered.filter((i) => (i.category || "Uncategorized") === category);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const published = all.filter((i) => !i.isDeleted).length;
    const unpublished = all.filter((i) => i.isDeleted).length;

    const lastUpload =
      all
        .filter((i) => !i.isDeleted)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]
        ?.uploadedAt || null;

    return NextResponse.json({
      success: true,
      data,
      stats: { total, published, unpublished, lastUpload },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/gallery error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, category, caption, uploader } = body;

    if (!url) {
      return NextResponse.json({ success: false, message: "Missing url" }, { status: 400 });
    }

    const all = await readGallery();
    const item = {
      id: crypto.randomUUID(),
      url,
      category: category || "Uncategorized",
      caption: caption || "",
      uploader: uploader || null,
      uploadedAt: new Date().toISOString(),
      isDeleted: false,
    };

    all.unshift(item);
    await writeGallery(all);

    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("POST /api/gallery error:", err);
    return NextResponse.json({ success: false, message: "Failed to save item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, url, permanent } = body;

    if (!id && !url) {
      return NextResponse.json({ success: false, message: "No identifier provided" }, { status: 400 });
    }

    const all = await readGallery();
    const idx = id ? all.findIndex((i) => i.id === id) : all.findIndex((i) => i.url === url);

    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    if (permanent === true) {
      const item = all[idx];

      if (item && item.url?.startsWith("/uploads/")) {
        const fp = path.join(process.cwd(), "public", item.url);
        try {
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        } catch (e) {
          console.warn("Failed to remove file:", fp, e);
        }
      }

      all.splice(idx, 1);
    } else {
      all[idx].isDeleted = true;
      all[idx].deletedAt = new Date().toISOString();
    }

    await writeGallery(all);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/gallery error:", err);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
