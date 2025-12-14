"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Sign in user
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Invalid email or password.");
      setLoading(false);
      return;
    }

    // 2. Reload user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMessage("Login failed.");
      setLoading(false);
      return;
    }

    // 3. Check profile row
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // If profile missing → go to profile page
    if (!profile) {
      router.push("/teamchallenge/profile");
      return;
    }

    // If profile incomplete → go to profile page
    if (
      !profile.full_name ||
      !profile.nickname ||
      !profile.city ||
      !profile.phone ||
      !profile.dob
    ) {
      router.push("/teamchallenge/profile");
      return;
    }

    // 🎯 ALWAYS GO TO TEAM LIST
    router.push("/teamchallenge/profile/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8">
        
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <form className="space-y-5" onSubmit={handleLogin}>
          
          {/* EMAIL */}
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

          {/* PASSWORD */}
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className="text-red-400 text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <a href="/teamchallenge/auth/register" className="text-red-500">
            Register
          </a>
        </p>
        <p className="text-center text-gray-400 text-sm mt-4">
          <a href="/teamchallenge/auth/forgot-password" className="text-red-500">
            Forgot your password?
          </a>
        </p>
      </div>
    </div>
  );
}
