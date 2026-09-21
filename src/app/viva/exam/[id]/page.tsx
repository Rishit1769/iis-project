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
  totalScore: number;
  maxScore: number;
  viva: {
    title: string;
    experiment: { title: string };
  };
  questions: Array<{
    id: string;
    questionNumber: number;
    text: string;
    answer: { score: number; maxScore: number } | null;
  }>;
}

export default function VivaExamPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionData | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<
    "loading" | "question" | "submitting" | "next" | "complete" | "error"
  >("loading");
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
      const res = await fetch(`/api/sessions/${sessionId}/next-question`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate question");
      }
      const q = await res.json();
      setCurrentQuestion(q);
      setPhase("question");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate question."
      );
      setPhase("error");
    }
  }, [sessionId]);

  useEffect(() => {
    const init = async () => {
      const data = await fetchSession();
      if (!data) return;

      if (data.status === "COMPLETED") {
        router.push(`/viva/report/${sessionId}`);
        return;
      }

      if (data.currentQuestion > data.totalQuestions) {
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
        body: JSON.stringify({
          questionId: currentQuestion.questionId,
          answer: answer.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit answer");
      }

      const result = await res.json();

      setAnswer("");
      setCurrentQuestion(null);
      setPhase("next");

      setTimeout(async () => {
        if (result.isComplete) {
          router.push(`/viva/report/${sessionId}`);
        } else {
          await fetchSession();
          await generateNextQuestion();
        }
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit answer."
      );
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="font-mono text-xs uppercase tracking-widest animate-pulse-slow">
          Loading examination...
        </div>
      </div>
    );
  }

  if (error && phase === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md border border-black p-8 text-center space-y-6">
          <p className="font-mono text-xs uppercase tracking-widest">Error</p>
          <div className="rule-thin" />
          <p className="font-body text-[#525252]">{error}</p>
          <button
            onClick={() => {
              setError("");
              setPhase("loading");
              generateNextQuestion();
            }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const progress = session
    ? ((session.currentQuestion - 1) / session.totalQuestions) * 100
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-lg font-bold tracking-tight">
            AI Viva Examiner
          </h1>
          {session && (
            <span className="font-mono text-[10px] uppercase tracking-widest">
              {session.studentName}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        {session && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-xl font-bold">
                {session.viva.experiment.title}
              </p>
              <span className="font-mono text-xs">
                {currentQuestion?.questionNumber || session.currentQuestion} /{" "}
                {session.totalQuestions}
              </span>
            </div>
            <div className="w-full h-1 bg-[#E5E5E5]">
              <div
                className="h-1 bg-black transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Loading state */}
        {(phase === "loading" || phase === "next") && (
          <div className="py-24 text-center">
            {phase === "next" && (
              <p className="font-mono text-xs uppercase tracking-widest mb-4 text-[#525252]">
                Answer recorded.
              </p>
            )}
            <div className="font-mono text-xs uppercase tracking-widest animate-pulse-slow">
              Examiner is preparing your question...
            </div>
          </div>
        )}

        {/* Submitting */}
        {phase === "submitting" && (
          <div className="py-24 text-center">
            <div className="font-mono text-xs uppercase tracking-widest animate-pulse-slow">
              Recording answer...
            </div>
          </div>
        )}

        {/* Question */}
        {phase === "question" && currentQuestion && (
          <div className="space-y-8">
            {/* Question */}
            <div className="border border-black p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-0.5">
                  {currentQuestion.type?.replace(/_/g, " ") || "Question"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">
                  {currentQuestion.difficulty}
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-3">
                Examiner Question
              </p>
              <p className="font-display text-xl md:text-2xl font-bold leading-snug">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer */}
            <div className="border border-black p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest mb-4">
                Your Answer
              </p>
              <textarea
                className="input-full min-h-[160px] resize-y font-body"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                className="btn-primary px-12"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitting}
              >
                Submit Answer →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
