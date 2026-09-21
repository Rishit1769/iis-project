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
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            AI Viva Examiner
          </h1>
          <div className="rule-thick w-12 mx-auto my-6" />
          <p className="font-body text-[#525252]">
            Enter your session details to begin
          </p>
        </div>

        <div className="border border-black p-8">
          <form onSubmit={handleJoin} className="space-y-8">
            <div>
              <label className="label">Session Code</label>
              <input
                type="text"
                className="input-full text-center text-2xl tracking-[0.3em] font-mono uppercase"
                placeholder="ABCD1234"
                value={sessionCode}
                onChange={(e) =>
                  setSessionCode(e.target.value.toUpperCase())
                }
                maxLength={8}
              />
            </div>

            <div>
              <label className="label">Your Name</label>
              <input
                type="text"
                className="input-full"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            {error && (
              <div className="border-2 border-black p-4 bg-black text-white">
                <p className="font-mono text-xs uppercase tracking-wider">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Joining..." : "Start Viva →"}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-8">
          Ask your teacher for the session code
        </p>
      </div>
    </div>
  );
}
