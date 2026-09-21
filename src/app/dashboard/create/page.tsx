"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const QUESTION_TYPES = [
  "conceptual", "definition", "procedure", "observation",
  "calculation", "application", "troubleshooting", "experimental_reasoning",
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
    "conceptual", "procedure", "calculation", "application",
  ]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "extracting" | "ready" | "error">("idle");
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
      const res = await fetch("/api/experiments/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadStatus("error");
        setUploadMessage(data.error || "Upload failed.");
        return;
      }
      setExperimentId(data.experiment.id);
      setTitle(data.experiment.title);
      setUploadStatus("ready");
      setUploadMessage(`PDF uploaded — ${data.experiment.textLength} characters extracted`);
    } catch {
      setUploadStatus("error");
      setUploadMessage("Upload failed. Please try again.");
    }
  }, []);

  const handleCreateViva = async () => {
    if (!title || !experimentId) return;
    try {
      const res = await fetch("/api/vivas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, experimentId, totalQuestions, difficulty, passingScore, adaptiveMode, questionTypes }),
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
    setQuestionTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const handleSeedDemo = async () => {
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setExperimentId(data.experiment.id);
        setTitle("Study of Half-Wave Rectifier");
        setUploadStatus("ready");
        setUploadMessage("Demo experiment loaded — text pre-extracted");
        setSelectedFile(null);
      }
    } catch {
      alert("Failed to load demo experiment.");
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Create Viva</h1>
        <p className="text-text-secondary text-sm mt-1">Configure a new laboratory viva examination</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="label">Experiment name</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Study of Half-Wave Rectifier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Experiment PDF</label>
            <button type="button" onClick={handleSeedDemo} className="text-2xs text-text-muted hover:text-accent transition-colors">
              Load demo
            </button>
          </div>
          <div
            className="border border-dashed border-border rounded-lg p-8 text-center hover:border-accent/40 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileChange(file); }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileChange(file); }}
            />
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-2xs text-text-muted mt-1">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-text-secondary">Drag and drop a PDF, or click to select</p>
              </div>
            )}
          </div>
          {uploadMessage && (
            <div className={`mt-2 text-sm px-3 py-2 rounded ${
              uploadStatus === "error" ? "bg-error-muted text-error" : uploadStatus === "ready" ? "bg-success-muted text-success" : "bg-bg-elevated text-text-muted"
            }`}>
              {uploadStatus === "uploading" || uploadStatus === "extracting" ? (
                <span className="animate-pulse-subtle">{uploadMessage}</span>
              ) : uploadMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Questions</label>
            <select className="input" value={totalQuestions} onChange={(e) => setTotalQuestions(Number(e.target.value))}>
              {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="adaptive">Adaptive</option>
            </select>
          </div>
          <div>
            <label className="label">Passing score (%)</label>
            <input type="number" className="input" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Adaptive questioning</label>
            <button
              type="button"
              onClick={() => setAdaptiveMode(!adaptiveMode)}
              className={`mt-1 w-full py-2 text-sm font-medium rounded border transition-colors ${
                adaptiveMode ? "bg-accent text-white border-accent" : "bg-bg-elevated text-text-secondary border-border"
              }`}
            >
              {adaptiveMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Question types</label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleQuestionType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                  questionTypes.includes(type)
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-elevated text-text-secondary border-border hover:border-border/80"
                }`}
              >
                {type.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Cancel</button>
          <button className="btn-primary" onClick={handleCreateViva} disabled={!title || !experimentId || uploadStatus !== "ready"}>
            Create viva
          </button>
        </div>
      </div>
    </div>
  );
}
