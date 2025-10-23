"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { User, Lock, LogOut } from "lucide-react";

const MySwal = withReactContent(Swal);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser?.userId) router.push("/");
    else setUser(storedUser);
  }, [router]);

  const handleLogout = () => {
    Swal.fire({
      icon: "warning",
      title: "Logout",
      text: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        router.push("/");
      }
    });
  };

  const handleProfile = async () => {
    const { value: formValues } = await MySwal.fire({
      title: "Your Profile",
      html: `
        <div class="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-inner">
          <img src="${user?.avatar || "/default-avatar.jpg"}" alt="Avatar" class="w-20 h-20 rounded-full mb-2 border border-gray-300"/>
          <input id="swal-name" class="swal2-input mt-2 mb-2 border border-gray-300 rounded-lg px-3 py-2 w-full" placeholder="Full Name" value="${user?.name || ""}" />
          <input id="swal-email" class="swal2-input mt-2 mb-2 border border-gray-300 rounded-lg px-3 py-2 w-full" placeholder="Email" value="${user?.email || ""}" />
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: () => {
        const name = document.getElementById("swal-name").value;
        const email = document.getElementById("swal-email").value;
        if (!name || !email) Swal.showValidationMessage("Both fields are required");
        return { name, email };
      },
    });

    if (formValues) {
      try {
        const res = await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: formValues.name, email: formValues.email }),
          credentials: "same-origin",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update profile");

        const updatedUser = { ...user, name: formValues.name, email: formValues.email };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        Swal.fire("Updated!", "Profile updated successfully.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  const handleChangePassword = async () => {
    const { value: passwords } = await MySwal.fire({
      title: "Change Password",
      html: `
        <div class="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl shadow-inner">
          <input id="swal-current" type="password" class="swal2-input" placeholder="Current Password"/>
          <input id="swal-new" type="password" class="swal2-input" placeholder="New Password"/>
          <input id="swal-confirm" type="password" class="swal2-input" placeholder="Confirm New Password"/>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Change",
      preConfirm: () => {
        const current = document.getElementById("swal-current").value;
        const newPass = document.getElementById("swal-new").value;
        const confirm = document.getElementById("swal-confirm").value;
        if (!current || !newPass || !confirm) Swal.showValidationMessage("All fields are required");
        if (newPass !== confirm) Swal.showValidationMessage("Passwords do not match");
        return { current, newPass };
      },
    });

    if (passwords) {
      try {
        const res = await fetch("/api/users/password", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current: passwords.current, newPass: passwords.newPass }),
          credentials: "same-origin",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to change password");

        // Clear localStorage and redirect to login
        localStorage.removeItem("user");
        Swal.fire("Success", "Password changed successfully. Please login again.", "success").then(() => {
          router.push("/");
        });
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Final Exam</h1>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            <span className="font-medium">{user?.name || "User"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button onClick={handleProfile} className="flex items-center gap-2 px-4 py-2 w-full text-gray-700 hover:bg-gray-100">
                <User className="h-4 w-4"/> Profile
              </button>
              <button onClick={handleChangePassword} className="flex items-center gap-2 px-4 py-2 w-full text-gray-700 hover:bg-gray-100">
                <Lock className="h-4 w-4"/> Change Password
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 w-full text-red-500 hover:bg-red-50">
                <LogOut className="h-4 w-4"/> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
