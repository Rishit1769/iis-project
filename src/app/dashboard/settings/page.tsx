"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<
    "checking" | "connected" | "unavailable"
  >("checking");

  useEffect(() => {
    fetch("/api/ai/health")
      .then((r) => r.json())
      .then((data) => {
        setAiStatus(data.status === "connected" ? "connected" : "unavailable");
      })
      .catch(() => setAiStatus("unavailable"));
  }, []);

  return (
    <div className="max-w-2xl space-y-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-4">
          Configuration
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Settings
        </h1>
      </div>

      <div className="rule-ultra" />

      {/* AI Gateway */}
      <div className="border border-black p-8">
        <p className="font-mono text-xs uppercase tracking-widest mb-6">
          AI Gateway
        </p>
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-3 h-3 ${
              aiStatus === "connected"
                ? "bg-black"
                : aiStatus === "checking"
                ? "bg-[#525252] animate-pulse-slow"
                : "bg-black"
            }`}
          />
          <span className="font-body text-sm">
            {aiStatus === "connected"
              ? "Connected"
              : aiStatus === "checking"
              ? "Checking..."
              : "Unavailable"}
          </span>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs text-[#525252]">
            Base URL: https://ai.tcetcercd.in/v1
          </p>
          <p className="font-mono text-xs text-[#525252]">
            Model: qwen3.6
          </p>
        </div>
      </div>

      {/* System Info */}
      <div className="border border-black p-8">
        <p className="font-mono text-xs uppercase tracking-widest mb-6">
          System Information
        </p>
        <div className="space-y-2">
          <p className="font-mono text-xs text-[#525252]">
            Database: MySQL
          </p>
          <p className="font-mono text-xs text-[#525252]">
            Framework: Next.js 14
          </p>
          <p className="font-mono text-xs text-[#525252]">
            ORM: Prisma
          </p>
          <p className="font-mono text-xs text-[#525252]">
            PDF Processing: Text extraction only
          </p>
        </div>
      </div>
    </div>
  );
}
