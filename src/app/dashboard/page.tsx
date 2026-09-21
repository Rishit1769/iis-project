"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Viva {
  id: string;
  title: string;
  sessionCode: string;
  totalQuestions: number;
  difficulty: string;
  createdAt: string;
  experiment: { title: string };
  sessions: Array<{
    id: string;
    studentName: string;
    status: string;
    totalScore: number;
    maxScore: number;
    completedAt: string | null;
  }>;
}

export default function DashboardPage() {
  const [vivas, setVivas] = useState<Viva[]>([]);
  const [stats, setStats] = useState({
    totalVivas: 0,
    studentsAssessed: 0,
    completedVivas: 0,
    averageScore: 0,
  });

  useEffect(() => {
    fetch("/api/vivas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVivas(data);
          const totalSessions = data.reduce(
            (acc: number, v: Viva) => acc + v.sessions.length, 0
          );
          const completed = data.reduce(
            (acc: number, v: Viva) =>
              acc + v.sessions.filter((s) => s.status === "COMPLETED").length, 0
          );
          const totalScore = data.reduce(
            (acc: number, v: Viva) =>
              acc + v.sessions
                .filter((s) => s.status === "COMPLETED")
                .reduce(
                  (sacc: number, s) =>
                    sacc + (s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0), 0
                ), 0
          );
          setStats({
            totalVivas: data.length,
            studentsAssessed: totalSessions,
            completedVivas: completed,
            averageScore: completed > 0 ? Math.round(totalScore / completed) : 0,
          });
        }
      })
      .catch(console.error);
  }, []);

  const recentSessions = vivas
    .flatMap((v) =>
      v.sessions.map((s) => ({ ...s, experiment: v.experiment.title, vivaTitle: v.title }))
    )
    .sort((a, b) => new Date(b.completedAt || "").getTime() - new Date(a.completedAt || "").getTime())
    .slice(0, 5);

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          Overview of your viva examination system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Vivas", value: stats.totalVivas },
          { label: "Students Assessed", value: stats.studentsAssessed },
          { label: "Completed", value: stats.completedVivas },
          { label: "Avg Score", value: `${stats.averageScore}%` },
        ].map((card) => (
          <div key={card.label} className="card">
            <p className="text-2xs text-text-muted uppercase tracking-wider font-medium">
              {card.label}
            </p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Recent Sessions</h2>
          <Link href="/dashboard/results" className="text-xs text-accent hover:text-accent-hover transition-colors">
            View all
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-text-muted text-sm">No sessions yet</p>
            <Link
              href="/dashboard/create"
              className="text-accent text-sm mt-2 inline-block hover:text-accent-hover"
            >
              Create your first viva
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-elevated border-b border-border">
                  <th className="text-left px-4 py-2.5 text-2xs font-medium text-text-muted uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-4 py-2.5 text-2xs font-medium text-text-muted uppercase tracking-wider">
                    Experiment
                  </th>
                  <th className="text-left px-4 py-2.5 text-2xs font-medium text-text-muted uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-4 py-2.5 text-2xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 text-2xs font-medium text-text-muted uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => {
                  const pct =
                    session.maxScore > 0
                      ? Math.round((session.totalScore / session.maxScore) * 100)
                      : 0;
                  return (
                    <tr
                      key={session.id}
                      className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{session.studentName}</td>
                      <td className="px-4 py-3 text-text-secondary">{session.experiment}</td>
                      <td className="px-4 py-3 font-mono text-xs">{pct}%</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            session.status === "COMPLETED"
                              ? "badge-success"
                              : "badge-warning"
                          }
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs font-mono">
                        {session.completedAt
                          ? new Date(session.completedAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
