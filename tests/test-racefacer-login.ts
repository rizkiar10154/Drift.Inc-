import axios from "axios";

async function testFetch() {
  try {
    const url = "https://www.racefacer.com/ajax/user-ranking-by-time-box?user_rank=&age_group=&gender=&track_configuration_id=612&kart_id=832&period=day&user_id=16972150";

    console.log("🔄 Testing leaderboard fetch...");
    console.log("Attempting to fetch leaderboard:", url);

    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "X-Requested-With": "XMLHttpRequest"
      },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    console.log("🔍 Status:", res.status);
    console.log("🔍 Headers:", res.headers);

    if (typeof res.data === "string") {
      console.log("📜 Raw HTML preview:");
      console.log(res.data.substring(0, 1000));
    } else {
      console.log("📦 Raw JSON response:", res.data);
    }

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", err.response.data);
    }
  }
}

testFetch();
