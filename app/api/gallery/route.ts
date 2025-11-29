// app/api/gallery/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const preferredRegion = "sin1"; // or closest region

const BUCKET = "gallery";

// ===========================
// GET — pagination without duplicates
// ===========================
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const limit = Number(url.searchParams.get("limit") || 24);
    const page = Number(url.searchParams.get("page") || 1);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("gallery")
      .select("*")
      .eq("is_deleted", false)
      .order("uploaded_at", { ascending: false })
      .range(from, to);

    if (category) query = query.eq("category", category);

    const { data: rows, error: listErr } = await query;
    if (listErr) throw listErr;

    const unique = new Map();
    (rows || []).forEach((r: any) => unique.set(r.id, r));

    const items = Array.from(unique.values()).map((r: any) => ({
      id: r.id,
      url: r.url,
      category: r.category,
      caption: r.caption,
      uploaded_at: r.uploaded_at,
      is_deleted: r.is_deleted ?? false,
    }));

    const { count } = await supabaseAdmin
      .from("gallery")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false);

    const { data: lastRow } = await supabaseAdmin
      .from("gallery")
      .select("uploaded_at")
      .eq("is_deleted", false)
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      stats: {
        published: count ?? 0,
        lastUpload: lastRow?.uploaded_at ?? "—",
      },
      data: items,
    });
  } catch (error: any) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// ===========================
// POST — insert
// ===========================
export async function POST(req: Request) {
  // ---- DEBUG LOGS ----
  console.log("⚡ SERVICE ROLE LOADED? =>", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("⚡ RUNTIME =>", process.env.NEXT_RUNTIME);
  console.log("⚡ SUPABASE URL =>", process.env.NEXT_PUBLIC_SUPABASE_URL);

  try {
    const body = await req.json();
    const { url, category, caption } = body;

    const { data, error } = await supabaseAdmin
      .from("gallery")
      .insert([{ url, category, caption }])
      .select()
      .single();

    if (error) {
      console.error("❌ INSERT ERROR:", error);
      throw error;
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error: any) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// ===========================
// DELETE — DB + storage
// ===========================
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id" },
        { status: 400 },
      );
    }

    const { data: row } = await supabaseAdmin
      .from("gallery")
      .select("*")
      .eq("id", id)
      .single();

    if (!row?.url) throw new Error("URL not found");

    const urlObj = new URL(row.url);
    const marker = `/object/public/${BUCKET}/`;
    const idx = urlObj.pathname.indexOf(marker);

    if (idx !== -1) {
      const objectPath = urlObj.pathname.slice(idx + marker.length);
      await supabaseAdmin.storage.from(BUCKET).remove([objectPath]);
    }

    await supabaseAdmin.from("gallery").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/gallery error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
