"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Components
import TeamSidebar from "@/app/teamchallenge/components/TeamSidebar";
import TeamMembers from "@/app/teamchallenge/components/TeamMembers";
import TeamJoinRequests from "@/app/teamchallenge/components/TeamJoinRequests";
import TeamTrophy from "@/app/teamchallenge/components/TeamTrophy";
import TeamChallenges from "@/app/teamchallenge/components/TeamChallenges";

// Types
type Profile = {
  full_name: string;
  nickname: string;
  profile_photo: string | null;
};

type Team = {
  id: string;
  team_name: string;
  leader_id: string;
};

export default function TeamDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const teamId = params.get("teamId");

  // STATE
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const [team, setTeam] = useState<Team | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  const [members, setMembers] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [otherTeams, setOtherTeams] = useState<any[]>([]);

  const [section, setSection] = useState("members");

  // ─────────────────────────────────────────
  // LOAD DASHBOARD DATA
  // ─────────────────────────────────────────
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    // 1. Check auth
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return router.push("/teamchallenge/auth/login");

    const uid = auth.user.id;
    setUserId(uid);

    // 2. Load logged user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, nickname, profile_photo")
      .eq("id", uid)
      .single();

    if (!profile) return router.push("/teamchallenge/profile");
    setUserProfile(profile);

      // 3. Load current team
const { data: teamData } = await supabase
  .from("teams")
  .select("*")
  .eq("id", teamId)
  .single();

if (!teamData) return router.push("/teamchallenge/team/list");

setTeam(teamData);

// 4. Check if user belongs to this team
const { data: membership } = await supabase
  .from("team_members")
  .select("id")
  .eq("team_id", teamId)
  .eq("member_id", uid)
  .maybeSingle();

// If user is NOT leader AND NOT member → redirect them out
if (!membership && teamData.leader_id !== uid) {
  return router.push("/teamchallenge/team/list");
}

setIsLeader(teamData.leader_id === uid);


    // 5. Load join requests (leader only)
    if (teamData.leader_id === uid) {
      const { data: requests } = await supabase
        .from("team_join_requests")
        .select(`
          id,
          member_id,
          profiles ( full_name, nickname, profile_photo ),
          created_at
        `)
        .eq("team_id", teamId)
        .eq("status", "pending");

      setJoinRequests(requests || []);
    }

    // 6. Load other teams (for challenge system)
    const { data: teamList } = await supabase
      .from("teams")
      .select("id, team_name, logo, city, motto")
      .neq("id", teamId);

    setOtherTeams(teamList || []);

    setLoading(false);
  }

  // ─────────────────────────────────────────
  // JOIN REQUEST ACTIONS
  // ─────────────────────────────────────────
  async function approveJoin(requestId: string, memberId: string) {
    await supabase.from("team_members").insert({
      team_id: teamId,
      member_id: memberId,
      role: "member",
      joined_at: new Date(),
    });

    await supabase.from("team_join_requests").delete().eq("id", requestId);

    loadDashboard();
  }

  async function rejectJoin(requestId: string) {
    await supabase
      .from("team_join_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    loadDashboard();
  }

  // ─────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/teamchallenge/auth/login");
  }

  // ─────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────
  if (loading || !userProfile || !team) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex">
      <TeamSidebar
        section={section}
        setSection={setSection}
        isLeader={isLeader}
        teamName={team.team_name}
        user={userProfile}
        onLogout={handleLogout}
      />

      <div className="flex-1 p-8 pt-24">
        {section === "members" && <TeamMembers members={members} />}

        {section === "requests" && isLeader && (
          <TeamJoinRequests
            joinRequests={joinRequests}
            approveJoin={approveJoin}
            rejectJoin={rejectJoin}
          />
        )}

        {section === "trophy" && <TeamTrophy />}

        {section === "challenges" && (
          <TeamChallenges otherTeams={otherTeams} />
        )}
      </div>
    </div>
  );
}
