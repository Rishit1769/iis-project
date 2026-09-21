import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionData = await prisma.vivaSession.findUnique({
      where: { id: params.id },
      include: {
        viva: {
          include: {
            experiment: { select: { id: true, title: true } },
            teacher: { select: { name: true } },
          },
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

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
