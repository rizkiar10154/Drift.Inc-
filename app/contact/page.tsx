export default function Contact() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-white px-6 py-20 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center opacity-70"></div>

      {/* Red-tinted overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/70 to-red-950/40 mix-blend-overlay"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 drop-shadow-lg">
            Contact Us
          </h1>
          <p className="mt-4 text-gray-300 text-lg">
            Get in touch with Drift.Inc — Central Park, Jakarta
          </p>
        </div>

        {/* Info & Form */}
        <div className="bg-black/60 border border-red-800 rounded-2xl p-8 md:p-12 shadow-lg backdrop-blur-md">
          <h2 className="text-2xl font-semibold mb-6 text-red-500">Reach Us</h2>
          <div className="space-y-4 text-gray-300">
            <p>📍 <span className="text-white font-medium">Central Park, Jakarta</span></p>
            <p>🕒 Open Daily | 10:00 AM – 10:00 PM</p>
            <p>📧 contact@driftinc.id</p>
            <p>📱 WhatsApp: +62 812-3456-7890</p>
          </div>

          <form className="mt-8 space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 rounded-lg bg-black border border-red-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 rounded-lg bg-black border border-red-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              className="w-full p-3 rounded-lg bg-black border border-red-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/40 animate-heartbeat"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="w-full mt-10 rounded-2xl overflow-hidden border border-red-800 shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.7207424700624!2d106.78901617590486!3d-6.171628793811278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f6f5f982b2f3%3A0x72f0dbcf0cf0c671!2sCentral%20Park%20Mall!5e0!3m2!1sen!2sid!4v1699999999999!5m2!1sen!2sid"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
