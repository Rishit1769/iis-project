import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionCode, studentName } = body;

    if (!sessionCode || !studentName) {
      return NextResponse.json(
        { error: "Session code and student name are required" },
        { status: 400 }
      );
    }

    const viva = await prisma.viva.findUnique({
      where: { sessionCode: sessionCode.toUpperCase() },
      include: { experiment: true },
    });

    if (!viva) {
      return NextResponse.json(
        { error: "Invalid session code" },
        { status: 404 }
      );
    }

    const existingSession = await prisma.vivaSession.findFirst({
      where: {
        vivaId: viva.id,
        studentName: studentName.trim(),
        status: "ACTIVE",
      },
    });

    if (existingSession) {
      return NextResponse.json(existingSession);
    }

    const vivaSession = await prisma.vivaSession.create({
      data: {
        vivaId: viva.id,
        studentName: studentName.trim(),
        totalQuestions: viva.totalQuestions,
      },
    });

    return NextResponse.json({
      ...vivaSession,
      viva: {
        id: viva.id,
        title: viva.title,
        experiment: { title: viva.experiment.title },
        totalQuestions: viva.totalQuestions,
        difficulty: viva.difficulty,
      },
    });
  } catch (error) {
    console.error("Start session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
