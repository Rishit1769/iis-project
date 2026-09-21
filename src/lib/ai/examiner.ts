import { ai } from "./client";
import { extractAndParseJSON } from "./json-utils";

const EXAMINER_SYSTEM_PROMPT = `You are an academic laboratory viva examiner. You are conducting a viva examination based on an experiment document.

Rules:
1. Ask exactly one question.
2. Base the question on the supplied experiment text.
3. Do not invent experiment-specific facts.
4. Do not reveal the answer.
5. Do not teach the student during the examination.
6. Do not repeat previously asked questions.
7. Consider previous student performance.
8. Adjust difficulty when adaptive mode is enabled.
9. Prefer conceptual understanding over memorization.
10. Cover different parts of the experiment.
11. Keep questions concise.
12. If the student performed poorly on a concept, probe that concept at an appropriate difficulty.
13. If the student performed strongly, progressively increase difficulty.
14. Remain within the selected question types.
15. Return ONLY valid JSON with no additional text.`;

interface QuestionParams {
  experimentText: string;
  totalQuestions: number;
  difficulty: string;
  questionTypes: string[];
  adaptiveMode: boolean;
  questionNumber: number;
  topicsCovered: string[];
  weakTopics: string[];
  strongTopics: string[];
  previousQuestions: string[];
  previousEvaluations: Array<{
    score: number;
    maxScore: number;
    topic: string;
    correctness: string;
  }>;
}

interface GeneratedQuestion {
  question: string;
  topic: string;
  difficulty: string;
  type: string;
}

export async function generateQuestion(
  params: QuestionParams
): Promise<GeneratedQuestion> {
  const evaluationContext =
    params.previousEvaluations.length > 0
      ? `\nPrevious performance: ${params.previousEvaluations.map((e) => `${e.topic}(${e.score}/${e.maxScore}, ${e.correctness})`).join(", ")}`
      : "";

  const prompt = `Experiment:
${params.experimentText.substring(0, 3000)}

Viva configuration:
- Total questions: ${params.totalQuestions}
- Difficulty: ${params.difficulty}
- Question types: ${params.questionTypes.join(", ")}
- Adaptive mode: ${params.adaptiveMode}

Current state:
- Question number: ${params.questionNumber} of ${params.totalQuestions}
- Topics already covered: ${params.topicsCovered.length > 0 ? params.topicsCovered.join(", ") : "none"}
- Weak topics: ${params.weakTopics.length > 0 ? params.weakTopics.join(", ") : "none"}
- Strong topics: ${params.strongTopics.length > 0 ? params.strongTopics.join(", ") : "none"}
- Current difficulty: ${params.difficulty}
${evaluationContext}

Previous questions asked:
${params.previousQuestions.length > 0 ? params.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") : "None yet"}

Generate the next question. Return ONLY a JSON object:
{
  "question": "the question text",
  "topic": "the topic area",
  "difficulty": "easy|medium|hard",
  "type": "conceptual|definition|procedure|observation|calculation|application|troubleshooting|experimental_reasoning"
}`;

  try {
    const response = await ai.chat.completions.create({
      model: "qwen3.6",
      messages: [
        { role: "system", content: EXAMINER_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "";
    const parsed = extractAndParseJSON<GeneratedQuestion>(content);

    if (!parsed.question || !parsed.topic || !parsed.difficulty || !parsed.type) {
      throw new Error("Invalid question structure");
    }

    return parsed;
  } catch (error) {
    console.error("Question generation failed:", error);
    throw error;
  }
}
