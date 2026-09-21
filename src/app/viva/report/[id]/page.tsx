"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ReportData {
  session: { id: string; studentName: string; totalScore: number; maxScore: number; startedAt: string; completedAt: string };
  viva: { title: string; experimentTitle: string; passingScore: number };
  report: { overallScore: number; maxScore: number; percentage: number; status: string; categoryPerformance: Record<string, number>; strongAreas: string[]; weakAreas: string[]; recommendedRevision: string[]; summary: string };
  evaluations: Array<{ questionNumber: number; question: string; studentAnswer: string; score: number; maxScore: number; correctness: string; topic: string; strengths: string[]; weaknesses: string[]; missingConcepts: string[] }>;
}

export default function ReportPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/report`)
      .then((r) => { if (!r.ok) throw new Error("Report not available"); return r.json(); })
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted text-sm">Loading report...</div>;
  if (error || !report) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted text-sm">{error || "Report not available."}</div>;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <p className="text-2xs text-text-muted font-mono uppercase tracking-wider mb-2">Assessment Report</p>
          <h1 className="text-xl font-semibold">{report.viva.experimentTitle}</h1>
          <p className="text-sm text-text-secondary mt-1">{report.session.studentName}</p>
        </div>

        <div className="divider" />

        {/* Score */}
        <div className="card text-center py-8">
          <p className="text-4xl font-bold">{report.report.percentage}%</p>
          <p className="text-sm text-text-secondary mt-1">{report.report.overallScore} / {report.report.maxScore} points</p>
          <div className={cn("inline-block px-3 py-1 rounded text-xs font-medium mt-3", report.report.status === "PASSED" ? "bg-success-muted text-success" : "bg-error-muted text-error")}>
            {report.report.status}
          </div>
          <p className="text-2xs text-text-muted mt-3">Passing: {report.viva.passingScore}%</p>
        </div>

        {/* Category Performance */}
        {Object.keys(report.report.categoryPerformance).length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-secondary mb-3">Performance by category</p>
            <div className="space-y-3">
              {Object.entries(report.report.categoryPerformance).map(([cat, pct]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat}</span>
                    <span className="font-mono text-xs">{Math.round(pct as number)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strong / Weak */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs font-medium text-success mb-2">Strong areas</p>
            <ul className="space-y-1">
              {report.report.strongAreas.map((a, i) => <li key={i} className="text-sm text-text-secondary">• {a}</li>)}
              {report.report.strongAreas.length === 0 && <li className="text-sm text-text-muted">None identified</li>}
            </ul>
          </div>
          <div className="card">
            <p className="text-xs font-medium text-warning mb-2">Needs review</p>
            <ul className="space-y-1">
              {report.report.weakAreas.map((a, i) => <li key={i} className="text-sm text-text-secondary">• {a}</li>)}
              {report.report.weakAreas.length === 0 && <li className="text-sm text-text-muted">None identified</li>}
            </ul>
          </div>
        </div>

        {/* Revision */}
        {report.report.recommendedRevision.length > 0 && (
          <div className="card">
            <p className="text-xs font-medium text-text-secondary mb-2">Recommended revision</p>
            <div className="flex flex-wrap gap-1.5">
              {report.report.recommendedRevision.map((t, i) => (
                <span key={i} className="badge-neutral">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {report.report.summary && (
          <div className="card">
            <p className="text-xs font-medium text-text-secondary mb-2">Summary</p>
            <p className="text-sm text-text-secondary leading-relaxed">{report.report.summary}</p>
          </div>
        )}

        {/* Question by Question */}
        <div>
          <p className="text-xs font-medium text-text-secondary mb-3">Question breakdown</p>
          <div className="space-y-2">
            {report.evaluations.map((ev) => (
              <div key={ev.questionNumber} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === ev.questionNumber ? null : ev.questionNumber)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xs text-text-muted">Q{ev.questionNumber}</span>
                    <span className="badge-neutral text-2xs">{ev.topic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-medium">{ev.score}/{ev.maxScore}</span>
                    <span className="text-text-muted text-xs">{expanded === ev.questionNumber ? "−" : "+"}</span>
                  </div>
                </button>
                {expanded === ev.questionNumber && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-2 text-sm">
                    <div><span className="text-2xs text-text-muted uppercase tracking-wider">Question: </span>{ev.question}</div>
                    <div><span className="text-2xs text-text-muted uppercase tracking-wider">Answer: </span>{ev.studentAnswer}</div>
                    <div><span className="text-2xs text-text-muted uppercase tracking-wider">Status: </span><span className="font-mono text-xs uppercase">{ev.correctness.replace(/_/g, " ")}</span></div>
                    {ev.strengths.length > 0 && ev.strengths[0] !== "" && <div className="text-success text-xs">✓ {ev.strengths.join("; ")}</div>}
                    {ev.weaknesses.length > 0 && ev.weaknesses[0] !== "" && <div className="text-warning text-xs">! {ev.weaknesses.join("; ")}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <Link href="/viva" className="btn-secondary text-sm">Return to join page</Link>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
