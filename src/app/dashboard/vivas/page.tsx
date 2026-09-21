"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Viva {
  id: string;
  title: string;
  sessionCode: string;
  totalQuestions: number;
  difficulty: string;
  adaptiveMode: boolean;
  createdAt: string;
  experiment: { title: string };
  sessions: Array<{
    id: string;
    studentName: string;
    status: string;
    totalScore: number;
    maxScore: number;
  }>;
}

export default function MyVivasPage() {
  const [vivas, setVivas] = useState<Viva[]>([]);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this viva?")) return;
    await fetch(`/api/vivas/${id}`, { method: "DELETE" });
    setVivas((prev) => prev.filter((v) => v.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted-foreground)]">Loading vivas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            My Vivas
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage your viva examinations
          </p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          + New Viva
        </Link>
      </div>

      {vivas.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--muted-foreground)]">
            No vivas created yet.
          </p>
          <Link
            href="/dashboard/create"
            className="text-[var(--primary)] text-sm mt-2 inline-block hover:underline"
          >
            Create your first viva
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vivas.map((viva) => {
            const completedSessions = viva.sessions.filter(
              (s) => s.status === "COMPLETED"
            ).length;
            return (
              <div key={viva.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/dashboard/vivas/${viva.id}`}
                      className="text-lg font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                    >
                      {viva.title}
                    </Link>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {viva.experiment.title}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted-foreground)]">
                      <span>{viva.totalQuestions} questions</span>
                      <span className="capitalize">{viva.difficulty}</span>
                      <span>
                        {completedSessions}/{viva.sessions.length} completed
                      </span>
                      <span className="font-mono bg-[var(--secondary)] px-2 py-0.5 rounded">
                        {viva.sessionCode}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/viva"
                      target="_blank"
                      className="btn-ghost text-xs"
                    >
                      Student View
                    </Link>
                    <button
                      onClick={() => handleDelete(viva.id)}
                      className="btn-ghost text-xs text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
