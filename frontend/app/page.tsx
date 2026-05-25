import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold text-lg">Velox AI</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Product</a>
          <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</a>
          <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">About</a>
          <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
          Built for the Lloyd&apos;s of London market
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 leading-tight max-w-3xl">
          Turn submissions from{" "}
          <span className="text-brand-400">hours to minutes</span>
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed">
          Velox uses AI to read, extract, and score every insurance submission the moment it arrives — so your underwriters focus on decisions, not data entry.
        </p>

        <div className="flex gap-4">
          <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white px-7 py-3.5 rounded-lg font-semibold text-base transition-colors">
            Open platform
          </Link>
          <a href="#" className="border border-slate-700 hover:border-slate-500 text-slate-300 px-7 py-3.5 rounded-lg font-semibold text-base transition-colors">
            Book a demo
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-16 mt-20 pt-12 border-t border-slate-800 w-full max-w-lg justify-center">
          {[
            { value: "8 min", label: "avg processing time" },
            { value: "94%", label: "extraction accuracy" },
            { value: "10×", label: "faster than manual" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
