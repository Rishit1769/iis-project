import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    select: { id: true, name: true, email: true, approvalStatus: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(teachers);
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status } = await request.json();
  if (!id || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "A teacher id and valid status are required" }, { status: 400 });
  }

  const teacher = await prisma.user.findFirst({ where: { id, role: "TEACHER" } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { approvalStatus: status },
    select: { id: true, name: true, email: true, approvalStatus: true },
  });

  return NextResponse.json(updated);
}
