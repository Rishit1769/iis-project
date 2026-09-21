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
      answer: {
        answerText: string;
        score: number;
        maxScore: number;
        correctness: string;
        strengths: string;
        weaknesses: string;
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
        <div className="font-mono text-xs uppercase tracking-widest animate-pulse-slow">
          Loading...
        </div>
      </div>
    );
  }

  if (!viva) {
    return (
      <div className="py-24 text-center">
        <p className="font-body text-[#525252]">Viva not found.</p>
      </div>
    );
  }

  const selectedSessionData = viva.sessions.find(
    (s) => s.id === selectedSession
  );

  return (
    <div className="space-y-12">
      <div>
        <Link
          href="/dashboard/vivas"
          className="font-mono text-[10px] uppercase tracking-widest text-[#525252] hover:text-black underline underline-offset-4 hover:no-underline transition-colors duration-100"
        >
          ← Back to My Vivas
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-4">
          {viva.title}
        </h1>
        <p className="font-body text-lg text-[#525252] mt-2">
          {viva.experiment.title}
        </p>
      </div>

      <div className="rule-ultra" />

      {/* Session Code */}
      <div className="border border-black p-6 inline-block">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">
          Session Code
        </p>
        <p className="font-mono text-3xl font-bold tracking-widest">
          {viva.sessionCode}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-2">
          Share with students
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0">
        <div className="p-6 border border-black text-center">
          <p className="font-display text-3xl font-bold">
            {viva.totalQuestions}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest mt-1">
            Questions
          </p>
        </div>
        <div className="p-6 border border-black border-l-0 text-center">
          <p className="font-display text-3xl font-bold">
            {viva.sessions.filter((s) => s.status === "COMPLETED").length}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest mt-1">
            Completed
          </p>
        </div>
        <div className="p-6 border border-black border-l-0 text-center">
          <p className="font-display text-3xl font-bold capitalize">
            {viva.difficulty}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest mt-1">
            Difficulty
          </p>
        </div>
      </div>

      {/* Sessions + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <p className="font-mono text-xs uppercase tracking-widest mb-4">
            Student Sessions
          </p>
          <div className="rule-thin mb-4" />
          {viva.sessions.length === 0 ? (
            <div className="py-12 text-center border border-[#E5E5E5]">
              <p className="font-mono text-xs text-[#525252]">No sessions yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {viva.sessions.map((session) => {
                const pct =
                  session.maxScore > 0
                    ? Math.round(
                        (session.totalScore / session.maxScore) * 100
                      )
                    : 0;
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`w-full text-left p-4 border border-black transition-colors duration-100 ${
                      selectedSession === session.id
                        ? "bg-black text-white"
                        : "hover:bg-black/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-body font-medium text-sm">
                        {session.studentName}
                      </span>
                      <span
                        className={
                          session.status === "COMPLETED"
                            ? selectedSession === session.id
                              ? "badge-success bg-white text-black border-white"
                              : "badge-success"
                            : "badge-neutral"
                        }
                      >
                        {session.status}
                      </span>
                    </div>
                    {session.status === "COMPLETED" && (
                      <p className="font-mono text-xs mt-1 opacity-60">
                        Score: {pct}% ({session.totalScore}/{session.maxScore})
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedSessionData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest">
                  {selectedSessionData.studentName}&apos;s Assessment
                </p>
                {selectedSessionData.status === "COMPLETED" && (
                  <Link
                    href={`/viva/report/${selectedSessionData.id}`}
                    target="_blank"
                    className="btn-primary text-[10px]"
                  >
                    View Full Report →
                  </Link>
                )}
              </div>
              <div className="rule-thin" />

              <div className="space-y-4">
                {selectedSessionData.questions.map((q) => (
                  <div key={q.id} className="border border-black p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        Question {q.questionNumber}
                      </span>
                      {q.answer && (
                        <span className="font-mono text-sm font-bold">
                          {q.answer.score}/{q.answer.maxScore}
                        </span>
                      )}
                    </div>
                    <p className="font-body font-medium mb-3">{q.text}</p>
                    {q.answer ? (
                      <div className="space-y-2 text-sm">
                        <div className="border-t border-[#E5E5E5] pt-3">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">
                            Answer:{" "}
                          </span>
                          <span className="font-body">{q.answer.answerText}</span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">
                            Correctness:{" "}
                          </span>
                          <span className="font-mono text-xs uppercase">
                            {q.answer.correctness.replace(/_/g, " ")}
                          </span>
                        </div>
                        {q.answer.strengths !== "[]" && (
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest">
                              Strengths:{" "}
                            </span>
                            <span className="font-body text-sm">
                              {JSON.parse(q.answer.strengths).join(", ")}
                            </span>
                          </div>
                        )}
                        {q.answer.weaknesses !== "[]" && (
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">
                              Weaknesses:{" "}
                            </span>
                            <span className="font-body text-sm">
                              {JSON.parse(q.answer.weaknesses).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="font-body text-sm italic text-[#525252]">
                        Awaiting answer
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center border border-[#E5E5E5]">
              <p className="font-body text-[#525252]">
                Select a student session to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
