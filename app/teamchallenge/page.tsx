// app/teamchallenge/page.tsx

export default function TeamChallengeHome() {
  const dummyUpcoming = [
    {
      id: 1,
      teamA: "Red Fury",
      teamB: "Speed Legends",
      date: "Dec 10, 2025",
      time: "14:00",
    },
    {
      id: 2,
      teamA: "Night Riders",
      teamB: "Drift Masters",
      date: "Dec 12, 2025",
      time: "16:00",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#060606] bg-[url('/track-bg.jpg')] bg-cover bg-center text-white px-6 py-16">
      
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* PAGE WRAPPER */}
      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4">
            🏎️ Drift.Inc Team Challenge
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
            Challenge other teams, compete for glory, push your limits, and climb
            the leaderboard. Register or log in to create your team, invite
            members, and challenge opponents to official Drift.Inc showdowns.
          </p>

          {/* BUTTON */}
          <a
            href="/teamchallenge/auth"
            className="mt-8 inline-block bg-red-600 hover:bg-red-700 px-8 py-3 text-lg font-semibold rounded-xl transition"
          >
            Register / Login to Challenge Opponent
          </a>
        </div>

        {/* UPCOMING MATCHES */}
        <h2 className="text-3xl font-bold mb-6 text-center">🏁 Upcoming Matches</h2>

        <div className="space-y-4">
  {dummyUpcoming.map((match) => (
    <div
      key={match.id}
      className="border border-gray-700 bg-black/40 backdrop-blur-sm rounded-lg p-4 hover:border-red-600 transition"
    >
      <div className="flex items-center justify-between w-full">

        {/* LEFT TEAM */}
        <div className="flex items-center justify-start w-1/3 gap-3">
          <img
            src="/teamA-logo.png" // replace with actual logo path
            alt={match.teamA}
            className="w-10 h-10 object-contain"
          />
          <p className="text-base font-semibold">{match.teamA}</p>
        </div>

        {/* VS + DATE */}
        <div className="flex flex-col items-center w-1/3">
          <p className="text-xl font-extrabold text-red-500">VS</p>
          <p className="text-gray-400 text-xs mt-1">
            {match.date} · {match.time}
          </p>
        </div>

        {/* RIGHT TEAM */}
        <div className="flex items-center justify-end w-1/3 gap-3">
          <p className="text-base font-semibold">{match.teamB}</p>
          <img
            src="/teamB-logo.png" // replace with actual logo path
            alt={match.teamB}
            className="w-10 h-10 object-contain"
          />
        </div>

      </div>
    </div>
  ))}
</div>
        {/* FOOTER */}
        <p className="text-white-500 text-sm text-center mt-12">
          More matches will appear once they are published by admin.
        </p>
      </div>
    </div>
  );
}
