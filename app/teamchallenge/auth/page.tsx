export default function AuthLandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Team Challenge Access</h1>
        <p className="mb-10 text-gray-400">Login or register to continue</p>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <a
            href="/teamchallenge/auth/login"
            className="bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold block"
          >
            Login
          </a>
          <a
            href="/teamchallenge/auth/register"
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold block"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
