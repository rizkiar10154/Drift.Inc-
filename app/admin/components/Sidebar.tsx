"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, ChevronLeft } from "lucide-react";

interface SidebarProps {
  section: string;
  setSection: (value: string) => void;
}

export default function Sidebar({ section, setSection }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "gallery", label: "Gallery", icon: "🖼️" },
    { key: "events", label: "Events", icon: "🗓️" },
    { key: "about", label: "About", icon: "📖" },
    { key: "contact", label: "Contact", icon: "☎️" },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 250 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-zinc-950/80 border-r border-red-800 
      p-4 flex flex-col justify-between backdrop-blur-md 
      shadow-[0_0_25px_rgba(255,0,0,0.25)] sticky top-0 overflow-hidden"
    >
      {/* Header + Collapse Button */}
      <div>
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.6)] select-none"
            >
              Drift.Inc Admin
            </motion.h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-red-500 hover:text-red-400 transition"
          >
            {collapsed ? <Menu size={22} /> : <ChevronLeft size={22} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2">
          {menu.map((item) => (
            <motion.button
              key={item.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSection(item.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  section === item.key
                    ? "bg-red-700 text-white shadow-[0_0_15px_rgba(255,0,0,0.6)]"
                    : "text-gray-300 hover:bg-red-800 hover:text-white hover:shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          localStorage.removeItem("admin-auth");
          window.location.href = "/admin/login";
        }}
        className="bg-gray-800 hover:bg-red-800 text-white py-2 rounded-lg 
        transition-all duration-200 shadow-[0_0_15px_rgba(255,0,0,0.3)]"
      >
        {collapsed ? "🚪" : "🚪 Logout"}
      </motion.button>
    </motion.aside>
  );
}
