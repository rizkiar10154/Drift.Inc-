"use client";

import React from "react";

type JoinRequest = {
  id: string;
  member_id: string;
  profiles?: {
    full_name?: string;
    nickname?: string;
    profile_photo?: string;
  };
  created_at?: string;
};

type Props = {
  joinRequests?: JoinRequest[];
  approveJoin: (requestId: string, memberId: string) => void;
  rejectJoin: (requestId: string) => void;
};

export default function TeamJoinRequests({
  joinRequests = [],
  approveJoin,
  rejectJoin,
}: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Join Requests</h2>

      {joinRequests.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending requests</p>
      ) : (
        joinRequests.map((req) => (
          <div
            key={req.id}
            className="flex items-center gap-4 bg-black/40 border border-gray-700 p-4 rounded-xl mb-4"
          >
            <img
              src={req.profiles?.profile_photo || "/default-avatar.png"}
              className="w-12 h-12 rounded-full border border-gray-700 object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold">{req.profiles?.full_name}</p>
              <p className="text-sm text-gray-400">
                {req.profiles?.nickname}
              </p>
            </div>

            <button
              onClick={() => approveJoin(req.id, req.member_id)}
              className="bg-green-600 px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Approve
            </button>

            <button
              onClick={() => rejectJoin(req.id)}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
}
