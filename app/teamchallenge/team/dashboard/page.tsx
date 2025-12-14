import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function TeamDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading dashboard...
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
