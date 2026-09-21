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
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
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
        setUploadMessage(
          "✓ Demo experiment loaded\n✓ Text pre-extracted\n✓ Experiment ready"
        );
        setSelectedFile(null);
      }
    } catch {
      alert("Failed to load demo experiment.");
    }
  };

  return (
    <div className="max-w-3xl space-y-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-4">
          New Examination
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Create Viva
        </h1>
      </div>

      <div className="rule-ultra" />

      <div className="space-y-12">
        {/* Experiment Name */}
        <div>
          <label className="label">Experiment Name</label>
          <input
            type="text"
            className="input-full"
            placeholder="e.g. Study of Half-Wave Rectifier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* PDF Upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Upload Experiment PDF</label>
            <button
              type="button"
              onClick={handleSeedDemo}
              className="font-mono text-[10px] uppercase tracking-widest text-[#525252] hover:text-black underline underline-offset-4 transition-colors duration-100"
            >
              Load Demo
            </button>
          </div>
          <div
            className="border-2 border-dashed border-black p-12 text-center hover:bg-black hover:text-white transition-colors duration-100 cursor-pointer"
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
            {selectedFile ? (
              <div>
                <p className="font-body font-medium">{selectedFile.name}</p>
                <p className="font-mono text-xs mt-1 opacity-60">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest">
                  Drag and drop a PDF here
                </p>
                <p className="font-body text-sm mt-2 opacity-60">
                  or click to select
                </p>
              </div>
            )}
          </div>
          {uploadMessage && (
            <div
              className={`mt-4 p-4 border text-sm whitespace-pre-line font-mono ${
                uploadStatus === "error"
                  ? "border-black bg-black text-white"
                  : uploadStatus === "ready"
                  ? "border-black"
                  : "border-[#E5E5E5]"
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

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="label">Number of Questions</label>
            <select
              className="input-full"
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

          <div>
            <label className="label">Difficulty</label>
            <select
              className="input-full"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="adaptive">Adaptive</option>
            </select>
          </div>

          <div>
            <label className="label">Passing Score (%)</label>
            <input
              type="number"
              className="input-full"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label">Adaptive Questioning</label>
            <button
              type="button"
              onClick={() => setAdaptiveMode(!adaptiveMode)}
              className={`mt-2 w-full py-3 border-2 border-black font-mono text-xs uppercase tracking-widest transition-colors duration-100 ${
                adaptiveMode
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {adaptiveMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Question Types */}
        <div>
          <label className="label">Question Types</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleQuestionType(type)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border border-black transition-colors duration-100 ${
                  questionTypes.includes(type)
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black/[0.05]"
                }`}
              >
                {type.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="rule-thick pt-8" />
        <div className="flex justify-end gap-4">
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
            Create Viva →
          </button>
        </div>
      </div>
    </div>
  );
}
