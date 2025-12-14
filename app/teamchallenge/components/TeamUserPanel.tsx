"use client";

import React from "react";

type UserProfile = {
  full_name: string;
  nickname: string;
  profile_photo: string | null;
};

type Props = {
  user: UserProfile;
};

export default function TeamUserPanel({ user }: Props) {
  if (!user) return null;

  return (
    <div className="flex flex-col items-center mb-8 -mt-4">
      <img
        src={user.profile_photo || "/default-avatar.png"}
        className="w-20 h-20 rounded-full border border-gray-700 object-cover mb-3"
      />

      <p className="text-lg font-semibold">{user.full_name}</p>
      <p className="text-sm text-gray-400">@{user.nickname}</p>
    </div>
  );
}
