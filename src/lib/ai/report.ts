import { ai } from "./client";
import { extractAndParseJSON } from "./json-utils";

const REPORT_SYSTEM_PROMPT = `You are an academic assessment report generator for a laboratory viva examination.

Generate a comprehensive final assessment report based on the student's performance throughout the examination.

Rules:
1. Provide an overall score and pass/fail status.
2. Break down performance by category.
3. Identify strong and weak areas.
4. Suggest revision topics.
5. Return ONLY valid JSON with no additional text.`;

interface ReportParams {
  experimentTitle: string;
  totalScore: number;
  maxScore: number;
  passingScore: number;
  evaluations: Array<{
    questionNumber: number;
    question: string;
    studentAnswer: string;
    score: number;
    maxScore: number;
    correctness: string;
    topic: string;
    strengths: string[];
    weaknesses: string[];
    missingConcepts: string[];
    feedback: string;
  }>;
}

interface FinalReport {
  overallScore: number;
  maxScore: number;
  percentage: number;
  status: string;
  categoryPerformance: Record<string, number>;
  strongAreas: string[];
  weakAreas: string[];
  recommendedRevision: string[];
  summary: string;
}

export async function generateFinalReport(
  params: ReportParams
): Promise<FinalReport> {
  const prompt = `Experiment: ${params.experimentTitle}
Total Score: ${params.totalScore}/${params.maxScore}
Passing Score: ${params.passingScore}%

Question-by-question results:
${params.evaluations
  .map(
    (e) =>
      `Q${e.questionNumber} (${e.topic}): ${e.score}/${e.maxScore} - ${e.correctness}
Question: ${e.question}
Answer: ${e.studentAnswer.substring(0, 200)}
Strengths: ${e.strengths.join(", ")}
Weaknesses: ${e.weaknesses.join(", ")}
Missing: ${e.missingConcepts.join(", ")}`
  )
  .join("\n\n")}

Generate the final report. Return ONLY a JSON object:
{
  "overallScore": total_points,
  "maxScore": total_possible,
  "percentage": percentage,
  "status": "PASSED" or "FAILED",
  "categoryPerformance": { "Conceptual Understanding": percentage, "Procedure": percentage, ... },
  "strongAreas": ["area1", "area2"],
  "weakAreas": ["area1", "area2"],
  "recommendedRevision": ["topic1", "topic2"],
  "summary": "brief overall summary"
}`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await ai.chat.completions.create({
      model: "qwen3.6",
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || "";
    const parsed = extractAndParseJSON<FinalReport>(content);

    parsed.overallScore = params.totalScore;
    parsed.maxScore = params.maxScore;
    parsed.percentage = Math.round(
      (params.totalScore / params.maxScore) * 100
    );
    parsed.status =
      parsed.percentage >= params.passingScore ? "PASSED" : "FAILED";

    return parsed;
  } catch (error) {
    console.error("Report generation failed:", error);
    throw error;
  }
}
