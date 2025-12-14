"use client";

import Link from "next/link";

export default function ProfileSidebar({
  role,
  hasTeam,
  teamId,
}: {
  role: "leader" | "member" | "none";
  hasTeam: boolean;
  teamId?: string | null;
}) {
  return (
    <aside
      className="
        w-64 
        bg-black/40 
        backdrop-blur-xl 
        border-r border-gray-800 
        p-6 
        text-white
        mt-20
      "
    >
      <h2 className="text-xl font-semibold mb-6">Profile Menu</h2>

      <nav className="flex flex-col gap-4">

        {/* ALWAYS AVAILABLE */}
        <Link
          href="/teamchallenge/profile"
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
        >
          Edit Profile
        </Link>

        {/* ALWAYS AVAILABLE: Browse Teams */}
        <Link
          href="/teamchallenge/team/list"
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
        >
          Browse Teams
        </Link>

        {/* TEAM LOGIC */}
        {hasTeam && teamId && (
          <Link
            href={`/teamchallenge/team/dashboard?teamId=${teamId}`}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold"
          >
            My Team
          </Link>
        )}
      </nav>
    </aside>
  );
}
