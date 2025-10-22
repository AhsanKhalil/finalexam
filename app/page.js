import Header from "./components/Header";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white text-gray-900">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-700">
          Welcome to NextTail 🚀
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-600">
          A clean and modern starter layout built with Next.js and Tailwind CSS.
          Beautiful, responsive, and easy to customize.
        </p>

        <button className="px-8 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition transform hover:scale-105">
          Get Started
        </button>
      </main>

      <Footer />
    </div>
  );
}
