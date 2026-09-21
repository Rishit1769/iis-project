import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuestion } from "@/lib/ai/examiner";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionData = await prisma.vivaSession.findUnique({
      where: { id: params.id },
      include: {
        viva: {
          include: { experiment: true },
        },
        questions: {
          include: { answer: true },
          orderBy: { questionNumber: "asc" },
        },
        evaluations: {
          orderBy: { questionNumber: "asc" },
        },
      },
    });

    if (!sessionData) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (sessionData.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Session is not active" },
        { status: 400 }
      );
    }

    if (sessionData.currentQuestion > sessionData.totalQuestions) {
      return NextResponse.json(
        { error: "All questions have been asked" },
        { status: 400 }
      );
    }

    const viva = sessionData.viva;
    const experimentText = viva.experiment.extractedText;

    const previousQuestions = sessionData.questions.map((q) => q.text);
    const topicsCovered = sessionData.questions.map((q) => q.topic);

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    sessionData.evaluations.forEach((evaluation) => {
      const topics = JSON.parse(evaluation.topicsCovered || "[]");
      const weak = JSON.parse(evaluation.weakTopics || "[]");
      const strong = JSON.parse(evaluation.strongTopics || "[]");
      topicsCovered.push(...topics);
      weakTopics.push(...weak);
      strongTopics.push(...strong);
    });

    const previousEvaluations = sessionData.questions
      .filter((q) => q.answer)
      .map((q) => ({
        score: q.answer!.score,
        maxScore: q.answer!.maxScore,
        topic: q.topic,
        correctness: q.answer!.correctness,
      }));

    let currentDifficulty = viva.difficulty;
    if (viva.adaptiveMode && sessionData.evaluations.length > 0) {
      const lastEvaluation =
        sessionData.evaluations[sessionData.evaluations.length - 1];
      currentDifficulty = lastEvaluation.currentDifficulty;
    }

    const questionTypes = viva.questionTypes.split(",");

    const question = await generateQuestion({
      experimentText,
      totalQuestions: viva.totalQuestions,
      difficulty: currentDifficulty,
      questionTypes,
      adaptiveMode: viva.adaptiveMode,
      questionNumber: sessionData.currentQuestion,
      topicsCovered: [...new Set(topicsCovered)],
      weakTopics: [...new Set(weakTopics)],
      strongTopics: [...new Set(strongTopics)],
      previousQuestions,
      previousEvaluations,
    });

    const savedQuestion = await prisma.question.create({
      data: {
        sessionId: sessionData.id,
        questionNumber: sessionData.currentQuestion,
        text: question.question,
        topic: question.topic,
        difficulty: question.difficulty,
        type: question.type,
      },
    });

    return NextResponse.json({
      questionId: savedQuestion.id,
      questionNumber: savedQuestion.questionNumber,
      question: savedQuestion.text,
      topic: savedQuestion.topic,
      difficulty: savedQuestion.difficulty,
      type: savedQuestion.type,
      totalQuestions: sessionData.totalQuestions,
    });
  } catch (error) {
    console.error("Next question error:", error);
    return NextResponse.json(
      { error: "Failed to generate question. Please try again." },
      { status: 500 }
    );
  }
}
