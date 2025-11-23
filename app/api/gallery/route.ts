// app/api/gallery/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// GET → Fetch gallery items
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("gallery")
      .select("*")
      .eq("is_deleted", false)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/gallery error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST → Insert new gallery item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, category, caption, uploader } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: "Missing image URL" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("gallery")
      .insert([
        {
          url,
          category: category || "Uncategorized",
          caption: caption || "",
          uploader: uploader || null,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      item: data?.[0],
    });
  } catch (error: any) {
    console.error("POST /api/gallery error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to save gallery item" },
      { status: 500 }
    );
  }
}

// DELETE → Soft delete gallery item
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("gallery")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/gallery error:", error.message);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}
