"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const QUESTION_TYPES = [
  "conceptual",
  "definition",
  "procedure",
  "observation",
  "calculation",
  "application",
  "troubleshooting",
  "experimental_reasoning",
];

export default function CreateVivaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [experimentId, setExperimentId] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("adaptive");
  const [passingScore, setPassingScore] = useState(50);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [questionTypes, setQuestionTypes] = useState<string[]>([
    "conceptual",
    "procedure",
    "calculation",
    "application",
  ]);

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "extracting" | "ready" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadStatus("error");
      setUploadMessage("Only PDF files are allowed.");
      return;
    }

    setSelectedFile(file);
    setUploadStatus("uploading");
    setUploadMessage("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatus("extracting");
      setUploadMessage("Extracting text...");

      const res = await fetch(`/api/experiments/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadStatus("error");
        setUploadMessage(data.error || "Upload failed.");
        return;
      }

      setExperimentId(data.experiment.id);
      setTitle(data.experiment.title);
      setUploadStatus("ready");
      setUploadMessage(
        `✓ PDF uploaded\n✓ Text extracted (${data.experiment.textLength} chars)\n✓ Experiment ready`
      );
    } catch {
      setUploadStatus("error");
      setUploadMessage("Upload failed. Please try again.");
    }
  }, []);

  const handleCreateViva = async () => {
    if (!title || !experimentId) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/vivas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          experimentId,
          totalQuestions,
          difficulty,
          passingScore,
          adaptiveMode,
          questionTypes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create viva.");
        return;
      }

      const viva = await res.json();
      router.push(`/dashboard/vivas/${viva.id}`);
    } catch {
      alert("Failed to create viva.");
    }
  };

  const toggleQuestionType = (type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleSeedDemo = async () => {
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setExperimentId(data.experiment.id);
        setTitle("Study of Half-Wave Rectifier");
        setUploadStatus("ready");
        setUploadMessage("✓ Demo experiment loaded\n✓ Text pre-extracted\n✓ Experiment ready");
        setSelectedFile(null);
      }
    } catch {
      alert("Failed to load demo experiment.");
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Create New Viva
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Configure a new laboratory viva examination
        </p>
      </div>

      <div className="card space-y-6">
        <div className="space-y-2">
          <label className="label">Experiment Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Study of Half-Wave Rectifier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label">Upload Experiment PDF *</label>
            <button
              type="button"
              onClick={handleSeedDemo}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              Load Demo Experiment
            </button>
          </div>
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:border-[var(--primary)] transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFileChange(file);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />
            {selectedFile && (
              <div className="mb-3">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            )}
            {!selectedFile && (
              <div>
                <svg
                  className="w-12 h-12 mx-auto text-[var(--muted-foreground)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Drag and drop a PDF here, or click to select
                </p>
              </div>
            )}
          </div>
          {uploadMessage && (
            <div
              className={`text-sm whitespace-pre-line mt-2 ${
                uploadStatus === "error"
                  ? "text-red-600"
                  : uploadStatus === "ready"
                  ? "text-green-600"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {uploadStatus === "uploading" || uploadStatus === "extracting" ? (
                <span className="animate-pulse-slow">{uploadMessage}</span>
              ) : (
                uploadMessage
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="label">Number of Questions</label>
            <select
              className="input"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="label">Difficulty</label>
            <select
              className="input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="adaptive">Adaptive</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="label">Passing Score (%)</label>
            <input
              type="number"
              className="input"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="label">Adaptive Questioning</label>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setAdaptiveMode(!adaptiveMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  adaptiveMode ? "bg-[var(--primary)]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    adaptiveMode ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                {adaptiveMode ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">Question Types</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleQuestionType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  questionTypes.includes(type)
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {type.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            className="btn-secondary"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreateViva}
            disabled={!title || !experimentId || uploadStatus !== "ready"}
          >
            Create Viva
          </button>
        </div>
      </div>
    </div>
  );
}
