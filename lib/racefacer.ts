// lib/racefacer.ts
import axios, { AxiosInstance } from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import fs from "fs";
import path from "path";

type Timeframe = "day" | "week" | "month" | "year" | "all";
type Level = "advanced" | "intermediate";

const TRACK_ID = process.env.RACEFACER_TRACK_ID ? Number(process.env.RACEFACER_TRACK_ID) : 612;
const USER_ID = process.env.RACEFACER_USER_ID || "16972150";

const KART_IDS: Record<Level, number> = {
  advanced: 832,
  intermediate: 879,
};

const BASE_URL = "https://www.racefacer.com";
const LOGIN_URL = `${BASE_URL}/login`; // may need adjusting if Racefacer uses another path
const AJAX_LEADERBOARD = `${BASE_URL}/ajax/user-ranking-by-time-box`;

const COOKIE_STORE_PATH =
  process.env.RACEFACER_COOKIE_STORE_PATH || path.join(process.cwd(), "data", "racefacer-cookie.json");

function buildLeaderboardUrl(timeframe: Timeframe, level: Level) {
  const kart_id = KART_IDS[level];
  const params = new URLSearchParams({
    user_rank: "",
    age_group: "",
    gender: "",
    track_configuration_id: String(TRACK_ID),
    kart_id: String(kart_id),
    period: timeframe,
    user_id: USER_ID,
  });
  return `${AJAX_LEADERBOARD}?${params.toString()}`;
}

function jarToJSON(jar: CookieJar) {
  // tough-cookie has toJSON on cookiejar
  // @ts-ignore
  return jar.serializeSync ? jar.serializeSync() : (jar as any).toJSON?.();
}
function jsonToJar(json: any) {
  const jar = new CookieJar();
  if (!json) return jar;
  // tough-cookie 4+ supports fromJSON / importCookies
  try {
    // @ts-ignore
    jar.restoreSync?.(json);
    // fallback:
    if (!jar.getCookies) {
      // nothing
    }
  } catch (e) {
    // fallback: attempt manual import (older/newer libs differ)
    try {
      // @ts-ignore
      jar = CookieJar.fromJSON(json);
    } catch (err) {
      // ignore
    }
  }
  return jar;
}

async function createAxiosWithJar(): Promise<{ instance: AxiosInstance; jar: CookieJar }> {
  // load existing jar if present
  let jar = new CookieJar();
  try {
    if (fs.existsSync(COOKIE_STORE_PATH)) {
      const raw = fs.readFileSync(COOKIE_STORE_PATH, "utf-8");
      const json = JSON.parse(raw);
      // tough-cookie supports fromJSON in some versions
      jar = CookieJar.fromJSON ? CookieJar.fromJSON(json) : jsonToJar(json);
    }
  } catch (e) {
    console.warn("Could not load saved cookie jar:", e);
    jar = new CookieJar();
  }

  const instance = wrapper(axios.create({ jar, withCredentials: true }));
  return { instance, jar };
}

async function saveJar(jar: CookieJar) {
  try {
    const dir = path.dirname(COOKIE_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // tough-cookie v4 supports toJSON
    const json = jarToJSON(jar);
    fs.writeFileSync(COOKIE_STORE_PATH, JSON.stringify(json), "utf-8");
  } catch (e) {
    console.warn("Failed to save cookie jar:", e);
  }
}

async function performLogin(instance: AxiosInstance, jar: CookieJar) {
  const email = process.env.RACEFACER_EMAIL;
  const password = process.env.RACEFACER_PASSWORD;
  if (!email || !password) throw new Error("RACEFACER_EMAIL and RACEFACER_PASSWORD must be set in .env.local");

  // Step 1: fetch login page to get any CSRF cookie or token (Laravel often sets XSRF-TOKEN cookie)
  try {
    await instance.get(`${BASE_URL}/en/login`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      maxRedirects: 5,
    });
  } catch (err) {
    // ignore non-critical
  }

  // If Racefacer uses a straight POST at /login with email/password and expect _token or XSRF header,
  // we try this common approach: POST form fields email/password.
  // If Racefacer requires additional form fields, inspect browser devtools and adapt.
  const loginForm = new URLSearchParams();
  loginForm.set("email", email);
  loginForm.set("password", password);
  // If site requires remember or _token, you need to add them — see note below.

  try {
    const resp = await instance.post(LOGIN_URL, loginForm.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        Referer: `${BASE_URL}/en/login`,
      },
      maxRedirects: 5,
      validateStatus: (s) => s >= 200 && s < 400,
    });

    // Save jar after login attempt
    await saveJar(jar);

    // Good sign if we have laravel_session cookie or redirected to dashboard
    // You may check resp.headers['set-cookie'] or jar contents to confirm login
    return resp;
  } catch (err: any) {
    throw new Error("Login failed: " + (err.message || err));
  }
}

/**
 * Main public function: fetch leaderboard for timeframe and level
 * - Automatically logs in if needed and retries once.
 */
export async function fetchRacefacerLeaderboard(timeframe: Timeframe, level: Level) {
  const { instance, jar } = await createAxiosWithJar();

  const url = buildLeaderboardUrl(timeframe, level);
  console.log("Attempting to fetch leaderboard:", url);

  // helper to actually request and parse HTML
  const doFetch = async () => {
    try {
      const res = await instance.get(url, {
        headers: {
          Accept: "*/*",
          "User-Agent": "Mozilla/5.0",
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${BASE_URL}/en/karting-tracks/australia/ozekarts`,
        },
        maxRedirects: 5,
        validateStatus: s => s >= 200 && s < 500,
      });

      // If returned non-string (JSON), log and handle
      const html = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      // Quick heuristic: if HTML length is small or contains "There are no results" etc, treat accordingly
      if (!html || html.length < 50 || /no results/i.test(html)) {
        return { html, ok: false, status: res.status };
      }

      return { html, ok: true, status: res.status };
    } catch (err: any) {
      console.error("Fetch error:", err.message || err);
      return { html: "", ok: false, status: 0 };
    }
  };

  // Try once with existing cookies
  let attempt = await doFetch();

  // If not ok, try to login then retry once
  if (!attempt.ok) {
    console.log("Leaderboard fetch returned empty or blocked. Attempting login to refresh cookies...");
    try {
      await performLogin(instance, jar);
      // after login saved, re-read jar and instance should use updated jar
      await saveJar(jar);
      // retry fetch
      attempt = await doFetch();
    } catch (loginErr) {
      console.error("Login attempt failed:", loginErr);
      // fallthrough: we will return empty array
      return [];
    }
  }

  if (!attempt.ok) {
    console.warn("Still no leaderboard content after login attempt. Response status:", attempt.status);
    return [];
  }

  const html = attempt.html as string;

  // parse html using DOM-like selectors via regex/cheerio if you want (cheerio not included here)
  // For simplicity return the raw HTML here so caller can parse it (or we can include a parser)
  // but we'll attempt a simple parse for "row" blocks based on earlier example.

  const results: any[] = [];
  try {
    // Conservative regex to match the row blocks (works for the sample you provided earlier)
    const rowRegex = /<div class="row"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gim;
    // More robust parsing is recommended with cheerio; here we'll use cheerio if available:
    let cheerioAvailable = false;
    let $: any = null;
    try {
      // dynamic import so calling code doesn't require cheerio if you don't want it
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      $ = require("cheerio").load(html);
      cheerioAvailable = true;
    } catch (e) {
      cheerioAvailable = false;
    }

    if (cheerioAvailable) {
      $(".table_content .row").each((_: any, el: any) => {
        const pos = $(el).find(".position").text().trim();
        const name = $(el).find(".name").text().trim();
        const date = $(el).find(".date").text().trim();
        const time = $(el).find(".time span").text().trim() || $(el).find(".time").text().trim();
        const avatarStyle = $(el).find(".avatar").attr("style") || "";
        const avatarMatch = avatarStyle.match(/url\(["']?(.*?)["']?\)/);
        const avatar = avatarMatch ? avatarMatch[1] : null;
        if (name && time) {
          results.push({
            rank: Number(pos || results.length + 1),
            name,
            lap: time,
            date,
            avatar,
            level: level === "advanced" ? "Advanced" : "Intermediate",
          });
        }
      });
    } else {
      // fallback: use regex to find position / name / time patterns
      const rowMatches = html.matchAll(/<div class="row"[^>]*>[\s\S]*?<div class="position">([\d]+)<\/div>[\s\S]*?<div class="avatar"[^>]*style="[^"]*url\(['"]?(.*?)['"]?\)[^"]*"[^>]*>[\s\S]*?<div class="name">([^<]+)<\/div>[\s\S]*?<div class="date">([^<]+)<\/div>[\s\S]*?<a class="time"[^>]*>[\s\S]*?<span>([\d:.]+)<\/span>/gim);
      for (const m of rowMatches) {
        const [, pos, avatarUrl, name, date, time] = m;
        results.push({
          rank: Number(pos),
          name: name?.trim(),
          lap: time?.trim(),
          date: date?.trim(),
          avatar: avatarUrl?.startsWith("http") ? avatarUrl : avatarUrl ? `${BASE_URL}${avatarUrl}` : null,
          level: level === "advanced" ? "Advanced" : "Intermediate",
        });
      }
    }
  } catch (parseErr) {
    console.error("Error parsing HTML:", parseErr);
  }

  // Save jar after everything
  await saveJar(jar);

  return results;
}
