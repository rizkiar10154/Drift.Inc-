"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getTeamStatus } from "@/lib/getTeamStatus";
import ProfileSidebar from "@/app/teamchallenge/components/ProfileSidebar";

export default function ProfileDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [teamStatus, setTeamStatus] = useState<{
    hasTeam: boolean;
    role: "leader" | "member" | "none";
    teamId: string | null;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      setUser(auth.user);

      // get team + role
      const status = await getTeamStatus(auth.user.id);
      setTeamStatus(status);

      setLoading(false);
    };

    load();
  }, []);

  if (loading || !teamStatus) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-black text-white pt-16">
      <ProfileSidebar
        hasTeam={teamStatus.hasTeam}
        role={teamStatus.role}
        teamId={teamStatus.teamId}     
      />

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
      </main>
    </div>
  );
}
