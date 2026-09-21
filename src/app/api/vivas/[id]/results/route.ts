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
        experiment: { select: { id: true, title: true, originalFileName: true } },
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
    console.error("Get results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
