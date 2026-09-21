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
      setError("Enter both session code and your name.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode: sessionCode.trim().toUpperCase(), studentName: studentName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to join."); return; }
      localStorage.setItem("vivaSessionId", data.id);
      router.push(`/viva/exam/${data.id}`);
    } catch {
      setError("Failed to join session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <span className="font-semibold">VivaAI</span>
          </div>
          <h1 className="text-xl font-semibold">Join viva session</h1>
          <p className="text-text-secondary text-sm mt-1">Enter your session details to begin</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="label">Session code</label>
            <input
              type="text"
              className="input text-center text-lg font-mono tracking-[0.2em] uppercase"
              placeholder="ABCD1234"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
          </div>
          <div>
            <label className="label">Your name</label>
            <input
              type="text"
              className="input"
              placeholder="Enter your full name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-error-muted border border-error/20 rounded p-3">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Joining..." : "Start viva"}
          </button>
        </form>

        <p className="text-center text-2xs text-text-muted mt-6">Ask your teacher for the session code</p>
      </div>
    </div>
  );
}
