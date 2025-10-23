// app/dashboard/page.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import ClientDashboard from "../components/ClientDashboard";
import Header from "../components/Header";

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
        
<Header />
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
