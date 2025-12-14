"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // auth
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/teamchallenge/auth/login");

    setUserId(userData.user.id);

    // check if user is already in a team
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("member_id", userData.user.id)
      .maybeSingle();

    setUserTeamId(membership?.team_id || null);

    // fetch team details
    const { data: teamData, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (error) {
      console.error(error);
      return;
    }
    setTeam(teamData);

    // fetch members with profile info
    const { data: memberList } = await supabase
      .from("team_members")
      .select(`
        role,
        profiles (
          full_name,
          nickname,
          profile_photo
        )
      `)
      .eq("team_id", teamId);

    setMembers(memberList || []);
    setLoading(false);
  }

  async function handleJoinTeam() {
    setJoining(true);

    const { error } = await supabase.from("team_members").insert({
      team_id: teamId,
      member_id: userId,
      role: "member",
      joined_at: new Date(),
    });

    setJoining(false);

    if (error) {
      alert("Failed to join team.");
      return;
    }

    router.push(`/teamchallenge/team/dashboard?teamId=${teamId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-3xl mx-auto">

      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-gray-200 text-sm mb-6"
      >
        ← Back
      </button>

      {/* TEAM HEADER */}
      <div className="flex items-center gap-6">
        <img
          src={team.logo || "/default-team.png"}
          className="w-24 h-24 rounded-xl border border-gray-700 object-cover"
        />

        <div>
          <h1 className="text-3xl font-bold">{team.team_name}</h1>
          <p className="text-gray-400">{team.city}</p>

          {team.motto && (
            <p className="text-gray-500 italic mt-1">“{team.motto}”</p>
          )}
        </div>
      </div>

      {/* MEMBERS */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Members</h2>

      <div className="space-y-4">
        {members.map((m, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-black/50 border border-gray-700 p-3 rounded-xl"
          >
            <img
              src={m.profiles?.profile_photo || "/default-avatar.png"}
              className="w-12 h-12 rounded-full border border-gray-700 object-cover"
            />

            <div>
              <p className="font-semibold">{m.profiles?.full_name}</p>
              <p className="text-sm text-gray-400">{m.profiles?.nickname}</p>
            </div>

            {m.role === "leader" && (
              <span className="ml-auto px-2 py-1 text-xs bg-red-600 rounded">
                Leader
              </span>
            )}
          </div>
        ))}
      </div>

      {/* JOIN BUTTON SECTION */}
      <div className="text-center mt-10">

        {userTeamId === teamId ? (
          <p className="text-green-400 text-lg font-medium">
            You are a member of this team
          </p>
        ) : userTeamId ? (
          <p className="text-gray-400 text-sm">
            You already belong to another team.
          </p>
        ) : (
          <button
            onClick={handleJoinTeam}
            disabled={joining}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold"
          >
            {joining ? "Joining..." : "Join Team"}
          </button>
        )}

      </div>
    </div>
  );
}
