export default function About() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-dark text-light overflow-hidden">
      {/* Background image (same as homepage) */}
      <div
        className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center opacity-70 brightness-110"
      ></div>

      {/* Overlay (slightly transparent for readability) */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-20">
        {/* Logo instead of text */}
        <div className="flex justify-center mb-6">
          <img
            src="/Drift.Inc_Text-bg-rev.png"
            alt="Drift.Inc Logo"
            className="w-56 md:w-72 mx-auto drop-shadow-[0_0_12px_rgba(255,0,0,0.5)] select-none"
          />
        </div>

        <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">
          Welcome to <span className="text-red-500 font-semibold">Drift.Inc</span> — Jakarta’s premier go-kart experience. 
          We combine speed, precision, and luxury to deliver the ultimate racing thrill for both intermediate and advanced drivers.
        </p>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
          Located in <span className="font-semibold text-red-500">Central Park Jakarta</span>, 
          our track is equipped with advanced timing systems. 
          Whether you’re chasing the leaderboard or enjoying casual laps with friends, every moment here is built for adrenaline and style.
        </p>
      </div>
    </section>
  );
}
