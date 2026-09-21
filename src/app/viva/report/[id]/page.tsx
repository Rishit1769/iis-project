"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ReportData {
  session: { id: string; studentName: string; totalScore: number; maxScore: number; startedAt: string; completedAt: string };
  viva: { title: string; experimentTitle: string; passingScore: number };
  report: { overallScore: number; maxScore: number; percentage: number; status: string; categoryPerformance: Record<string, number>; strongAreas: string[]; weakAreas: string[]; recommendedRevision: string[]; summary: string };
  evaluations: { id: string; question: string; answer: string; score: number; maxScore: number; feedback: string; category: string }[];
}

export default function VivaReportPage() {
  const params = useParams();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${params.id}/report`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load report"); return r.json(); })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto">
      <div className="h-8 w-64 bg-black/5 animate-pulse-slow mb-8" />
      <div className="h-32 w-full bg-black/5 animate-pulse-slow mb-4" />
      <div className="h-48 w-full bg-black/5 animate-pulse-slow" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto">
      <div className="border border-black p-8 text-center">
        <p className="font-mono text-sm tracking-widest uppercase">Error</p>
        <p className="font-body mt-2">{error || "Report not found"}</p>
      </div>
    </div>
  );

  const { session, viva, report, evaluations } = data;
  const pct = report.percentage;

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-2">{viva.title}</p>
        <h1 className="font-display text-4xl font-bold mb-1">{viva.experimentTitle}</h1>
        <p className="font-body text-black/60">{session.studentName}</p>
        <div className="rule-thick mt-6" />
      </header>

      <section className="mb-12">
        <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-4">Final Score</p>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-display text-7xl font-bold">{report.overallScore}</span>
          <span className="font-mono text-2xl text-black/40">/ {report.maxScore}</span>
        </div>
        <div className="rule-thin my-4" />
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm tracking-widest uppercase">{report.status}</span>
          <span className="font-mono text-sm text-black/40">{pct.toFixed(1)}%</span>
          <span className="font-mono text-xs text-black/30">Pass: {viva.passingScore}</span>
        </div>
      </section>

      <section className="mb-12">
        <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-4">Category Performance</p>
        {Object.entries(report.categoryPerformance).map(([cat, score]) => (
          <div key={cat} className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="font-body text-sm">{cat}</span>
              <span className="font-mono text-sm">{score as number}%</span>
            </div>
            <div className="h-2 bg-black/5 w-full">
              <div className="h-full bg-black transition-all" style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="mb-12 grid grid-cols-2 gap-8">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-3">Strong Areas</p>
          {report.strongAreas.map((a) => (
            <div key={a} className="border border-black p-3 mb-2 font-body text-sm">{a}</div>
          ))}
        </div>
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-3">Weak Areas</p>
          {report.weakAreas.map((a) => (
            <div key={a} className="border border-black p-3 mb-2 font-body text-sm">{a}</div>
          ))}
        </div>
      </section>

      {report.recommendedRevision.length > 0 && (
        <section className="mb-12">
          <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-3">Recommended Revision</p>
          <div className="flex flex-wrap gap-2">
            {report.recommendedRevision.map((r) => (
              <span key={r} className="border border-black px-3 py-1 font-mono text-xs tracking-wide">{r}</span>
            ))}
          </div>
        </section>
      )}

      <section className="mb-12">
        <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-3">Summary</p>
        <div className="rule-thin mb-3" />
        <p className="font-body text-sm leading-relaxed">{report.summary}</p>
      </section>

      <section>
        <p className="font-mono text-xs tracking-widest uppercase text-black/50 mb-4">Question by Question</p>
        <div className="rule-ultra mb-4" />
        {evaluations.map((ev) => (
          <div key={ev.id} className="border-b border-black/10">
            <button
              onClick={() => setExpandedQ(expandedQ === ev.id ? null : ev.id)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <div className="flex-1">
                <p className="font-body text-sm">{ev.question}</p>
                <p className="font-mono text-xs text-black/40 mt-1">{ev.category} — {ev.score}/{ev.maxScore}</p>
              </div>
              <span className="font-mono text-lg ml-4">{expandedQ === ev.id ? "−" : "+"}</span>
            </button>
            {expandedQ === ev.id && (
              <div className="pb-4 pl-4 border-l-2 border-black/10">
                <p className="font-body text-sm mb-2"><span className="font-mono text-xs tracking-widest uppercase text-black/40">Answer: </span>{ev.answer}</p>
                <p className="font-body text-sm text-black/60"><span className="font-mono text-xs tracking-widest uppercase text-black/40">Feedback: </span>{ev.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
