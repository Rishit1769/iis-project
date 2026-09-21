import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractTextFromPDF, validateExperimentText, extractSections } from "@/lib/pdf/extract";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viva = await prisma.viva.findUnique({
      where: { id: params.id },
      include: { experiment: true },
    });

    if (!viva) {
      return NextResponse.json({ error: "Viva not found" }, { status: 404 });
    }

    if (viva.teacherId !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extractionResult = await extractTextFromPDF(buffer);

    if (!extractionResult.success) {
      return NextResponse.json(
        { error: extractionResult.error },
        { status: 422 }
      );
    }

    const validation = validateExperimentText(extractionResult.text!);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 422 }
      );
    }

    const sections = extractSections(extractionResult.text!);

    const experiment = await prisma.experiment.update({
      where: { id: viva.experimentId },
      data: {
        extractedText: extractionResult.text!,
        originalFileName: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      experiment: {
        id: experiment.id,
        title: experiment.title,
        originalFileName: experiment.originalFileName,
        pageCount: extractionResult.pageCount,
        textLength: extractionResult.text!.length,
        sections: Object.keys(sections),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
