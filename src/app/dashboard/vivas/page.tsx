"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Viva {
  id: string;
  title: string;
  sessionCode: string;
  totalQuestions: number;
  difficulty: string;
  experiment: { title: string };
  sessions: Array<{ id: string; status: string }>;
}

export default function MyVivasPage() {
  const [vivas, setVivas] = useState<Viva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vivas")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setVivas(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this viva?")) return;
    await fetch(`/api/vivas/${id}`, { method: "DELETE" });
    setVivas((prev) => prev.filter((v) => v.id !== id));
  };

  if (loading) return <div className="text-text-muted text-sm py-20 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Vivas</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your viva examinations</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary text-xs">+ New Viva</Link>
      </div>

      {vivas.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-muted text-sm">No vivas created yet.</p>
          <Link href="/dashboard/create" className="text-accent text-sm mt-2 inline-block hover:text-accent-hover">Create your first viva</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vivas.map((viva) => {
            const completed = viva.sessions.filter((s) => s.status === "COMPLETED").length;
            return (
              <div key={viva.id} className="card flex items-center justify-between">
                <div className="min-w-0">
                  <Link href={`/dashboard/vivas/${viva.id}`} className="font-medium text-sm hover:text-accent transition-colors">
                    {viva.title}
                  </Link>
                  <p className="text-text-muted text-xs mt-0.5">{viva.experiment.title}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-2xs text-text-muted font-mono">{viva.totalQuestions}q</span>
                    <span className="text-2xs text-text-muted font-mono capitalize">{viva.difficulty}</span>
                    <span className="text-2xs text-text-muted font-mono">{completed}/{viva.sessions.length} done</span>
                    <span className="text-2xs font-mono bg-bg-elevated border border-border px-1.5 py-0.5 rounded">{viva.sessionCode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/viva" target="_blank" className="btn-ghost text-2xs">Student view</Link>
                  <button onClick={() => handleDelete(viva.id)} className="btn-ghost text-2xs text-error hover:text-error">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
