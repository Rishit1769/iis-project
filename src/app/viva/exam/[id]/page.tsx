"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface QuestionData {
  questionId: string;
  questionNumber: number;
  question: string;
  topic: string;
  difficulty: string;
  type: string;
  totalQuestions: number;
}

interface SessionData {
  id: string;
  studentName: string;
  status: string;
  currentQuestion: number;
  totalQuestions: number;
  viva: { title: string; experiment: { title: string } };
  questions: Array<{ id: string; questionNumber: number; text: string; answer: { score: number; maxScore: number } | null }>;
}

export default function VivaExamPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"loading" | "question" | "submitting" | "next" | "error">("loading");
  const [error, setError] = useState("");

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Session not found");
      const data = await res.json();
      setSession(data);
      return data;
    } catch {
      setError("Session not found or expired.");
      return null;
    }
  }, [sessionId]);

  const generateNextQuestion = useCallback(async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/next-question`, { method: "POST" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      const q = await res.json();
      setCurrentQuestion(q);
      setPhase("question");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate question.");
      setPhase("error");
    }
  }, [sessionId]);

  useEffect(() => {
    const init = async () => {
      const data = await fetchSession();
      if (!data) return;
      if (data.status === "COMPLETED" || data.currentQuestion > data.totalQuestions) {
        router.push(`/viva/report/${sessionId}`);
        return;
      }
      await generateNextQuestion();
      setLoading(false);
    };
    init();
  }, [sessionId, router, fetchSession, generateNextQuestion]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return;
    setSubmitting(true);
    setPhase("submitting");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.questionId, answer: answer.trim() }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      const result = await res.json();
      setAnswer("");
      setCurrentQuestion(null);
      setPhase("next");
      setTimeout(async () => {
        if (result.isComplete) router.push(`/viva/report/${sessionId}`);
        else { await fetchSession(); await generateNextQuestion(); }
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit.");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !session) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted text-sm">Loading...</div>;

  if (error && phase === "error") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="w-full max-w-sm card text-center space-y-4">
          <p className="text-sm text-text-muted">{error}</p>
          <button onClick={() => { setError(""); setPhase("loading"); generateNextQuestion(); }} className="btn-primary text-sm">Try again</button>
        </div>
      </div>
    );
  }

  const progress = session ? ((session.currentQuestion - 1) / session.totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <div className="border-b border-border bg-bg-secondary">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">V</span>
            </div>
            <span className="text-sm font-medium">VivaAI</span>
          </div>
          {session && (
            <div className="flex items-center gap-4 text-2xs text-text-muted">
              <span>{session.studentName}</span>
              <span className="font-mono">{session.currentQuestion}/{session.totalQuestions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {session && (
        <div className="h-0.5 bg-bg-elevated">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Loading/next state */}
        {(phase === "loading" || phase === "next") && (
          <div className="py-24 text-center">
            {phase === "next" && <p className="text-sm text-success mb-3">Answer recorded.</p>}
            <p className="text-sm text-text-muted animate-pulse-subtle">Preparing next question...</p>
          </div>
        )}

        {/* Submitting */}
        {phase === "submitting" && (
          <div className="py-24 text-center">
            <p className="text-sm text-text-muted animate-pulse-subtle">Evaluating answer...</p>
          </div>
        )}

        {/* Question */}
        {phase === "question" && currentQuestion && (
          <div className="space-y-6">
            {/* Question header */}
            <div className="flex items-center gap-3 text-2xs text-text-muted font-mono">
              <span className="badge-accent">{currentQuestion.type?.replace(/_/g, " ")}</span>
              <span>{currentQuestion.difficulty}</span>
              <span>Q{currentQuestion.questionNumber} of {currentQuestion.totalQuestions}</span>
            </div>

            {/* Question text */}
            <div>
              <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
            </div>

            <div className="divider" />

            {/* Answer input */}
            <div>
              <label className="label">Your answer</label>
              <textarea
                className="input min-h-[140px] resize-y"
                placeholder="Explain your answer as you would during an actual viva..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <p className="text-2xs text-text-muted font-mono">⌘ + Enter to submit</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAnswer(""); }}
                  className="btn-ghost text-sm"
                  disabled={submitting}
                >
                  Clear
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || submitting}
                >
                  Submit answer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
