// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Final Exam App",
  description: "Next.js project with authentication and dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-gray-900">
        {children}
      </body>
    </html>
  );
}
