"use client";

import React from "react";
import TeamUserPanel from "./TeamUserPanel";

type UserProfile = {
  full_name: string;
  nickname: string;
  profile_photo: string | null;
};

type Props = {
  section: string;
  setSection: (s: string) => void;
  isLeader: boolean;
  teamName: string;
  user: UserProfile;
  onLogout: () => void;
};

export default function TeamSidebar({
  section,
  setSection,
  isLeader,
  teamName,
  user,
  onLogout,
}: Props) {
  return (
    <div className="w-64 border-r border-gray-800 bg-black/40 p-6 pt-20 flex flex-col h-screen">
      
      {/* TOP USER PANEL */}
      <TeamUserPanel user={user} />

      {/* MENU */}
      <h2 className="text-xl font-bold mb-6">{teamName}</h2>

      <div className="space-y-3 flex-1">
        <button
          onClick={() => setSection("members")}
          className={`w-full text-left px-3 py-2 rounded-lg ${
            section === "members"
              ? "bg-red-600"
              : "bg-black/30 hover:bg-black/50"
          }`}
        >
          Members
        </button>

        <button
          onClick={() => setSection("trophy")}
          className={`w-full text-left px-3 py-2 rounded-lg ${
            section === "trophy"
              ? "bg-red-600"
              : "bg-black/30 hover:bg-black/50"
          }`}
        >
          Trophy / Titles
        </button>

        <button
          onClick={() => setSection("challenges")}
          className={`w-full text-left px-3 py-2 rounded-lg ${
            section === "challenges"
              ? "bg-red-600"
              : "bg-black/30 hover:bg-black/50"
          }`}
        >
          Challenges
        </button>

        {isLeader && (
          <button
            onClick={() => setSection("requests")}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              section === "requests"
                ? "bg-red-600"
                : "bg-black/30 hover:bg-black/50"
            }`}
          >
            Join Requests ⭐
          </button>
        )}
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="mt-6 space-y-3">
        <a
          href="/teamchallenge/profile"
          className="block text-center bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm"
        >
          Edit Profile
        </a>

        <button
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
