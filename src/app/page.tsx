"use client";

import Link from "next/link";

const SUBJECTS = [
  "Database Management Systems",
  "Operating Systems",
  "Computer Networks",
  "Data Structures",
  "Object-Oriented Programming",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1180px] mx-auto px-6 h-14 flex items-center justify-between">
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
              Start practicing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1180px] mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left */}
          <div>
            <p className="text-accent text-2xs font-medium uppercase tracking-wider mb-4">
              Viva Preparation Assistant
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-snug mb-4">
              Practice for your viva.
              <br />
              Like it&apos;s the real one.
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-md">
              Upload your practical or choose a subject. VivaAI conducts an
              adaptive oral examination, follows up on your answers, and shows
              exactly what you need to revise.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/register" className="btn-primary">
                Start a viva
              </Link>
              <Link href="/viva" className="btn-secondary">
                Join session
              </Link>
            </div>
          </div>

          {/* Right — Viva Preview */}
          <div className="border border-border rounded-[10px] bg-bg-secondary overflow-hidden text-sm hidden lg:block">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xs text-text-muted">DBMS · NORMALIZATION</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-2xs text-text-muted">QUESTION 04 / 10</span>
                <span className="font-mono text-2xs text-text-muted">MEDIUM</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Examiner */}
              <div>
                <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-1.5">
                  Examiner
                </p>
                <p className="text-text leading-relaxed">
                  What is the difference between 2NF and 3NF?
                </p>
              </div>

              {/* You */}
              <div className="pl-4 border-l-2 border-border">
                <p className="text-2xs text-text-muted font-medium uppercase tracking-wider mb-1.5">
                  You
                </p>
                <p className="text-text-secondary leading-relaxed">
                  2NF removes partial dependencies while 3NF also removes
                  transitive dependencies.
                </p>
              </div>

              {/* Assessment */}
              <div className="bg-bg-elevated rounded-lg p-4 border border-border">
                <p className="text-2xs text-success font-medium uppercase tracking-wider mb-1.5">
                  Assessment — Good
                </p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  You correctly identified the primary difference between both
                  normal forms.
                </p>
              </div>

              {/* Follow-up */}
              <div>
                <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-1.5">
                  Follow-up
                </p>
                <p className="text-text leading-relaxed">
                  Why can transitive dependencies cause update anomalies?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1180px] mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* How a viva works */}
      <section className="max-w-[1180px] mx-auto px-6 py-16 md:py-20">
        <h2 className="text-lg font-semibold mb-10">How a viva works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            {
              num: "01",
              title: "Upload",
              desc: "Upload your practical PDF or select a subject.",
            },
            {
              num: "02",
              title: "Answer",
              desc: "The examiner asks questions and follows up based on your response.",
            },
            {
              num: "03",
              title: "Review",
              desc: "See weak concepts, missed points, and questions worth revisiting.",
            },
          ].map((step, i) => (
            <div
              key={step.num}
              className={`py-6 ${i < 2 ? "md:pr-8 md:border-r md:border-border" : ""} ${i < 1 ? "" : "md:pl-8"}`}
            >
              <span className="font-mono text-2xs text-text-muted">{step.num}</span>
              <h3 className="font-semibold text-sm mt-2 mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subject strip */}
      <section className="border-t border-border">
        <div className="max-w-[1180px] mx-auto px-6 py-12 md:py-16">
          <p className="text-2xs text-text-muted font-medium uppercase tracking-wider mb-6">
            Practice by subject
          </p>
          <div>
            {SUBJECTS.map((subject) => (
              <Link
                key={subject}
                href="/dashboard/create"
                className="flex items-center justify-between py-4 border-b border-border group hover:bg-bg-hover/50 transition-colors -mx-4 px-4"
              >
                <span className="text-sm font-medium">{subject}</span>
                <span className="text-text-muted text-sm group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-150">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Follow-up demo */}
      <section className="border-t border-border">
        <div className="max-w-[1180px] mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-2xs text-text-muted font-medium uppercase tracking-wider mb-3">
                Built for actual viva practice
              </p>
              <h2 className="text-xl font-semibold mb-3">
                The examiner doesn&apos;t just ask.
                <br />
                It follows up.
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed max-w-md">
                Questions adapt to your previous answers, so memorizing
                definitions isn&apos;t enough. The examiner probes deeper
                where you&apos;re weak and moves on where you&apos;re strong.
              </p>
            </div>

            {/* Conversation demo */}
            <div className="border border-border rounded-[10px] bg-bg-secondary overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <span className="font-mono text-2xs text-text-muted">
                  OS · DEADLOCKS · Q07 / 10 · HARD
                </span>
              </div>
              <div className="p-5 space-y-5 text-sm">
                <div>
                  <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-1.5">
                    Examiner
                  </p>
                  <p className="text-text leading-relaxed">
                    What is deadlock?
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-border">
                  <p className="text-2xs text-text-muted font-medium uppercase tracking-wider mb-1.5">
                    You
                  </p>
                  <p className="text-text-secondary leading-relaxed">
                    A deadlock occurs when multiple processes are waiting for
                    resources held by each other.
                  </p>
                </div>

                <div className="bg-bg-elevated rounded-lg p-4 border border-border">
                  <p className="text-2xs text-success font-medium uppercase tracking-wider mb-1.5">
                    Assessment — Good
                  </p>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Correct definition. Now testing deeper understanding.
                  </p>
                </div>

                <div>
                  <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-1.5">
                    Follow-up
                  </p>
                  <p className="text-text leading-relaxed">
                    What are the four necessary conditions for a deadlock?
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-border">
                  <p className="text-2xs text-text-muted font-medium uppercase tracking-wider mb-1.5">
                    You
                  </p>
                  <p className="text-text-secondary leading-relaxed">
                    Mutual exclusion, hold and wait, no preemption and circular
                    wait.
                  </p>
                </div>

                <div>
                  <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-1.5">
                    Follow-up
                  </p>
                  <p className="text-text leading-relaxed">
                    If we remove circular wait, can a deadlock still occur?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-[1180px] mx-auto px-6 py-16 md:py-20 text-center">
          <h2 className="text-xl font-semibold mb-3">
            Ready to practice?
          </h2>
          <p className="text-text-secondary text-sm mb-8 max-w-md mx-auto">
            Upload an experiment or pick a subject. Your viva starts in under
            a minute.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register" className="btn-primary">
              Start a viva
            </Link>
            <Link href="/viva" className="btn-secondary">
              Join session
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[1180px] mx-auto px-6 py-6 flex items-center justify-between text-2xs text-text-muted">
          <span>VivaAI</span>
          <span>Adaptive viva preparation platform</span>
        </div>
      </footer>
    </div>
  );
}
