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
}

export default function ResultsPage() {
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vivas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const all = data.flatMap((v: { sessions: Array<SessionResult & { experiment?: unknown }>; experiment: { title: string } }) =>
            v.sessions.map((s) => ({ ...s, experiment: v.experiment.title }))
          ).filter((s: SessionResult) => s.status === "COMPLETED");
          setSessions(all);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-text-muted text-sm py-20 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="text-text-secondary text-sm mt-1">All completed viva sessions</p>
      </div>

      {sessions.length === 0 ? (
        <div className="card text-center py-12"><p className="text-text-muted text-sm">No completed sessions yet.</p></div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated border-b border-border">
                {["Student", "Experiment", "Score", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-2xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const pct = s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0;
                const passed = pct >= 50;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3 font-medium">{s.studentName}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{s.experiment}</td>
                    <td className="px-4 py-3 font-mono text-xs">{pct}%</td>
                    <td className="px-4 py-3"><span className={passed ? "badge-success" : "badge-error"}>{passed ? "Passed" : "Failed"}</span></td>
                    <td className="px-4 py-3 text-text-muted text-xs font-mono">{s.completedAt ? new Date(s.completedAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><Link href={`/viva/report/${s.id}`} target="_blank" className="text-accent text-xs hover:text-accent-hover">Report →</Link></td>
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
