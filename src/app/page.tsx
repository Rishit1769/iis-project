"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="font-semibold text-sm">VivaAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-xs">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="max-w-2xl">
          <p className="text-accent text-xs font-medium uppercase tracking-wider mb-4">
            Viva Preparation Assistant
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Practice viva questions
            <br />
            with AI-powered feedback
          </h1>
          <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-lg">
            Select a subject, practice conversationally, receive detailed
            feedback, and understand where you need improvement.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/register" className="btn-primary">
              Start practicing
            </Link>
            <Link href="/viva" className="btn-secondary">
              Join a session
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Upload Experiment",
                desc: "Upload your experiment PDF. The system extracts text and prepares it for AI-powered questioning.",
              },
              {
                title: "Adaptive Examination",
                desc: "The AI asks experiment-specific questions, evaluates answers, and adapts difficulty based on performance.",
              },
              {
                title: "Detailed Reports",
                desc: "Get category breakdowns, strengths, weaknesses, and specific revision recommendations.",
              },
            ].map((feature) => (
              <div key={feature.title} className="card">
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-2xs text-text-muted">
          <span>VivaAI</span>
          <span>Adaptive Laboratory Examination System</span>
        </div>
      </footer>
    </div>
  );
}
