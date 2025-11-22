import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB = process.env.MONGODB_DB || "driftinc_db";

export async function DELETE(req: Request, { params }: { params: { id: string }}) {
  try {
    const client = await getMongoClient();
    const db = client.db(DB);

    const result = await db.collection("gallery").deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/admin/gallery/[id]", err);
    return NextResponse.json({ success: false, message: "Delete error" }, { status: 500 });
  }
}
