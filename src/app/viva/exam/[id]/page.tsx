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
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
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

      if (
        data.questions.length > 0 &&
        !data.questions[data.questions.length - 1].answer
      ) {
        setCurrentQuestion({
          questionId: data.questions[data.questions.length - 1].id,
          questionNumber: data.questions[data.questions.length - 1].questionNumber,
          question: data.questions[data.questions.length - 1].text,
          topic: "",
          difficulty: "",
          type: "",
          totalQuestions: data.totalQuestions,
        });
        setPhase("question");
      } else {
        await generateNextQuestion();
      }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse-slow text-lg text-[var(--muted-foreground)]">
            Loading examination...
          </div>
        </div>
      </div>
    );
  }

  if (error && phase === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center space-y-4">
          <div className="text-red-600 text-lg font-medium">Error</div>
          <p className="text-[var(--muted-foreground)]">{error}</p>
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
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-[var(--primary)]">
            AI Viva Examiner
          </h1>
        </div>
        {session && (
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {session.viva.experiment.title}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {session.studentName} &middot; Question{" "}
              {currentQuestion?.questionNumber || session.currentQuestion} of{" "}
              {session.totalQuestions}
            </p>
          </div>
        )}

        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {phase === "loading" && (
          <div className="card text-center py-16">
            <div className="animate-pulse-slow text-[var(--muted-foreground)]">
              Examiner is preparing your question...
            </div>
          </div>
        )}

        {phase === "submitting" && (
          <div className="card text-center py-16">
            <div className="animate-pulse-slow text-[var(--muted-foreground)]">
              Recording answer...
            </div>
          </div>
        )}

        {phase === "next" && (
          <div className="card text-center py-16">
            <div className="text-green-600 font-medium mb-2">
              Answer recorded.
            </div>
            <div className="animate-pulse-slow text-[var(--muted-foreground)]">
              Examiner is preparing the next question...
            </div>
          </div>
        )}

        {phase === "question" && currentQuestion && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-info capitalize">
                  {currentQuestion.type?.replace(/_/g, " ") || "Question"}
                </span>
                <span className="badge-neutral capitalize">
                  {currentQuestion.difficulty}
                </span>
              </div>
              <div className="space-y-1 mb-2">
                <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide">
                  Examiner Question
                </span>
              </div>
              <p className="text-lg text-[var(--foreground)] leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            <div className="card">
              <div className="space-y-1 mb-3">
                <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide">
                  Your Answer
                </span>
              </div>
              <textarea
                className="input min-h-[160px] resize-y"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="text-center">
              <button
                className="btn-primary px-8 py-3 text-base"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitting}
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="card text-center py-16">
            <div className="text-lg font-medium text-[var(--foreground)] mb-2">
              Examination Complete
            </div>
            <p className="text-[var(--muted-foreground)]">
              Preparing your assessment report...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
