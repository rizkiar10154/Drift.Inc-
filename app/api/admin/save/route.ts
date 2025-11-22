import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const VALID = ["about", "gallery", "contact"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { section, data } = body || {};

    if (!section || !VALID.includes(section)) {
      return NextResponse.json({ success: false, message: "Invalid section" }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "data", `${section}.json`);
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "Saved successfully" });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ success: false, message: "Failed to save" }, { status: 500 });
  }
}
