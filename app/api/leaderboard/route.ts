// app/api/leaderboard/route.ts
import { NextResponse } from "next/server";

type Timeframe = "day" | "week" | "month" | "year" | "all";
type Level = "advanced" | "intermediate";

const TRACK_CONFIG_ID = 612;
const KART_ID_BY_LEVEL: Record<Level, number> = {
  advanced: 832,
  intermediate: 879,
};

// --- Normalizers ---
function normalizeTimeframe(q: string | null): Timeframe {
  const valid: Timeframe[] = ["day", "week", "month", "year", "all"];
  const t = q?.toLowerCase() as Timeframe;
  return valid.includes(t) ? t : "day";
}

function normalizeLevel(q: string | null): Level {
  return q?.toLowerCase() === "intermediate" ? "intermediate" : "advanced";
}

function normalizeLapTime(r: any): string {
  return (
    r.best_time ||
    r.best_time_with_weight ||
    r.fastLapTime ||
    r.fast_time ||
    r.bestLapTime ||
    r.time ||
    r.best_time_ms ||
    ""
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const timeframe = normalizeTimeframe(searchParams.get("timeframe"));
  const level = normalizeLevel(searchParams.get("level"));

  // You can adjust these values
  const offset = Number(searchParams.get("offset")) || 0;
  const limit = Number(searchParams.get("limit")) || 25;

  const kartId = KART_ID_BY_LEVEL[level];

  console.log("=== Leaderboard request ===");
  console.log("Level:", level, " | Timeframe:", timeframe);
  console.log("Offset:", offset, " | Limit:", limit);

  // ✅ IMPORTANT — Only use required params
  const url = `https://www.racefacer.com/ajax/user-ranking-by-time-box?track_configuration_id=${TRACK_CONFIG_ID}&kart_id=${kartId}&period=${timeframe}&offset=${offset}&limit=${limit}`;

  console.log("Fetching RaceFacer:", url);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });

    const raw = await res.text();

    if (!raw || !raw.trim()) {
      console.warn("Racefacer returned empty response");
      return NextResponse.json({ success: true, data: [] });
    }

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.error("Invalid RaceFacer JSON:", err);
      console.error("RAW RESPONSE:", raw);
      return NextResponse.json(
        { success: false, error: "RaceFacer JSON parse failure" },
        { status: 502 }
      );
    }

    // ✅ PRIORITIZE FULL RANKING TABLE FIRST
    const source =
      json?.data?.ranking ||
      json?.data?.topRanking ||
      json?.data ||
      {};

    if (!source || typeof source !== "object") {
      console.warn("No ranking data found");
      return NextResponse.json({ success: true, data: [] });
    }

    const racers = Object.values(source)
      .filter((r: any) => typeof r === "object")
      .map((r: any, index: number) => ({
        position: r.pos ?? r.position ?? index + 1,
        name: r.full_name ?? r.name ?? r.user_name ?? "Unknown",
        date: r.date ?? r.fastLapDate ?? "-",
        time: normalizeLapTime(r) || "-",
        maxKmH: r.max_speed ?? "",
        maxG: r.max_gforce ?? "",
        avatar:
          r.profile_image ||
          r.profile_image_medium ||
          r.profile_image_small ||
          r.avatar ||
          "",
        profileUrl: r.profile_url ?? "",
        userId: r.user_id ?? "",
        s1: r.s1 ?? "-",
        s2: r.s2 ?? "-",
        s3: r.s3 ?? "-",
      }));

    console.log(`✅ Parsed ${racers.length} racers`);

    return NextResponse.json({ success: true, data: racers });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
