// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "gallery";
    const filename = formData.get("filename") as string | null;

    if (!file)
      return NextResponse.json({ success: false, message: "Missing file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const name = filename || `${Date.now()}-${file.name || "upload"}`;

    const { data, error } = await supabaseAdmin.storage
      .from(folder)
      .upload(name, buffer, { upsert: false });

    if (error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });

    // ✔ FIXED HERE
    const { data: publicData } = supabaseAdmin.storage
      .from(folder)
      .getPublicUrl(data.path);

    const publicUrl = publicData.publicUrl;

    return NextResponse.json({ success: true, url: publicUrl, path: data.path });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
