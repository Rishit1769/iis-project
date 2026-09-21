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
                    sacc +
                    (s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0),
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
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt || "").getTime() -
        new Date(a.completedAt || "").getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-4">
          Overview
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Dashboard
        </h1>
      </div>

      <div className="rule-ultra" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        {[
          { label: "Total Vivas", value: stats.totalVivas },
          { label: "Students Assessed", value: stats.studentsAssessed },
          { label: "Completed", value: stats.completedVivas },
          { label: "Average Score", value: `${stats.averageScore}%` },
        ].map((card, i) => (
          <div
            key={card.label}
            className={`p-8 border border-black ${i > 0 ? "md:border-l-0" : ""}`}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">
              {card.label}
            </p>
            <p className="font-display text-4xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-xs uppercase tracking-widest">
            Recent Viva Sessions
          </p>
        </div>
        <div className="rule-thick mb-6" />

        {recentSessions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-body text-[#525252]">
              No sessions yet. Create a viva to get started.
            </p>
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
                      className="border-b border-[#E5E5E5] last:border-0 hover:bg-black/[0.02] transition-colors duration-100"
                    >
                      <td className="px-6 py-4 font-body font-medium">
                        {session.studentName}
                      </td>
                      <td className="px-6 py-4 font-body text-[#525252]">
                        {session.experiment}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {pct}%
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            session.status === "COMPLETED"
                              ? "badge-success"
                              : "badge-neutral"
                          }
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#525252]">
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
