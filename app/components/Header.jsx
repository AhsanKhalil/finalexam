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
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser?.userId) router.push("/");
    else setUser(storedUser);
  }, [router]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/users/information");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch user information");
      setUserInfo(data.userInfo);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

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
    if (!userInfo) await fetchUserInfo();

    const { value: formValues } = await MySwal.fire({
      title: "Your Profile",
      width: "90%",
      html: `
        <div class="p-4 bg-gray-50 rounded-xl shadow-inner w-full">
          <div class="flex justify-center mb-4">
            <img src="${user?.avatar || "/default-avatar.jpg"}" alt="Avatar" class="w-24 h-24 rounded-full border border-gray-300"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <input id="swal-fullName" class="swal2-input" placeholder="Full Name" value="${user?.name || ""}" />
            <input id="swal-email" class="swal2-input" placeholder="Email" value="${user?.email || ""}" />
            <input id="swal-cnic" class="swal2-input" placeholder="CNIC" value="${userInfo?.cnic || ""}" />
            <input id="swal-mobileNumber" class="swal2-input" placeholder="Mobile Number" value="${userInfo?.mobileNumber || ""}" />
            <input id="swal-whatsapp" class="swal2-input" placeholder="Whatsapp" value="${userInfo?.whatsapp || ""}" />
            <input id="swal-facebookUrl" class="swal2-input" placeholder="Facebook URL" value="${userInfo?.facebookUrl || ""}" />
            <input id="swal-instagramUrl" class="swal2-input" placeholder="Instagram URL" value="${userInfo?.instagramUrl || ""}" />
            <textarea id="swal-about" class="swal2-textarea col-span-2" placeholder="About">${userInfo?.about || ""}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: () => {
        const fullName = document.getElementById("swal-fullName").value;
        const email = document.getElementById("swal-email").value;
        const cnic = document.getElementById("swal-cnic").value;
        const mobileNumber = document.getElementById("swal-mobileNumber").value;
        const whatsapp = document.getElementById("swal-whatsapp").value;
        const facebookUrl = document.getElementById("swal-facebookUrl").value;
        const instagramUrl = document.getElementById("swal-instagramUrl").value;
        const about = document.getElementById("swal-about").value;

        if (!fullName || !email) Swal.showValidationMessage("Full Name and Email are required");
        if (!/^\d+$/.test(cnic)) Swal.showValidationMessage("CNIC must be numeric");
        if (!/^\d+$/.test(mobileNumber)) Swal.showValidationMessage("Mobile must be numeric");
        if (!/^\d+$/.test(whatsapp)) Swal.showValidationMessage("Whatsapp must be numeric");
        if (facebookUrl && !/^https?:\/\/.+/.test(facebookUrl)) Swal.showValidationMessage("Facebook URL invalid");
        if (instagramUrl && !/^https?:\/\/.+/.test(instagramUrl)) Swal.showValidationMessage("Instagram URL invalid");

        return { fullName, email, cnic, mobileNumber, whatsapp, facebookUrl, instagramUrl, about };
      },
    });

    if (formValues) {
      try {
        // Update User
        const resUser = await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: formValues.fullName, email: formValues.email }),
          credentials: "same-origin",
        });
        const dataUser = await resUser.json();
        if (!resUser.ok) throw new Error(dataUser.message || "Failed to update profile");

        // Update UserInformation
        const resInfo = await fetch("/api/users/information", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cnic: formValues.cnic,
            mobileNumber: formValues.mobileNumber,
            whatsapp: formValues.whatsapp,
            facebookUrl: formValues.facebookUrl,
            instagramUrl: formValues.instagramUrl,
            about: formValues.about,
          }),
          credentials: "same-origin",
        });
        const dataInfo = await resInfo.json();
        if (!resInfo.ok) throw new Error(dataInfo.message || "Failed to update user information");

        // Update local state & localStorage
        const updatedUser = { ...user, name: formValues.fullName, email: formValues.email };
        setUser(updatedUser);
        setUserInfo(formValues);
        localStorage.setItem("user", JSON.stringify(updatedUser));

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <button
                className="flex items-center px-4 py-2 w-full hover:bg-gray-100"
                onClick={handleProfile}
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </button>
              <button
                className="flex items-center px-4 py-2 w-full hover:bg-gray-100"
                onClick={handleChangePassword}
              >
                <Lock className="w-4 h-4 mr-2" /> Change Password
              </button>
              <button
                className="flex items-center px-4 py-2 w-full hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
