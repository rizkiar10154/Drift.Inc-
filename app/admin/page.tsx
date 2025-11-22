// app/admin/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import GalleryManager from "./components/GalleryManager";
import AboutManager from "./components/AboutManager";
import ContactManager from "./components/ContactManager";
import EventManager from "./components/EventManager";

export default function AdminPage() {
  const [section, setSection] = useState("home");

  const [stats, setStats] = useState({
    galleryCount: 0,
    lastUpload: "—",
    aboutWords: 0,
    contactEmail: "contact@driftinc.com",
    eventCount: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin-auth");
    if (!isLoggedIn) {
      window.location.href = "/admin/login";
    }
  }, []);

  // Load ALL stats
  const loadStats = useCallback(async () => {
    try {
      //
      // ---- GALLERY STATS ----
      //
      const galleryRes = await fetch("/api/gallery?ts=" + Date.now(), {
        cache: "no-store",
      });

      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        setStats((prev) => ({
          ...prev,
          galleryCount: galleryData.stats?.published ??
            (Array.isArray(galleryData.items)
              ? galleryData.items.length
              : 0),
          lastUpload: galleryData.stats?.lastUpload ?? "—",
        }));
      }

      //
      // ---- EVENT COUNT ----
      //
      const eventRes = await fetch("/api/events?ts=" + Date.now(), {
        cache: "no-store",
      });

      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setStats((prev) => ({
          ...prev,
          eventCount: Array.isArray(eventData?.events)
            ? eventData.events.length
            : 0,
        }));
      }

    } catch (err) {
      console.error("Failed loading admin stats:", err);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <section className="relative min-h-screen bg-black text-white flex overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center opacity-40"></div>
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10">
        <Sidebar section={section} setSection={setSection} />
      </div>

      <div className="relative z-10 flex-1 p-8 pt-17 overflow-y-auto">

        {/* HOME DASHBOARD */}
        {section === "home" && (
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-10">Drift.Inc Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center mx-auto">

              {/* Gallery Count */}
              <button
                onClick={() => setSection("gallery")}
                className="bg-zinc-900/80 border border-red-700 p-6 rounded-2xl w-full max-w-[250px]"
              >
                <h2 className="text-gray-400 text-sm uppercase">Gallery Images</h2>
                <p className="text-4xl font-bold text-red-400 mt-2">
                  {stats.galleryCount}
                </p>
              </button>

              {/* About */}
              <button
                onClick={() => setSection("about")}
                className="bg-zinc-900/80 border border-red-700 p-6 rounded-2xl w-full max-w-[250px]"
              >
                <h2 className="text-gray-400 text-sm uppercase">About Page</h2>
                <p className="text-2xl font-semibold text-white mt-2">
                  {stats.aboutWords} words
                </p>
              </button>

              {/* Contact */}
              <button
                onClick={() => setSection("contact")}
                className="bg-zinc-900/80 border border-red-700 p-6 rounded-2xl w-full max-w-[250px]"
              >
                <h2 className="text-gray-400 text-sm uppercase">Contact Email</h2>
                <p className="text-sm text-red-300 mt-2 truncate max-w-40">
                  {stats.contactEmail}
                </p>
              </button>

              {/* Events */}
              <button
                onClick={() => setSection("events")}
                className="bg-zinc-900/80 border border-red-700 p-6 rounded-2xl w-full max-w-[250px]"
              >
                <h2 className="text-gray-400 text-sm uppercase">Events Created</h2>
                <p className="text-4xl font-bold text-red-400 mt-2">
                  {stats.eventCount}
                </p>
              </button>
            </div>
          </div>
        )}

        {section === "gallery" && <GalleryManager />}
        {section === "about" && <AboutManager />}
        {section === "contact" && <ContactManager />}
        {section === "events" && <EventManager />}
      </div>
    </section>
  );
}
