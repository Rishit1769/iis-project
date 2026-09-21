"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<"checking" | "connected" | "unavailable">("checking");

  useEffect(() => {
    fetch("/api/ai/health")
      .then((r) => r.json())
      .then((data) => setAiStatus(data.status === "connected" ? "connected" : "unavailable"))
      .catch(() => setAiStatus("unavailable"));
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">System configuration</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-semibold">AI Gateway</h2>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${aiStatus === "connected" ? "bg-success" : aiStatus === "checking" ? "bg-warning animate-pulse-subtle" : "bg-error"}`} />
          <span className="text-sm">{aiStatus === "connected" ? "Connected" : aiStatus === "checking" ? "Checking..." : "Unavailable"}</span>
        </div>
        <div className="text-xs text-text-muted space-y-1 font-mono">
          <p>Base URL: https://ai.tcetcercd.in/v1</p>
          <p>Model: qwen3.6</p>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-semibold">System</h2>
        <div className="text-xs text-text-muted space-y-1 font-mono">
          <p>Database: MySQL</p>
          <p>Framework: Next.js 14</p>
          <p>ORM: Prisma</p>
          <p>PDF Processing: Text extraction only</p>
        </div>
      </div>
    </div>
  );
}
