"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-24 py-6 border-b border-black">
        <h1 className="font-display text-xl font-bold tracking-tight">
          AI Viva Examiner
        </h1>
        <div className="flex items-center gap-8">
          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-widest hover:underline underline-offset-4 transition-all duration-100"
          >
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-xs">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 relative">
        <div className="max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-widest mb-8">
            Adaptive Laboratory Examination
          </p>
          <h2 className="font-display text-5xl md:text-7xl lg:text-display-lg font-bold tracking-tight leading-none mb-8">
            AI-Powered
            <br />
            <span className="italic">Viva Examination</span>
          </h2>
          <div className="rule-thick w-24 my-8" />
          <p className="font-body text-lg md:text-xl max-w-2xl leading-relaxed text-[#525252] mb-12">
            An examination system that adapts to student responses in real-time.
            Upload an experiment, configure the viva, and let the AI examiner
            conduct a rigorous, experiment-specific assessment.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/register" className="btn-primary">
              Teacher Dashboard
            </Link>
            <Link href="/viva" className="btn-secondary">
              Join Viva Session
            </Link>
          </div>
        </div>
      </section>

      {/* Thick rule */}
      <div className="px-6 md:px-12 lg:px-24">
        <div className="rule-ultra" />
      </div>

      {/* Features */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            {
              num: "01",
              title: "Upload Experiment",
              desc: "Upload your experiment PDF. The system extracts text and prepares it for AI-powered questioning.",
            },
            {
              num: "02",
              title: "Adaptive Examination",
              desc: "The AI examiner asks questions based on the experiment, evaluates answers, and adapts difficulty in real-time.",
            },
            {
              num: "03",
              title: "Comprehensive Reports",
              desc: "Get detailed performance reports with category breakdowns, strengths, weaknesses, and revision recommendations.",
            },
          ].map((feature, i) => (
            <div
              key={feature.num}
              className={`p-8 md:p-12 group border border-black transition-colors duration-100 hover:bg-black hover:text-white ${
                i > 0 ? "md:border-l" : ""
              }`}
            >
              <span className="font-mono text-xs tracking-widest block mb-6">
                {feature.num}
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                {feature.title}
              </h3>
              <div className="rule-thin w-12 mb-4 opacity-40 group-hover:opacity-100" />
              <p className="font-body text-base leading-relaxed opacity-70">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Inverted section */}
      <section className="bg-black text-white px-6 md:px-12 lg:px-24 py-24 md:py-32 relative overflow-hidden">
        <div className="texture-vertical-lines absolute inset-0" />
        <div className="relative z-10 max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-widest mb-8 text-white/60">
            How It Works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {[
              "Upload PDF",
              "Extract Text",
              "Configure Viva",
              "AI Examiner",
              "Adaptive Questions",
              "Evaluate Answers",
              "Final Report",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-display text-lg font-bold">{step}</p>
                </div>
                {i < 6 && (
                  <span className="hidden md:block text-white/40 text-lg">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 lg:px-24 py-8 border-t border-black">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest">
            AI Viva Examiner
          </p>
          <p className="font-mono text-xs text-[#525252]">
            Adaptive Laboratory Examination System
          </p>
        </div>
      </footer>
    </div>
  );
}
