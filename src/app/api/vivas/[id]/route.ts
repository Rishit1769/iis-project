import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viva = await prisma.viva.findUnique({
      where: { id: params.id },
      include: {
        experiment: true,
        teacher: { select: { id: true, name: true, email: true } },
        sessions: {
          include: {
            questions: {
              include: { answer: true },
              orderBy: { questionNumber: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!viva) {
      return NextResponse.json({ error: "Viva not found" }, { status: 404 });
    }

    if (viva.teacherId !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(viva);
  } catch (error) {
    console.error("Get viva error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viva = await prisma.viva.findUnique({ where: { id: params.id } });
    if (!viva) {
      return NextResponse.json({ error: "Viva not found" }, { status: 404 });
    }

    if (viva.teacherId !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete dependent records in correct order
    const sessions = await prisma.vivaSession.findMany({
      where: { vivaId: params.id },
      select: { id: true },
    });
    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length > 0) {
      await prisma.answer.deleteMany({
        where: { question: { sessionId: { in: sessionIds } } },
      });
      await prisma.question.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });
      await prisma.evaluation.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });
      await prisma.vivaSession.deleteMany({
        where: { vivaId: params.id },
      });
    }

    await prisma.viva.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete viva error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
