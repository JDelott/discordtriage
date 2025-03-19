import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Discord Triage 
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Streamline your Discord server management with automated message organization and priority handling.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="#"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </a>
          <a
            href="#"
            className="px-8 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          >
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}
