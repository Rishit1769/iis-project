"use client";

import { useEffect, useState } from "react";

interface Viva {
  id: string;
  title: string;
  sessionCode: string;
  sessions: Array<{
    id: string;
    studentName: string;
    totalScore: number;
    maxScore: number;
    status: string;
    completedAt: string | null;
  }>;
  experiment: { title: string };
  createdAt: string;
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
            (acc: number, v: Viva) => acc + v.sessions.length,
            0
          );
          const completed = data.reduce(
            (acc: number, v: Viva) =>
              acc + v.sessions.filter((s) => s.status === "COMPLETED").length,
            0
          );
          const totalScore = data.reduce(
            (acc: number, v: Viva) =>
              acc +
              v.sessions
                .filter((s) => s.status === "COMPLETED")
                .reduce(
                  (sacc: number, s) =>
                    sacc + (s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0),
                  0
                ),
            0
          );
          setStats({
            totalVivas: data.length,
            studentsAssessed: totalSessions,
            completedVivas: completed,
            averageScore:
              completed > 0 ? Math.round(totalScore / completed) : 0,
          });
        }
      })
      .catch(console.error);
  }, []);

  const recentSessions = vivas
    .flatMap((v) =>
      v.sessions.map((s) => ({
        ...s,
        experiment: v.experiment.title,
        vivaTitle: v.title,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt || "").getTime() -
        new Date(a.completedAt || "").getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Overview of your viva examination system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Vivas", value: stats.totalVivas, color: "text-[var(--primary)]" },
          { label: "Students Assessed", value: stats.studentsAssessed, color: "text-[var(--foreground)]" },
          { label: "Completed Vivas", value: stats.completedVivas, color: "text-green-600" },
          { label: "Average Score", value: `${stats.averageScore}%`, color: "text-[var(--primary)]" },
        ].map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Recent Viva Sessions
        </h2>
        {recentSessions.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-sm">
            No sessions yet. Create a viva to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">Experiment</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => {
                  const pct =
                    session.maxScore > 0
                      ? Math.round(
                          (session.totalScore / session.maxScore) * 100
                        )
                      : 0;
                  return (
                    <tr
                      key={session.id}
                      className="border-b border-[var(--border)] last:border-0"
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
                          className={
                            session.status === "COMPLETED"
                              ? "badge-success"
                              : session.status === "ACTIVE"
                              ? "badge-warning"
                              : "badge-neutral"
                          }
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--muted-foreground)]">
                        {session.completedAt
                          ? new Date(session.completedAt).toLocaleDateString()
                          : "In progress"}
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
