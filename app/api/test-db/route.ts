import { NextResponse } from "next/server";
import {clientPromise} from "@/lib/mongodb";

export async function GET() {
  try {
    // connect to MongoDB
    const client = await clientPromise;
    const db = client.db("driftinc_db"); // ✅ name your DB (can be anything)
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      message: "✅ MongoDB connection successful!",
      database: db.databaseName,
      collections: collections.map((col) => col.name),
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    return NextResponse.json(
      { success: false, message: "MongoDB connection failed", error: String(err) },
      { status: 500 }
    );
  }
}
