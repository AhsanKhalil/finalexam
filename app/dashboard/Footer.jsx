"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Final Exam App. All rights reserved.
        </p>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-white transition text-sm">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition text-sm">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
