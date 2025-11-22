import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB = process.env.MONGODB_DB || "driftinc_db";

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const client = await getMongoClient();
    const db = client.db(DB);

    const result = await db.collection("gallery").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/admin/gallery/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Delete error" },
      { status: 500 }
    );
  }
}
