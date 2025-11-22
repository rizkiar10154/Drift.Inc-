import Image from "next/image";
import { FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-black/40 backdrop-blur-sm border-t border-red-800/30 text-gray-400 py-8">
  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent opacity-70 pointer-events-none"></div>

  <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-3">
    <div className="h-0.5 w-20 bg-red-600 mx-auto mb-3 rounded-full shadow-[0_0_8px_rgba(255,0,0,0.4)]"></div>

    <div className="flex justify-center mb-1">
      <Image
        src="/Drift.Inc_Text-bg-rev.png"
        alt="Drift.Inc Logo"
        width={80}
        height={80}
        className="mx-auto drop-shadow-[0_0_8px_rgba(255,0,0,0.3)] select-none"
      />
    </div>

    <p className="text-sm text-gray-300">Central Park, Jakarta — Premium Go-Kart Experience</p>
    <p className="text-xs text-gray-400">Open Daily | 10:00 AM – 10:00 PM</p>

    <div className="flex justify-center space-x-6 mt-3">
      <a href="https://instagram.com" target="_blank" className="text-gray-400 hover:text-red-500 transition-transform duration-300 hover:scale-110">
        <FaInstagram size={20} />
      </a>
      <a href="https://tiktok.com" target="_blank" className="text-gray-400 hover:text-red-500 transition-transform duration-300 hover:scale-110">
        <FaTiktok size={20} />
      </a>
    </div>

    <div className="h-px bg-red-900/40 my-4 w-2/3 mx-auto"></div>
    <p className="text-xs text-gray-500">© {new Date().getFullYear()} Drift.Inc — All Rights Reserved</p>
  </div>
</footer>

  );
}
