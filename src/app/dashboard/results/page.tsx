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
  viva: {
    title: string;
    experiment: { title: string };
    passingScore: number;
  };
}

interface VivaResult {
  id: string;
  title: string;
  sessions: SessionResult[];
  experiment: { title: string };
}

export default function ResultsPage() {
  const [vivas, setVivas] = useState<VivaResult[]>([]);
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
        vivaTitle: v.title,
        vivaId: v.id,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt || "").getTime() -
        new Date(a.completedAt || "").getTime()
    );

  const completedSessions = allSessions.filter(
    (s) => s.status === "COMPLETED"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted-foreground)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Results
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          View all student assessment results
        </p>
      </div>

      {completedSessions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--muted-foreground)]">
            No completed sessions yet.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">
                    Experiment
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedSessions.map((session) => {
                  const pct =
                    session.maxScore > 0
                      ? Math.round(
                          (session.totalScore / session.maxScore) * 100
                        )
                      : 0;
                  const passed =
                    pct >= (session.viva?.passingScore || 50);
                  return (
                    <tr
                      key={session.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]"
                    >
                      <td className="py-3 px-4 font-medium">
                        {session.studentName}
                      </td>
                      <td className="py-3 px-4 text-[var(--muted-foreground)]">
                        {session.experiment}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{pct}%</span>
                        <span className="text-[var(--muted-foreground)] ml-1">
                          ({session.totalScore}/{session.maxScore})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={passed ? "badge-success" : "badge-danger"}
                        >
                          {passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--muted-foreground)]">
                        {session.completedAt
                          ? new Date(
                              session.completedAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/viva/report/${session.id}`}
                          target="_blank"
                          className="text-[var(--primary)] text-sm hover:underline"
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
        </div>
      )}
    </div>
  );
}
