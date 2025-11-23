// app/api/gallery/upload/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BUCKET = "gallery"; 
const FOLDER = "public";  // stored as gallery/public/<file>.webp

async function parseForm(req: Request) {
  const formData = await req.formData();

  const files: File[] = [];
  for (const key of formData.keys()) {
    if (key === "files" || key === "file") {
      const all = formData.getAll(key);
      for (const v of all) {
        if (v instanceof File) files.push(v);
      }
    }
  }
  if (files.length === 0) {
    const maybe = formData.get("file");
    if (maybe instanceof File) files.push(maybe);
  }

  const catRaw = formData.get("category");
  const category =
    typeof catRaw === "string" && catRaw.trim() !== ""
      ? catRaw
      : "Uncategorized";

  const captions: Record<number, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("caption_") && typeof v === "string") {
      const idx = Number(k.split("_")[1]);
      captions[idx] = v;
    }
  }

  return { files, category, captions };
}

export async function POST(req: Request) {
  try {
    const { files, category, captions } = await parseForm(req);

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 }
      );
    }

    const insertedRows: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Convert to webp
      const webpBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 2048, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const filename = `${Date.now()}-${randomUUID()}.webp`;
      const storagePath = `${FOLDER}/${filename}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, webpBuffer, {
          contentType: "image/webp",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      const publicUrl = publicData.publicUrl;

      const { data: inserted, error: dbError } = await supabaseAdmin
        .from("gallery")
        .insert([
          {
            url: publicUrl,
            category,
            caption: captions[i] || "",
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      insertedRows.push({
        id: inserted.id,
        url: inserted.url,
        category: inserted.category,
        caption: inserted.caption,
        uploaded_at: inserted.uploaded_at,
        is_deleted: inserted.is_deleted ?? false,
      });
    }

    return NextResponse.json({ success: true, data: insertedRows });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed", error: String(err) },
      { status: 500 }
    );
  }
}
