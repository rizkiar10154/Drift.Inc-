import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db("driftinc_db");

    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      message: "✅ MongoDB connection successful!",
      database: db.databaseName,
      collections: collections.map((c) => c.name),
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    return NextResponse.json(
      { success: false, message: "MongoDB connection failed", error: String(err) },
      { status: 500 }
    );
  }
}
