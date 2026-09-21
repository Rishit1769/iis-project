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
        <div className="font-mono text-xs uppercase tracking-widest animate-pulse-slow">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest mb-4">
            Examinations
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            My Vivas
          </h1>
        </div>
        <Link href="/dashboard/create" className="btn-primary text-xs">
          + New Viva
        </Link>
      </div>

      <div className="rule-ultra" />

      {vivas.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-body text-[#525252] mb-4">
            No vivas created yet.
          </p>
          <Link
            href="/dashboard/create"
            className="font-mono text-xs uppercase tracking-widest underline underline-offset-4 hover:no-underline"
          >
            Create your first viva
          </Link>
        </div>
      ) : (
        <div className="space-y-0">
          {vivas.map((viva) => {
            const completedSessions = viva.sessions.filter(
              (s) => s.status === "COMPLETED"
            ).length;
            return (
              <div key={viva.id} className="border border-black p-6 mb-0 last:mb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/dashboard/vivas/${viva.id}`}
                      className="font-display text-xl font-bold hover:underline underline-offset-4 transition-all duration-100"
                    >
                      {viva.title}
                    </Link>
                    <p className="font-body text-sm text-[#525252] mt-1">
                      {viva.experiment.title}
                    </p>
                    <div className="flex items-center gap-6 mt-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        {viva.totalQuestions} questions
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        {viva.difficulty}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        {completedSessions}/{viva.sessions.length} completed
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest bg-black text-white px-2 py-0.5">
                        {viva.sessionCode}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/viva"
                      target="_blank"
                      className="btn-ghost text-[10px]"
                    >
                      Student View →
                    </Link>
                    <button
                      onClick={() => handleDelete(viva.id)}
                      className="btn-ghost text-[10px] text-[#525252] hover:text-black"
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
