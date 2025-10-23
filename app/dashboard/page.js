// app/dashboard/page.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import ClientDashboard from "./ClientDashboard";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("auth_token")?.value || null;
  if (!tokenCookie) redirect("/");

  try {
    const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET);
    const displayName = decoded.fullName || decoded.email;

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        {/* Header */}
        <header className="bg-blue-300 shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <div className="relative">
              <button className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-gray-100 transition">
                <span>{displayName}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
                <a href="/" className="block px-4 py-2 text-red-500 hover:bg-red-50">Logout</a>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-grow flex justify-center items-start px-6 py-10">
          <div className="w-full max-w-6xl">
            <ClientDashboard name={displayName} />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p>&copy; {new Date().getFullYear()} NextTail. All rights reserved.</p>
            <div className="space-x-4">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (err) {
    console.error("Dashboard token verify error:", err);
    redirect("/");
  }
}
