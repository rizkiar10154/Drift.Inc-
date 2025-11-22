"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();
    if (json.success) {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen text-white overflow-hidden">
      {/* 🏁 Background image */}
      <div className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center opacity-40"></div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-zinc-900/80 border border-red-800 p-8 rounded-2xl shadow-[0_0_25px_rgba(255,0,0,0.5)] w-80 backdrop-blur-sm animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-6 text-red-500">
          Admin Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 p-2 rounded bg-gray-800 text-white focus:outline-none border border-gray-700"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-2 rounded bg-gray-800 text-white focus:outline-none border border-gray-700"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 py-2 rounded font-semibold transition-all"
          >
            Login
          </button>
        </form>
      </div>

      {/* Optional: simple fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in-out;
        }
      `}</style>
    </section>
  );
}
