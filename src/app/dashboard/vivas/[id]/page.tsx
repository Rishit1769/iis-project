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
  adaptiveMode: boolean;
  passingScore: number;
  questionTypes: string;
  experiment: { id: string; title: string; originalFileName: string };
  sessions: Array<{
    id: string;
    studentName: string;
    status: string;
    totalScore: number;
    maxScore: number;
    startedAt: string;
    completedAt: string | null;
    currentQuestion: number;
    questions: Array<{
      id: string;
      questionNumber: number;
      text: string;
      topic: string;
      difficulty: string;
      type: string;
      answer: {
        answerText: string;
        score: number;
        maxScore: number;
        correctness: string;
        strengths: string;
        weaknesses: string;
        missingConcepts: string;
      } | null;
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
      .then((data) => {
        if (data.id) setViva(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted-foreground)]">Loading...</div>
      </div>
    );
  }

  if (!viva) {
    return (
      <div className="card text-center py-12">
        <p className="text-[var(--muted-foreground)]">Viva not found.</p>
      </div>
    );
  }

  const completedSessions = viva.sessions.filter(
    (s) => s.status === "COMPLETED"
  );
  const activeSessions = viva.sessions.filter((s) => s.status === "ACTIVE");

  const selectedSessionData = viva.sessions.find(
    (s) => s.id === selectedSession
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/vivas"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          >
            ← Back to My Vivas
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mt-2">
            {viva.title}
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            {viva.experiment.title}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm bg-[var(--secondary)] px-3 py-1.5 rounded-lg">
            Session Code: {viva.sessionCode}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Share this code with students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-[var(--primary)]">
            {viva.totalQuestions}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">Questions</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{completedSessions.length}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">
            {activeSessions.length}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[var(--primary)] capitalize">
            {viva.difficulty}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">Difficulty</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Student Sessions</h2>
          {viva.sessions.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-sm text-[var(--muted-foreground)]">
                No sessions yet
              </p>
            </div>
          ) : (
            viva.sessions.map((session) => {
              const pct =
                session.maxScore > 0
                  ? Math.round((session.totalScore / session.maxScore) * 100)
                  : 0;
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`w-full card text-left transition-all ${
                    selectedSession === session.id
                      ? "ring-2 ring-[var(--primary)]"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{session.studentName}</span>
                    <span
                      className={
                        session.status === "COMPLETED"
                          ? "badge-success"
                          : "badge-warning"
                      }
                    >
                      {session.status}
                    </span>
                  </div>
                  {session.status === "COMPLETED" && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      Score: {pct}% ({session.totalScore}/{session.maxScore})
                    </p>
                  )}
                  {session.status === "ACTIVE" && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      Question {session.currentQuestion}/{viva.totalQuestions}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedSessionData ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {selectedSessionData.studentName}&apos;s Assessment
              </h2>
              {selectedSessionData.status === "COMPLETED" ? (
                <Link
                  href={`/viva/report/${selectedSessionData.id}`}
                  target="_blank"
                  className="btn-primary inline-block"
                >
                  View Full Report
                </Link>
              ) : null}
              <div className="space-y-3">
                {selectedSessionData.questions.map((q) => (
                  <div key={q.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--muted-foreground)]">
                        Question {q.questionNumber}
                      </span>
                      {q.answer && (
                        <span className="badge-info">
                          {q.answer.score}/{q.answer.maxScore}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-2">{q.text}</p>
                    {q.answer && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div>
                          <span className="text-[var(--muted-foreground)]">
                            Answer:{" "}
                          </span>
                          <span>{q.answer.answerText}</span>
                        </div>
                        <div>
                          <span className="text-[var(--muted-foreground)]">
                            Correctness:{" "}
                          </span>
                          <span className="capitalize">
                            {q.answer.correctness.replace(/_/g, " ")}
                          </span>
                        </div>
                        {q.answer.strengths !== "[]" && (
                          <div>
                            <span className="text-green-600">
                              Strengths:{" "}
                            </span>
                            <span>
                              {JSON.parse(q.answer.strengths).join(", ")}
                            </span>
                          </div>
                        )}
                        {q.answer.weaknesses !== "[]" && (
                          <div>
                            <span className="text-amber-600">
                              Weaknesses:{" "}
                            </span>
                            <span>
                              {JSON.parse(q.answer.weaknesses).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {!q.answer && (
                      <p className="text-sm text-[var(--muted-foreground)] italic">
                        Awaiting answer
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <p className="text-[var(--muted-foreground)]">
                Select a student session to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
