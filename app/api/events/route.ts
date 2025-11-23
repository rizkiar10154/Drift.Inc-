// app/api/events/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// ===========================
// GET EVENTS (admin + customer facing)
// ===========================
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Normalize fields for both Admin + Customer UI
    const normalized = data.map((ev: any) => ({
      id: ev.id,                  // admin expects ev.id
      _id: ev.id,                 // customer expects ev._id
      title: ev.title,
      description: ev.description,
      startDate: ev.start_date,   // convert snake_case → camelCase
      endDate: ev.end_date,
      attachments: ev.attachments || [],
      created_at: ev.created_at,
    }));

    return NextResponse.json({
      success: true,
      events: normalized,
    });
  } catch (err: any) {
    console.error("GET events error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ===========================
// CREATE EVENT (admin)
// ===========================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert([
        {
          title: body.title,
          description: body.description,
          start_date: body.startDate,  // DB uses snake_case
          end_date: body.endDate,
          attachments: body.attachments,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { status: "success", event: data },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}

// ===========================
// DELETE EVENT (admin)
// ===========================
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
      .from("events")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE event error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
