// app/events/page.tsx
import EventCalendarList from "@/app/components/EventCalendar";

export default function EventsPage() {
  return (
    <main className="relative min-h-screen bg-fixed bg-cover bg-center text-white" style={{ backgroundImage: "url('/track-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0" />
      <div className="relative z-10 min-h-screen flex flex-col items-center bg-black/30 backdrop-blur-md">
        <div className="text-center mt-28 mb-3">
          <h1 className="text-5xl font-extrabold drop-shadow-[0_0_15px_rgba(255,0,0,0.6)] mb-2">Upcoming Events 🏁</h1>
        </div>

        <div className="w-full flex justify-center px-4 pb-16">
          <div className="max-w-7xl w-full">
            <EventCalendarList />
          </div>
        </div>
      </div>
    </main>
  );
}
