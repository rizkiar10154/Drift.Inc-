"use client";

const TRACK_PATH = `M2799.57,3367.19l-768,316a6648.67,6648.67,0,0,1-897.36,730,6643,6643,0,0,1-754.64,442c-111.47,48.1-238.77,8.9-298-84-68.07-106.77-32.33-262.65,89.55-334,171.63-106.62,354.42-230.77,543.05-375a6805,6805,0,0,0,581.4-499c17-15.68,150-142.5,136-342-13.87-197.74-160.72-304.49-180-318l-860-532c-49.32-19.55-150.89-67.77-233.27-174.89a543.48,543.48,0,0,1-93-187.49L19.57,1783.19c-4.2-14.4-31-112.51,29.23-201.86,40.38-59.86,97.63-82.83,118.77-90.14l532-120c13.6-3,71.77-14.1,130,20.28,70.92,41.86,84.28,117.12,86,127.72l52,220c9.85,29.15,36.2,94,101.18,148.12,80.91,67.37,169.64,74.7,198.82,75.88l740,116c36.81,2.57,99.28,12,165.13,49.61,107,61,152.41,156.08,166.87,190.39l64,176c6.81,23.78,38.84,125.61,144,190,114.79,70.28,230.79,43.33,252,38l1116-480c27-11,89-40.56,136-108,64.65-92.68,55.16-191,52-216l-520-1228c-9.58-20.17-48.94-97-140.44-135.81-70.88-30.09-134.6-21.09-159.56-16.19l-248,104c-13.94,10.15-55.79,43.34-73.91,104.18-20.46,68.65,3.34,125.38,9.91,139.82l192,548c29.2,78.3,18,164.7-32,224-67.43,80-196.06,99.64-300,36l-964-432c-162.51-53-258-188.37-241.51-308.26,11.2-81.34,71.11-135,97.51-155.74l1608-744c21.13-12.8,106-60.89,216-40,138.1,26.24,203.14,139.88,212,156l1196,2388a1228.89,1228.89,0,0,1,60,428c-12.79,128.76-48.78,319.73-156,524a1412.52,1412.52,0,0,1-176,260l-2472,1056c-118.42,33-243.15-22.34-296-128-56.86-113.68-16.56-257.77,96-328l2292-1064c112.87-68.52,152.57-214.13,92-328-58.44-109.87-193.89-159.5-312-112l-1208,472Z`;

const speeds = [23, 24.8, 26.5, 27.7, 25.2, 29, 30.5, 24.3];

export default function About() {
  return (
    <section className="relative flex flex-col items-center min-h-screen bg-dark text-light overflow-hidden">

      {/* unified background */}
      <div className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center opacity-70 brightness-110"></div>
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-20">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/Drift.Inc_Text-bg-rev.png"
            alt="Drift.Inc Logo"
            className="w-56 md:w-72 mx-auto drop-shadow-[0_0_12px_rgba(255,0,0,0.5)] select-none"
          />
        </div>

        {/* Minimap */}
        <div className="w-full flex justify-center items-center mb-20">
          <svg
            viewBox="0 0 3200 4000"
            className="w-full max-w-[220px] h-auto overflow-visible mx-auto"
          >
            {/* Track */}
            <path
              id="trackPath"
              d={TRACK_PATH}
              fill="none"
              stroke="white"
              strokeWidth={160}
              strokeLinecap="round"
            />

            {/* Karts */}
            {[...Array(8)].map((_, i) => (
              <image
                key={i}
                href="/karts-icon.png"
                width="250"
                height="250"
                x="-125"
                y="-125"
                style={{ opacity: 0 }}
              >
                {/* Fade-in */}
                <animate
                  attributeName="opacity"
                  values="0;1"
                  begin="0.5s"
                  dur="0.2s"
                  fill="freeze"
                />

                {/* Movement along track */}
                <animateMotion
                  dur={`${speeds[i]}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  begin="0.5s"
                >
                  <mpath href="#trackPath" />
                </animateMotion>

                {/* Fix kart orientation so it faces forward */}
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="90 0 0"
                  to="90 0 0"
                  begin="0s"
                  dur="0.1s"
                  fill="freeze"
                />
              </image>
            ))}
          </svg>
        </div>

        {/* About text */}
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">
          Welcome to <span className="text-red-500 font-semibold">Drift.Inc</span> — Jakarta’s premier go-kart experience.
          We combine speed, precision, and luxury to deliver the ultimate racing thrill for both intermediate and advanced drivers.
        </p>

        <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-16">
          Located in <span className="font-semibold text-red-500">Central Park Jakarta</span>,
          our track is equipped with advanced timing systems. Whether you’re chasing the leaderboard or enjoying casual laps
          with friends, every moment here is built for adrenaline and style.
        </p>

        {/* LEVEL SECTION */}
        <div className="w-full py-10 mt-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(255,0,0,0.5)] mb-8">
            Level
          </h2>

          <p className="text-gray-300 text-lg mb-16 max-w-3xl mx-auto">
            Choose your level and experience the thrill — whether you’re an adrenaline-driven racer or a rising young talent.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Intermediate */}
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

            {/* Advance */}
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

      </div>
    </section>
  );
}
