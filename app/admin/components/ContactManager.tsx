"use client";

import { useState } from "react";

export default function ContactManager() {
  const [email, setEmail] = useState("contact@driftinc.com");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [address, setAddress] = useState("Jakarta, Indonesia");

  const handleSave = () => {
    alert("Contact info updated! 📬");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-red-500 text-center">☎️ Contact Manager</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-red-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-400">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-red-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-400">Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-red-700 rounded-lg text-white"
          />
        </div>
      </div>
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
