import { ai } from "./client";
import { extractAndParseJSON } from "./json-utils";

const EVALUATOR_SYSTEM_PROMPT = `You are an academic answer evaluator for a laboratory viva examination.

Evaluate the student's answer against the experiment context and the question asked.

Rules:
1. Be fair and objective.
2. Score based on correctness, understanding, and completeness.
3. Identify strengths and weaknesses.
4. Identify missing concepts.
5. Recommend appropriate difficulty for next question.
6. Return ONLY valid JSON with no additional text.`;

interface EvaluateParams {
  experimentText: string;
  question: string;
  studentAnswer: string;
  difficulty: string;
  topic: string;
  questionNumber: number;
  totalQuestions: number;
}

interface EvaluationResult {
  score: number;
  maxScore: number;
  correctness: string;
  conceptualUnderstanding: number;
  completeness: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  recommendedDifficulty: string;
}

export async function evaluateAnswer(
  params: EvaluateParams
): Promise<EvaluationResult> {
  const prompt = `Experiment context:
${params.experimentText.substring(0, 2000)}

Question (difficulty: ${params.difficulty}, topic: ${params.topic}):
${params.question}

Student answer:
${params.studentAnswer}

Evaluate this answer. Return ONLY a JSON object:
{
  "score": 0-10,
  "maxScore": 10,
  "correctness": "correct|mostly_correct|partially_correct|incorrect|no_answer",
  "conceptualUnderstanding": 0.0-1.0,
  "completeness": 0.0-1.0,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "missingConcepts": ["concept1"],
  "recommendedDifficulty": "easy|medium|hard"
}`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await ai.chat.completions.create({
      model: "qwen3.6",
      messages: [
        { role: "system", content: EVALUATOR_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const content = response.choices[0]?.message?.content || "";
    const parsed = extractAndParseJSON<EvaluationResult>(content);

    if (
      typeof parsed.score !== "number" ||
      !parsed.correctness ||
      typeof parsed.conceptualUnderstanding !== "number" ||
      typeof parsed.completeness !== "number"
    ) {
      throw new Error("Invalid evaluation structure");
    }

    parsed.score = Math.max(0, Math.min(10, Math.round(parsed.score)));
    parsed.conceptualUnderstanding = Math.max(
      0,
      Math.min(1, parsed.conceptualUnderstanding)
    );
    parsed.completeness = Math.max(0, Math.min(1, parsed.completeness));

    return parsed;
  } catch (error) {
    console.error("Answer evaluation failed:", error);
    throw error;
  }
}
