import { supabase } from "@/lib/supabaseClient";

export async function getTeamStatus(userId: string) {
  // 1. Check membership
  const { data: memberRow } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("member_id", userId)
    .maybeSingle();

  const teamId = memberRow?.team_id ?? null;

  // No team → return "none"
  if (!teamId) {
    return {
      hasTeam: false,
      role: "none" as "none",
      teamId: null,
    };
  }

  // 2. Check if user is leader
  const { data: team, error } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .maybeSingle();

  if (!team || error) {
    return {
      hasTeam: false,
      role: "none" as "none",
      teamId: null,
    };
  }

  const isLeader = team.leader_id === userId;

  return {
    hasTeam: true,
    role: (isLeader ? "leader" : "member") as "leader" | "member",
    teamId,
  };
}
