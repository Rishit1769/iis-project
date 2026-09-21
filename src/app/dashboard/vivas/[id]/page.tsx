"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface VivaDetail {
  id: string;
  title: string;
  sessionCode: string;
  totalQuestions: number;
  difficulty: string;
  passingScore: number;
  experiment: { id: string; title: string };
  sessions: Array<{
    id: string;
    studentName: string;
    status: string;
    totalScore: number;
    maxScore: number;
    currentQuestion: number;
    questions: Array<{
      id: string;
      questionNumber: number;
      text: string;
      topic: string;
      difficulty: string;
      type: string;
      answer: { answerText: string; score: number; maxScore: number; correctness: string; strengths: string; weaknesses: string } | null;
    }>;
  }>;
}

export default function VivaDetailPage() {
  const params = useParams();
  const [viva, setViva] = useState<VivaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/vivas/${params.id}`)
      .then((r) => r.json())
      .then((data) => { if (data.id) setViva(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-text-muted text-sm py-20 text-center">Loading...</div>;
  if (!viva) return <div className="text-text-muted text-sm py-20 text-center">Viva not found.</div>;

  const selectedSessionData = viva.sessions.find((s) => s.id === selectedSession);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/dashboard/vivas" className="text-2xs text-text-muted hover:text-text-secondary transition-colors">← Back to vivas</Link>
        <h1 className="text-2xl font-semibold mt-2">{viva.title}</h1>
        <p className="text-text-secondary text-sm mt-1">{viva.experiment.title}</p>
      </div>

      {/* Session Code */}
      <div className="inline-flex items-center gap-3 bg-bg-elevated border border-border rounded-lg px-4 py-3">
        <span className="text-2xs text-text-muted uppercase tracking-wider">Session code</span>
        <span className="font-mono text-lg font-semibold">{viva.sessionCode}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Questions", value: viva.totalQuestions },
          { label: "Completed", value: viva.sessions.filter((s) => s.status === "COMPLETED").length },
          { label: "Difficulty", value: viva.difficulty },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className="text-2xs text-text-muted uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-semibold mt-1 capitalize">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sessions + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-medium text-text-secondary">Sessions</p>
          {viva.sessions.length === 0 ? (
            <div className="card text-center py-8"><p className="text-text-muted text-xs">No sessions yet</p></div>
          ) : (
            viva.sessions.map((session) => {
              const pct = session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0;
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSession === session.id ? "border-accent bg-accent-muted" : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{session.studentName}</span>
                    <span className={session.status === "COMPLETED" ? "badge-success" : "badge-warning"}>{session.status}</span>
                  </div>
                  {session.status === "COMPLETED" && (
                    <p className="text-2xs text-text-muted font-mono mt-1">{pct}% — {session.totalScore}/{session.maxScore}</p>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedSessionData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-text-secondary">{selectedSessionData.studentName}&apos;s answers</p>
                {selectedSessionData.status === "COMPLETED" && (
                  <Link href={`/viva/report/${selectedSessionData.id}`} target="_blank" className="btn-primary text-2xs py-1 px-3">Full report</Link>
                )}
              </div>
              {selectedSessionData.questions.map((q) => (
                <div key={q.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xs text-text-muted font-mono">Q{q.questionNumber}</span>
                    {q.answer && <span className="text-xs font-mono font-medium">{q.answer.score}/{q.answer.maxScore}</span>}
                  </div>
                  <p className="text-sm font-medium mb-2">{q.text}</p>
                  {q.answer ? (
                    <div className="text-xs space-y-1.5 text-text-secondary">
                      <p className="text-text">{q.answer.answerText}</p>
                      <p className="font-mono text-2xs">{q.answer.correctness.replace(/_/g, " ")}</p>
                      {q.answer.strengths !== "[]" && <p><span className="text-success">✓</span> {JSON.parse(q.answer.strengths).join(", ")}</p>}
                      {q.answer.weaknesses !== "[]" && <p><span className="text-warning">!</span> {JSON.parse(q.answer.weaknesses).join(", ")}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic">Awaiting answer</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-16"><p className="text-text-muted text-sm">Select a session to view details</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
