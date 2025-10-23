"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function DashboardHeader({ userName }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("username");
    router.push("/"); // redirect to login
  };

  // Profile popup
  const handleProfile = () => {
    Swal.fire({
      title: "User Profile",
      html: `<strong>Name:</strong> ${userName} <br> <strong>Email:</strong> Not shown`,
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  // Redirect if no token in storage
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) router.push("/");
  }, [router]);

  return (
    <header className="bg-[#1877f2] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Home */}
        <a
          href="/"
          className="flex items-center space-x-2 text-white hover:text-gray-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"
            />
          </svg>
          <span className="font-bold text-xl">Home</span>
        </a>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 bg-white text-[#1877f2] px-4 py-2 rounded-full hover:bg-gray-100 transition"
          >
            <span className="font-medium text-sm">{userName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
