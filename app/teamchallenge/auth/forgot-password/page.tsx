"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: any) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        newPassword,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setMessage(result.error || "Failed to reset password.");
      setLoading(false);
      return;
    }

    setMessage("Password successfully updated!");

    setTimeout(() => {
      router.push("/teamchallenge/auth/login");
    }, 1500);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8">

        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>

        <form className="space-y-5" onSubmit={handleReset}>

          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Re-type New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className="text-center text-red-400 text-sm">{message}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

      </div>
    </div>
  );
}
