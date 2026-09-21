"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SessionResult {
  id: string;
  studentName: string;
  totalScore: number;
  maxScore: number;
  status: string;
  completedAt: string | null;
  experiment: string;
  passingScore: number;
}

export default function ResultsPage() {
  const [vivas, setVivas] = useState<
    Array<{
      id: string;
      title: string;
      sessions: SessionResult[];
      experiment: { title: string };
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vivas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setVivas(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allSessions = vivas
    .flatMap((v) =>
      v.sessions.map((s) => ({
        ...s,
        experiment: v.experiment.title,
        passingScore: 50,
      }))
    )
    .filter((s) => s.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.completedAt || "").getTime() -
        new Date(a.completedAt || "").getTime()
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-xs uppercase tracking-widest animate-pulse-slow">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-4">
          Assessment Data
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Results
        </h1>
      </div>

      <div className="rule-ultra" />

      {allSessions.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-body text-[#525252]">No completed sessions yet.</p>
        </div>
      ) : (
        <div className="border border-black">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black bg-black text-white">
                <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">
                  Student
                </th>
                <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">
                  Experiment
                </th>
                <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">
                  Score
                </th>
                <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">
                  Date
                </th>
                <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {allSessions.map((session) => {
                const pct =
                  session.maxScore > 0
                    ? Math.round(
                        (session.totalScore / session.maxScore) * 100
                      )
                    : 0;
                const passed = pct >= session.passingScore;
                return (
                  <tr
                    key={session.id}
                    className="border-b border-[#E5E5E5] last:border-0 hover:bg-black/[0.02] transition-colors duration-100"
                  >
                    <td className="px-6 py-4 font-body font-medium">
                      {session.studentName}
                    </td>
                    <td className="px-6 py-4 font-body text-[#525252]">
                      {session.experiment}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold">
                      {pct}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          passed ? "badge-success" : "badge-danger"
                        }
                      >
                        {passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#525252]">
                      {session.completedAt
                        ? new Date(session.completedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/viva/report/${session.id}`}
                        target="_blank"
                        className="font-mono text-[10px] uppercase tracking-widest underline underline-offset-4 hover:no-underline"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
