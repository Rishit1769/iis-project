import { NextResponse } from "next/server";
import { ai } from "@/lib/ai/client";

export async function GET() {
  try {
    const response = await ai.models.list();
    return NextResponse.json({
      status: "connected",
      models: response.data?.map((m) => m.id) || [],
    });
  } catch {
    return NextResponse.json({
      status: "unavailable",
      error: "AI Gateway is not reachable",
    });
  }
}
