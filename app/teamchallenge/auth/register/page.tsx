"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    // 1. Create user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setMessage(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Force-refresh to ensure the auth user exists
    const { data: refreshed } = await supabase.auth.getUser();
    const user = refreshed.user;

    if (!user) {
      setMessage("Failed to create user. Try again.");
      setLoading(false);
      return;
    }

    // 3. Insert into profiles table
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: user.id,        // FK must match auth.users.id
      email: user.email ?? "",
    });

    if (profileErr) {
      setMessage(profileErr.message);
      setLoading(false);
      return;
    }

    // 4. Redirect
    router.push("/teamchallenge/auth/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8">
        
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        <form className="space-y-5" onSubmit={handleRegister}>
          
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
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Re-type Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className="text-red-400 text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <a href="/teamchallenge/auth/login" className="text-red-500">Login</a>
        </p>
      </div>
    </div>
  );
}
