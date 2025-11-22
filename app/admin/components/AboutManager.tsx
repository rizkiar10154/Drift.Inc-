"use client";

import { useState } from "react";

export default function AboutManager() {
  const [content, setContent] = useState("Welcome to our go-kart racing club!");

  const handleSave = () => {
    alert("About page updated! 🚀");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-red-500 text-center">📖 About Manager</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full p-4 bg-gray-900 border border-red-700 rounded-lg text-white focus:outline-none"
      />
      <div className="text-center">
        <button
          onClick={handleSave}
          className="mt-6 bg-red-700 hover:bg-red-800 px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
