import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const VALID = ["about", "gallery", "contact"];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const section = url.searchParams.get("section");
    if (!section || !VALID.includes(section)) {
      return NextResponse.json({ success: false, message: "Invalid section" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "data", `${section}.json`);
    const raw = await fs.readFile(dataPath, "utf-8");
    const json = JSON.parse(raw);

    return NextResponse.json({ success: true, data: json });
  } catch (err) {
    console.error("Load error:", err);
    return NextResponse.json({ success: false, message: "Failed to load data" }, { status: 500 });
  }
}
