"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/leaderboards", label: "Leaderboards" },
    { href: "/events", label: "Events" }, // ✅ new Events page
    { href: "/gallery", label: "Gallery" },
    { href: "/level", label: "Level" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
  ];

  return (
<nav
  className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    scrolled
      ? "bg-black/90 border-b border-red-800/40 shadow-[0_0_12px_rgba(255,0,0,0.25)] backdrop-blur-md"
      : "bg-black/40 border-b border-red-900/20 backdrop-blur-sm"
  }`}
>
  <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
    {/* Logo */}
    <Link href="/" className="flex items-center space-x-2 group">
      <img
        src="/Drift.Inc_logo-nobg.png"
        alt="Drift.Inc Logo"
        className="w-24 md:w-28 transition-transform duration-300 group-hover:scale-105 select-none"
      />
    </Link>

    {/* Desktop Menu */}
    <div className="hidden md:flex space-x-8 text-gray-200 font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`transition ${
            pathname === item.href
              ? "text-red-500 font-bold border-b-2 border-red-500 pb-1"
              : "hover:text-red-500"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>

    {/* Mobile Button */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="md:hidden text-gray-300 hover:text-red-500 transition text-2xl"
    >
      ☰
    </button>
  </div>

  {/* Mobile Menu */}
  {menuOpen && (
    <div className="md:hidden bg-black/95 text-center py-4 space-y-3 border-t border-red-800/40">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block text-gray-200 transition ${
            pathname === item.href
              ? "text-red-500 font-bold"
              : "hover:text-red-500"
          }`}
          onClick={() => setMenuOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )}
</nav>
  );
}
