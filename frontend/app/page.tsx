export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-8">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          Built for the Lloyd&apos;s market
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Submissions processed in{" "}
          <span className="text-brand-500">minutes</span>, not hours
        </h1>

        <p className="text-xl text-gray-500 mb-10">
          Velox uses AI to extract, score, and route insurance submissions
          automatically — so your underwriters focus on decisions, not data
          entry.
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 transition-colors"
          >
            Get started
          </a>
          <a
            href="#"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Book a demo
          </a>
        </div>
      </div>
    </main>
  );
}
