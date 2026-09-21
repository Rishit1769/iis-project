"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VivaJoinPage() {
  const router = useRouter();
  const [sessionCode, setSessionCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!sessionCode.trim() || !studentName.trim()) {
      setError("Please enter both the session code and your name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionCode: sessionCode.trim().toUpperCase(),
          studentName: studentName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join session.");
        return;
      }

      localStorage.setItem("vivaSessionId", data.id);
      router.push(`/viva/exam/${data.id}`);
    } catch {
      setError("Failed to join session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--primary)]">
            AI Viva Examiner
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Enter your session details to begin the examination
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label className="label">Session Code</label>
              <input
                type="text"
                className="input text-center text-lg tracking-widest uppercase font-mono"
                placeholder="ABCD1234"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="label">Your Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Joining..." : "Start Viva"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          Ask your teacher for the session code
        </p>
      </div>
    </div>
  );
}
