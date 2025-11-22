import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "driftinc_db";

  if (!uri) {
    return NextResponse.json(
      { success: false, message: "MONGODB_URI missing" },
      { status: 500 }
    );
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      connected: true,
      db: dbName,
      collections: collections.map((c) => c.name), // show list of collections
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
