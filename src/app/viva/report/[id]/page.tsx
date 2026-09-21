"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ReportData {
  session: {
    id: string;
    studentName: string;
    totalScore: number;
    maxScore: number;
    startedAt: string;
    completedAt: string;
  };
  viva: {
    title: string;
    experimentTitle: string;
    passingScore: number;
  };
  report: {
    overallScore: number;
    maxScore: number;
    percentage: number;
    status: string;
    categoryPerformance: Record<string, number>;
    strongAreas: string[];
    weakAreas: string[];
    recommendedRevision: string[];
    summary: string;
  };
  evaluations: Array<{
    questionNumber: number;
    question: string;
    studentAnswer: string;
    score: number;
    maxScore: number;
    correctness: string;
    topic: string;
    strengths: string[];
    weaknesses: string[];
    missingConcepts: string[];
    feedback: string;
  }>;
}

export default function ReportPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/report`)
      .then((r) => {
        if (!r.ok) throw new Error("Report not available");
        return r.json();
      })
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse-slow text-lg text-[var(--muted-foreground)]">
            Preparing assessment...
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center space-y-4">
          <p className="text-[var(--muted-foreground)]">
            {error || "Report not available."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto p-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--primary)]">
            AI Viva Examiner
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Assessment Report
          </p>
        </div>

        <div className="card text-center">
          <h2 className="text-lg font-semibold mb-4">
            {report.viva.experimentTitle}
          </h2>
          <div className="text-5xl font-bold text-[var(--primary)] mb-2">
            {report.report.percentage}%
          </div>
          <div className="text-lg text-[var(--muted-foreground)] mb-4">
            {report.report.overallScore} / {report.report.maxScore} points
          </div>
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
              report.report.status === "PASSED"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {report.report.status}
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-4">
            Passing score: {report.viva.passingScore}%
          </p>
        </div>

        {Object.keys(report.report.categoryPerformance).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(report.report.categoryPerformance).map(
                ([category, pct]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category}</span>
                      <span>{Math.round(pct as number)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (pct as number) >= 70
                            ? "bg-green-500"
                            : (pct as number) >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-green-700">
              Strong Areas
            </h3>
            {report.report.strongAreas.length > 0 ? (
              <ul className="space-y-1">
                {report.report.strongAreas.map((area, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                No strong areas identified
              </p>
            )}
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-amber-700">
              Weak Areas
            </h3>
            {report.report.weakAreas.length > 0 ? (
              <ul className="space-y-1">
                {report.report.weakAreas.map((area, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">-</span>
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                No weak areas identified
              </p>
            )}
          </div>
        </div>

        {report.report.recommendedRevision.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">
              Recommended Revision
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.report.recommendedRevision.map((topic, i) => (
                <span key={i} className="badge-warning">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {report.report.summary && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Summary</h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              {report.report.summary}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Question-by-Question Report</h3>
          {report.evaluations.map((evaluation) => (
            <div key={evaluation.questionNumber} className="card">
              <button
                onClick={() =>
                  setExpandedQuestion(
                    expandedQuestion === evaluation.questionNumber
                      ? null
                      : evaluation.questionNumber
                  )
                }
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[var(--muted-foreground)]">
                      Question {evaluation.questionNumber}
                    </span>
                    <span className="badge-info capitalize">
                      {evaluation.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {evaluation.score}/{evaluation.maxScore}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedQuestion === evaluation.questionNumber
                          ? "rotate-180"
                          : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
              {expandedQuestion === evaluation.questionNumber && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-[var(--muted-foreground)]">
                      Question:
                    </span>
                    <p className="mt-1">{evaluation.question}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--muted-foreground)]">
                      Your Answer:
                    </span>
                    <p className="mt-1">{evaluation.studentAnswer}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--muted-foreground)]">
                      Correctness:
                    </span>
                    <span className="ml-2 capitalize">
                      {evaluation.correctness.replace(/_/g, " ")}
                    </span>
                  </div>
                  {evaluation.strengths.length > 0 &&
                    evaluation.strengths[0] !== "" && (
                      <div>
                        <span className="font-medium text-green-600">
                          Strengths:
                        </span>
                        <p className="mt-1">{evaluation.strengths.join("; ")}</p>
                      </div>
                    )}
                  {evaluation.weaknesses.length > 0 &&
                    evaluation.weaknesses[0] !== "" && (
                      <div>
                        <span className="font-medium text-amber-600">
                          Weaknesses:
                        </span>
                        <p className="mt-1">
                          {evaluation.weaknesses.join("; ")}
                        </p>
                      </div>
                    )}
                  {evaluation.missingConcepts.length > 0 &&
                    evaluation.missingConcepts[0] !== "" && (
                      <div>
                        <span className="font-medium text-red-600">
                          Missing Concepts:
                        </span>
                        <p className="mt-1">
                          {evaluation.missingConcepts.join("; ")}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-[var(--muted-foreground)] pt-8">
          AI Viva Examiner &middot; Assessment generated by AI
        </div>
      </div>
    </div>
  );
}
