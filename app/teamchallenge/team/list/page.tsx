"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function TeamListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    // Check auth
    const { data } = await supabase.auth.getUser();
    if (!data.user) return router.push("/teamchallenge/auth/login");

    const uid = data.user.id;
    setUserId(uid);

    // Check if user already in a team
    const { data: memberRow } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("member_id", uid)
      .maybeSingle();

    setUserTeamId(memberRow?.team_id || null);

    // Fetch all teams
    const { data: teamsData, error } = await supabase
      .from("teams")
      .select(`
        id,
        team_name,
        logo,
        motto,
        city,
        leader_id,
        team_members:team_members(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setTeams(teamsData);
    setLoading(false);
  }

  async function handleJoin(teamId: string) {
    if (!userId || userTeamId) return;

    setJoiningTeamId(teamId);

    const { error } = await supabase.from("team_members").insert({
      team_id: teamId,
      member_id: userId,
      role: "member",
      joined_at: new Date(),
    });

    setJoiningTeamId(null);

    if (error) {
      alert("Failed to join team");
      return;
    }

    // redirect to team dashboard
    router.push(`/teamchallenge/team/dashboard?teamId=${teamId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading teams...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Registered Teams
      </h1>

      {userTeamId === null && (
  <div className="text-center mb-8">
    <button
      onClick={() => router.push("/teamchallenge/team/create")}
      className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
    >
      ➕ Create Your Team
    </button>
  </div>
)}


      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6">
        {teams.map((team) => {
          const memberCount = team.team_members?.[0]?.count || 0;
          const isLeader = team.leader_id === userId;
          const isUserTeam = userTeamId === team.id;

          return (
            <div
              key={team.id}
              className="flex items-center gap-4 bg-black/40 border border-gray-700 rounded-xl p-4 hover:bg-black/60 transition cursor-pointer"
              onClick={() =>
                router.push(`/teamchallenge/team/${team.id}`)
              }
            >
              {/* TEAM LOGO CLICKABLE */}
              <img
                src={team.logo || "/default-team.png"}
                className="w-16 h-16 object-cover rounded-xl border border-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/teamchallenge/team/${team.id}`);
                }}
              />

              <div className="flex-1">
                {/* TEAM NAME CLICKABLE */}
                <p
                  className="text-xl font-semibold cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/teamchallenge/team/${team.id}`);
                  }}
                >
                  {team.team_name}
                </p>

                <p className="text-sm text-gray-400">{team.city}</p>

                {team.motto && (
                  <p className="text-xs text-gray-500 italic">“{team.motto}”</p>
                )}

                <p className="text-sm text-gray-400 mt-1">
                  Members: {memberCount}
                </p>
              </div>

              {/* BUTTON LOGIC - STOP CLICK FROM BUBBLING */}
              <div
                onClick={(e) => e.stopPropagation()}
              >
                {isLeader ? (
                  // LEADER → Manage Team
                  <button
                    onClick={() =>
                      router.push(
                        `/teamchallenge/team/dashboard?teamId=${team.id}`
                      )
                    }
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Manage
                  </button>
                ) : isUserTeam ? (
                  // USER IS MEMBER → View Team
                  <button
                    onClick={() =>
                      router.push(`/teamchallenge/team/${team.id}`)
                    }
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    View
                  </button>
                ) : userTeamId === null ? (
                  // USER NOT IN TEAM → Join Team
                  <button
                    onClick={() => handleJoin(team.id)}
                    disabled={joiningTeamId === team.id}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    {joiningTeamId === team.id ? "Joining..." : "Join"}
                  </button>
                ) : (
                  // USER IN DIFFERENT TEAM → View Only
                  <button
                    onClick={() =>
                      router.push(`/teamchallenge/team/${team.id}`)
                    }
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
