"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--primary)]">
            AI Viva Examiner
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-ghost text-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--foreground)] leading-tight">
            AI-Powered Laboratory
            <br />
            Viva Examination
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mt-6 leading-relaxed">
            An adaptive examination system that uses AI to conduct
            experiment-specific viva examinations, evaluate student responses,
            and generate comprehensive performance reports.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link href="/register" className="btn-primary px-8 py-3 text-base">
              Teacher Dashboard
            </Link>
            <Link href="/viva" className="btn-secondary px-8 py-3 text-base">
              Join Viva Session
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            {
              title: "Upload Experiment",
              description:
                "Upload your experiment PDF. The system extracts text and prepares it for AI-powered questioning.",
              icon: "upload",
            },
            {
              title: "Adaptive Examination",
              description:
                "The AI examiner asks questions based on the experiment, evaluates answers, and adapts difficulty in real-time.",
              icon: "adaptive",
            },
            {
              title: "Comprehensive Reports",
              description:
                "Get detailed performance reports with category breakdowns, strengths, weaknesses, and revision recommendations.",
              icon: "report",
            },
          ].map((feature) => (
            <div key={feature.title} className="card text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                {feature.icon === "upload" && (
                  <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                {feature.icon === "adaptive" && (
                  <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                {feature.icon === "report" && (
                  <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="card mt-16 text-center">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            How It Works
          </h3>
          <div className="flex items-center justify-center gap-4 text-sm text-[var(--muted-foreground)] flex-wrap mt-4">
            <span>Upload PDF</span>
            <span className="text-[var(--primary)]">→</span>
            <span>Extract Text</span>
            <span className="text-[var(--primary)]">→</span>
            <span>Configure Viva</span>
            <span className="text-[var(--primary)]">→</span>
            <span>AI Examiner</span>
            <span className="text-[var(--primary)]">→</span>
            <span>Adaptive Questions</span>
            <span className="text-[var(--primary)]">→</span>
            <span>Evaluate Answers</span>
            <span className="text-[var(--primary)]">→</span>
            <span>Final Report</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--muted-foreground)]">
          AI Viva Examiner &middot; Adaptive Laboratory Examination System
        </div>
      </footer>
    </div>
  );
}
