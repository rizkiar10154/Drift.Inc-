"use client";

import React from "react";

type Member = {
  role: string;
  profiles: {
    full_name: string;
    nickname: string;
    profile_photo: string | null;
  };
};

type Props = {
  members?: Member[];
};

export default function TeamMembers({ members = [] }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Team Members</h2>

      <div className="space-y-4">
        {members.map((m: Member, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-black/40 border border-gray-700 p-4 rounded-xl"
          >
            <img
              src={m.profiles?.profile_photo || "/default-avatar.png"}
              className="w-12 h-12 rounded-full border border-gray-700 object-cover"
            />

            <div>
              <p className="font-semibold">{m.profiles.full_name}</p>
              <p className="text-sm text-gray-400">{m.profiles.nickname}</p>
            </div>

            {m.role === "leader" && (
              <span className="ml-auto px-2 py-1 text-xs bg-red-600 rounded">
                Leader
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
