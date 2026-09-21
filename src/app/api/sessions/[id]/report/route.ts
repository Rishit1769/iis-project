import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateFinalReport } from "@/lib/ai/report";

async function getReport({ params }: { params: { id: string } }) {
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
      },
    });

    if (!sessionData) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (sessionData.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Session is not yet completed" },
        { status: 400 }
      );
    }

    const evaluations = sessionData.questions
      .filter((q) => q.answer)
      .map((q) => ({
        questionNumber: q.questionNumber,
        question: q.text,
        studentAnswer: q.answer!.answerText,
        score: q.answer!.score,
        maxScore: q.answer!.maxScore,
        correctness: q.answer!.correctness,
        topic: q.topic,
        strengths: JSON.parse(q.answer!.strengths || "[]"),
        weaknesses: JSON.parse(q.answer!.weaknesses || "[]"),
        missingConcepts: JSON.parse(q.answer!.missingConcepts || "[]"),
        feedback: q.answer!.feedback,
      }));

    const report = await generateFinalReport({
      experimentTitle: sessionData.viva.experiment.title,
      totalScore: sessionData.totalScore,
      maxScore: sessionData.maxScore,
      passingScore: sessionData.viva.passingScore,
      evaluations,
    });

    return NextResponse.json({
      session: {
        id: sessionData.id,
        studentName: sessionData.studentName,
        totalScore: sessionData.totalScore,
        maxScore: sessionData.maxScore,
        startedAt: sessionData.startedAt,
        completedAt: sessionData.completedAt,
      },
      viva: {
        title: sessionData.viva.title,
        experimentTitle: sessionData.viva.experiment.title,
        passingScore: sessionData.viva.passingScore,
      },
      report,
      evaluations,
    });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return getReport({ params });
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return getReport({ params });
}
