"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<"checking" | "connected" | "unavailable">("checking");

  useEffect(() => {
    fetch("/api/ai/health")
      .then((r) => r.json())
      .then((data) => {
        setAiStatus(data.status === "connected" ? "connected" : "unavailable");
      })
      .catch(() => setAiStatus("unavailable"));
  }, []);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          System configuration and status
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">AI Gateway</h2>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              aiStatus === "connected"
                ? "bg-green-500"
                : aiStatus === "checking"
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            {aiStatus === "connected"
              ? "AI Gateway Connected"
              : aiStatus === "checking"
              ? "Checking connection..."
              : "AI Gateway Unavailable"}
          </span>
        </div>
        <div className="text-sm text-[var(--muted-foreground)] space-y-1">
          <p>Base URL: https://ai.tcetcercd.in/v1</p>
          <p>Model: qwen3.6</p>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">System Information</h2>
        <div className="text-sm text-[var(--muted-foreground)] space-y-1">
          <p>Database: MySQL</p>
          <p>Framework: Next.js</p>
          <p>ORM: Prisma</p>
          <p>PDF Processing: Text extraction only (no OCR)</p>
        </div>
      </div>
    </div>
  );
}
