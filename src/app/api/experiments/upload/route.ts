import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractTextFromPDF, validateExperimentText } from "@/lib/pdf/extract";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "Untitled Experiment";

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

    const experiment = await prisma.experiment.create({
      data: {
        title,
        originalFileName: file.name,
        extractedText: extractionResult.text!,
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
