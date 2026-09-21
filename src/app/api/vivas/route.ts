import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const vivas = await prisma.viva.findMany({
      where: { teacherId: userId },
      include: {
        experiment: { select: { id: true, title: true } },
        sessions: {
          select: {
            id: true,
            studentName: true,
            status: true,
            totalScore: true,
            maxScore: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vivas);
  } catch (error) {
    console.error("Get vivas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const {
      title,
      experimentId,
      totalQuestions,
      difficulty,
      passingScore,
      adaptiveMode,
      questionTypes,
    } = body;

    if (!title || !experimentId) {
      return NextResponse.json(
        { error: "Title and experiment are required" },
        { status: 400 }
      );
    }

    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    const sessionCode = uuidv4().substring(0, 8).toUpperCase();

    const viva = await prisma.viva.create({
      data: {
        teacherId: userId,
        experimentId,
        title,
        totalQuestions: totalQuestions || 10,
        difficulty: difficulty || "adaptive",
        passingScore: passingScore || 50,
        adaptiveMode: adaptiveMode !== false,
        questionTypes: Array.isArray(questionTypes)
          ? questionTypes.join(",")
          : questionTypes || "conceptual,procedure,calculation,application",
        sessionCode,
      },
      include: { experiment: true },
    });

    return NextResponse.json(viva);
  } catch (error) {
    console.error("Create viva error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
