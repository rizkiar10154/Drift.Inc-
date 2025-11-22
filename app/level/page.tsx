export default function Level() {
  return (
    <section className="relative min-h-screen bg-dark text-light overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center opacity-60 brightness-110"
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Header */}
        <h1 className="text-5xl md:text-6xl font-bold text-primary drop-shadow-[0_2px_10px_rgba(255,0,0,0.6)] mb-10">
          Level
        </h1>
        <p className="text-gray-300 text-lg mb-16">
          Choose your level and experience the thrill — whether you’re an adrenaline-driven racer or a rising young talent.
        </p>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Intermediate Level */}
          <div className="group relative overflow-hidden rounded-2xl border-2 border-red-800 bg-black/40 shadow-[0_0_20px_rgba(255,0,0,0.15)] hover:shadow-[0_0_35px_rgba(255,0,0,0.4)] transition-all duration-500 p-8">
            <h2 className="text-3xl font-bold text-red-500 mb-4 group-hover:scale-105 transition-transform duration-300">
              Intermediate
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Perfect for younger racers under 15 years old with a height below 150 cm.
              This level introduces them to the excitement of go-karting in a safe and controlled environment.
              Experience real track driving, with safety and fun as top priority.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Age: <span className="text-white font-semibold">Under 15 y.o</span> <br />
              Height: <span className="text-white font-semibold">Below 150 cm</span>
            </div>
          </div>

          {/* Advance Level */}
          <div className="group relative overflow-hidden rounded-2xl border-2 border-red-800 bg-black/40 shadow-[0_0_20px_rgba(255,0,0,0.15)] hover:shadow-[0_0_35px_rgba(255,0,0,0.4)] transition-all duration-500 p-8">
            <h2 className="text-3xl font-bold text-red-500 mb-4 group-hover:scale-105 transition-transform duration-300">
              Advance
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Designed for experienced drivers aged 15 years and above, or racers taller than 150 cm.
              Push your limits with faster karts, tighter corners, and the full Drift.Inc track experience.
              Feel the adrenaline rush of competitive racing in its purest form.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Age: <span className="text-white font-semibold">15 y.o and above</span> <br />
              Height: <span className="text-white font-semibold">150 cm and above</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
