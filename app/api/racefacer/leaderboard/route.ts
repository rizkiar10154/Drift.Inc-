import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  try {
    const url =
      "https://www.racefacer.com/ajax/user-ranking-by-time-box?user_rank=&age_group=&gender=&track_configuration_id=612&kart_id=832&period=day&user_id=16972150";

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Racefacer error:", error);
    return NextResponse.json(
      { error: "Racefacer fetch failed" },
      { status: 500 }
    );
  }
}
