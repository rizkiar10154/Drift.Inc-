"use client";
import { useEffect, useState } from "react";

type LeaderboardEntry = {
  rank: number;
  name: string;
  lap: string;
  date: string;
  avatar?: string;
  level: string;
};

export default function Leaderboards() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<"advanced" | "intermediate">("advanced");
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "year">("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leaderboard?timeframe=${timeFilter}&level=${levelFilter}`,
        { cache: "no-store" }
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load leaderboard");

      // ✅ Map API fields into your frontend fields
      const mapped = json.data.map((r: any, index: number) => ({
        rank: r.position || index + 1,
        name: r.name || "Unknown",
        lap: r.time || "-",
        date: r.date || "-",
        avatar: r.avatar || "",
        level: levelFilter,
      }));

      setData(mapped);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, levelFilter]);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-dark text-light overflow-hidden">
      <div className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center brightness-110 opacity-80"></div>
      <div className="absolute inset-0 bg-black/70 mix-blend-overlay"></div>

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-10 drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
          Drift.Inc Leaderboards
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="bg-transparent border border-red-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
          >
            <option className="bg-black text-white" value="advanced">
              Advanced (Adult)
            </option>
            <option className="bg-black text-white" value="intermediate">
              Intermediate (Junior)
            </option>
          </select>

          <div className="flex gap-3">
            {["day", "week", "month", "year"].map((time) => (
              <button
                key={time}
                onClick={() => setTimeFilter(time as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  timeFilter === time
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(255,0,0,0.6)]"
                    : "bg-black/50 text-gray-300 hover:bg-red-700/40"
                }`}
              >
                {time.charAt(0).toUpperCase() + time.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-gray-400">Loading leaderboard...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="mt-10 p-6 rounded-2xl backdrop-blur-sm border border-red-900/50 bg-black/50 shadow-[0_0_25px_rgba(255,0,0,0.3)]">
            <h2 className="text-3xl font-bold mb-5 text-red-400 drop-shadow-[0_0_8px_rgba(255,0,0,0.7)]">
              {levelFilter === "advanced" ? "🏎️ Advanced Racers" : "🧢 Intermediate Racers"}
            </h2>

            {data.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm uppercase tracking-wider border-b border-red-800/40 text-gray-300">
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-center">Lap Time</th>
                    <th className="py-3 px-4 text-center">Date</th>
                  </tr>
                </thead>
<tbody>
  {data.map((entry, index) => {
    // Determine styling for top 3
    const isTop3 = index === 0 || index === 1 || index === 2;

    const badge =
      index === 0
        ? "🥇"
        : index === 1
        ? "🥈"
        : index === 2
        ? "🥉"
        : "";

    return (
      <tr
        key={`${entry.level}-${entry.rank}-${index}`}
        className={`
          border-b border-red-900/30 transition-all duration-200
          ${isTop3 ? "bg-red-700/20 hover:bg-red-700/30" : "hover:bg-red-700/20"}
        `}
      >
        {/* ✅ Rank column with inline-flex to prevent row stretching */}
        <td className="py-3 px-4 text-center font-extrabold text-white">
          <div className="inline-flex items-center justify-center gap-2">
            <span>{entry.rank}</span>
            {badge && (
              <span className="text-xl drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]">
                {badge}
              </span>
            )}
          </div>
        </td>

        {/* Name column */}
        <td className="py-3 px-4 flex items-center gap-3">
          {entry.avatar && (
            <img
              src={entry.avatar}
              alt={entry.name}
              className={`w-9 h-9 rounded-full border object-cover ${
                isTop3
                  ? "border-yellow-300 shadow-[0_0_10px_rgba(255,215,0,0.7)]"
                  : "border-red-600"
              }`}
            />
          )}
          <span
            className={`${
              isTop3 ? "font-bold text-yellow-300" : "text-red-500"
            }`}
          >
            {entry.name}
          </span>
        </td>

        {/* Lap */}
        <td
          className={`py-3 px-4 text-center ${
            isTop3 ? "font-semibold text-yellow-200" : ""
          }`}
        >
          {entry.lap}
        </td>

        {/* Date */}
        <td
          className={`py-3 px-4 text-center ${
            isTop3 ? "font-medium text-yellow-200/70" : ""
          }`}
        >
          {entry.date}
        </td>
      </tr>
    );
  })}
</tbody>

              </table>
            ) : (
              <p className="text-gray-400 mt-6">No leaderboard data available.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
