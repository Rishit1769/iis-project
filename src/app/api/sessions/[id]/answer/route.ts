import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateAnswer } from "@/lib/ai/evaluator";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return NextResponse.json(
        { error: "Question ID and answer are required" },
        { status: 400 }
      );
    }

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

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { answer: true },
    });

    if (!question || question.sessionId !== params.id) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    if (question.answer) {
      return NextResponse.json(
        { error: "Answer already submitted for this question" },
        { status: 400 }
      );
    }

    if (question.questionNumber !== sessionData.currentQuestion) {
      return NextResponse.json(
        { error: "Invalid question for current state" },
        { status: 400 }
      );
    }

    const evaluation = await evaluateAnswer({
      experimentText: sessionData.viva.experiment.extractedText,
      question: question.text,
      studentAnswer: answer,
      difficulty: question.difficulty,
      topic: question.topic,
      questionNumber: question.questionNumber,
      totalQuestions: sessionData.totalQuestions,
    });

    const savedAnswer = await prisma.answer.create({
      data: {
        questionId,
        answerText: answer,
        score: evaluation.score,
        maxScore: evaluation.maxScore,
        correctness: evaluation.correctness,
        conceptualUnderstanding: evaluation.conceptualUnderstanding,
        completeness: evaluation.completeness,
        feedback: evaluation.strengths.join(". ") + ". " + evaluation.weaknesses.join(". "),
        strengths: JSON.stringify(evaluation.strengths),
        weaknesses: JSON.stringify(evaluation.weaknesses),
        missingConcepts: JSON.stringify(evaluation.missingConcepts),
      },
    });

    const newTotalScore =
      sessionData.totalScore + evaluation.score;
    const newMaxScore =
      sessionData.maxScore + evaluation.maxScore;

    const topicsCovered = sessionData.questions
      .filter((q) => q.answer)
      .map((q) => q.topic);
    topicsCovered.push(question.topic);

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    if (evaluation.score < 5) {
      weakTopics.push(question.topic);
    } else {
      strongTopics.push(question.topic);
    }

    await prisma.evaluation.create({
      data: {
        sessionId: sessionData.id,
        questionNumber: question.questionNumber,
        score: evaluation.score,
        maxScore: evaluation.maxScore,
        topicsCovered: JSON.stringify([...new Set(topicsCovered)]),
        weakTopics: JSON.stringify([...new Set(weakTopics)]),
        strongTopics: JSON.stringify([...new Set(strongTopics)]),
        currentDifficulty: evaluation.recommendedDifficulty,
      },
    });

    const nextQuestion = sessionData.currentQuestion + 1;
    const isComplete = nextQuestion > sessionData.totalQuestions;

    await prisma.vivaSession.update({
      where: { id: params.id },
      data: {
        currentQuestion: nextQuestion,
        totalScore: newTotalScore,
        maxScore: newMaxScore,
        status: isComplete ? "COMPLETED" : "ACTIVE",
        completedAt: isComplete ? new Date() : null,
      },
    });

    return NextResponse.json({
      answerId: savedAnswer.id,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      correctness: evaluation.correctness,
      totalScore: newTotalScore,
      maxScoreTotal: newMaxScore,
      questionNumber: question.questionNumber,
      nextQuestionNumber: nextQuestion,
      isComplete,
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer. Please try again." },
      { status: 500 }
    );
  }
}
