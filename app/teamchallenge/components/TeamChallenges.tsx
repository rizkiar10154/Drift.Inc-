"use client";

import { useState } from "react";

type Team = {
  id: string;
  team_name: string;
  logo: string | null;
  city: string | null;
  motto: string | null;
};

type Props = {
  otherTeams?: Team[];
};

export default function TeamChallenges({ otherTeams = [] }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Challenge Another Team</h2>

      {/* IF NO TEAM SELECTED → SHOW LIST */}
      {!selectedTeam && (
        <div className="space-y-4">
          {otherTeams.length === 0 && (
            <p className="text-gray-500">
              No other teams available to challenge.
            </p>
          )}

          {otherTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-4 bg-black/40 border border-gray-700 p-4 rounded-xl cursor-pointer hover:bg-black/60"
              onClick={() => setSelectedTeam(team)}
            >
              <img
                src={team.logo || "/default-team.png"}
                className="w-14 h-14 rounded-xl object-cover border border-gray-700"
              />

              <div className="flex-1">
                <p className="font-semibold text-lg">{team.team_name}</p>
                <p className="text-sm text-gray-400">{team.city}</p>
                {team.motto && (
                  <p className="text-xs text-gray-500 italic">
                    “{team.motto}”
                  </p>
                )}
              </div>

              <span className="text-red-500 font-semibold text-sm">
                Select →
              </span>
            </div>
          ))}
        </div>
      )}

      {/* IF TEAM SELECTED → SHOW TEAM PREVIEW + CHALLENGE BUTTON */}
      {selectedTeam && (
        <div className="bg-black/40 border border-gray-700 p-6 rounded-xl">
          <button
            onClick={() => setSelectedTeam(null)}
            className="text-sm text-red-400 hover:text-red-600 mb-4"
          >
            ← Back to team list
          </button>

          <div className="flex items-center gap-4 mb-6">
            <img
              src={selectedTeam.logo || "/default-team.png"}
              className="w-20 h-20 rounded-xl border border-gray-700 object-cover"
            />

            <div>
              <p className="text-2xl font-bold">{selectedTeam.team_name}</p>
              <p className="text-gray-400">{selectedTeam.city}</p>
              {selectedTeam.motto && (
                <p className="text-sm text-gray-500 italic">
                  “{selectedTeam.motto}”
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => alert("Challenge system coming next 🔥")}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold text-lg"
          >
            🚀 Challenge This Team
          </button>
        </div>
      )}
    </div>
  );
}
