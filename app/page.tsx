export default function Home() {
  return (
    <section
      className="relative flex items-center justify-center h-screen bg-dark text-light overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center brightness-125 opacity-80"
      ></div>

      {/* Softer gradient overlay with red tint */}
      <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-red-950/30 mix-blend-overlay"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 flex flex-col items-center">
        {/* Replace title text with logo image */}
        <img
          src="/Drift.Inc_Text-bg-rev.png"
          alt="Drift.Inc Logo"
          className="w-64 md:w-96 drop-shadow-[0_2px_10px_rgba(255,0,0,0.6)] select-none"
        />

        <p className="mt-4 text-xl md:text-2xl text-light/90 drop-shadow-md">
          Premium Go-Kart Experience — Central Park Jakarta
        </p>

        <a
          href="https://dcp.haguro.id"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/40 animate-heartbeat"
        >
          Book Now
        </a>
      </div>
    </section>
  );
}
