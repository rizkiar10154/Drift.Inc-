import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Drift.Inc | Premium Go-Kart Experience",
  description: "Experience high-speed go-kart racing at Drift.Inc — Central Park Jakarta. Premium, elegant.",

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔥 Force override Vercel favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>

      <body className="bg-black text-white antialiased selection:bg-red-600 selection:text-white">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
