import PDFParser from "pdf2json";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<ExtractionResult> {
  const tmpFile = join(tmpdir(), `upload-${Date.now()}.pdf`);

  try {
    await writeFile(tmpFile, buffer);

    const result = await new Promise<ExtractionResult>((resolve) => {
      const parser = new PDFParser();

      parser.on("pdfParser_dataError", (errData: unknown) => {
        console.error("PDF parsing error:", errData);
        resolve({
          success: false,
          error: "Failed to parse the PDF file. Please try again.",
        });
      });

      parser.on("pdfParser_dataReady", (pdfData: unknown) => {
        try {
          const data = pdfData as {
            Pages?: Array<{
              Texts?: Array<{ R?: Array<{ T?: string }> }>;
            }>;
          };
          let text = "";

          if (data.Pages) {
            for (const page of data.Pages) {
              if (page.Texts) {
                for (const item of page.Texts) {
                  if (item.R) {
                    for (const r of item.R) {
                      if (r.T) {
                        try {
                          text += decodeURIComponent(r.T);
                        } catch {
                          text += r.T;
                        }
                        text += " ";
                      }
                    }
                  }
                }
                text += "\n";
              }
            }
          }

          text = text.replace(/\r\n/g, "\n");
          text = text.replace(/\n{3,}/g, "\n\n");
          text = text.replace(/[ \t]{2,}/g, " ");
          text = text.replace(/^\s+|\s+$/gm, "");
          text = text.replace(/\u0000/g, "");
          text = text.replace(/\uFFFD/g, "");

          if (text.trim().length < 20) {
            resolve({
              success: false,
              error:
                "Unable to extract readable text from this PDF. Please upload a text-based experiment PDF.",
            });
            return;
          }

          const pageCount = data.Pages ? data.Pages.length : 0;

          resolve({
            success: true,
            text: text.trim(),
            pageCount,
          });
        } catch (error) {
          console.error("PDF text extraction error:", error);
          resolve({
            success: false,
            error: "Failed to extract text from PDF.",
          });
        }
      });

      parser.loadPDF(tmpFile);
    });

    return result;
  } catch (error) {
    console.error("PDF load error:", error);
    return {
      success: false,
      error: "Failed to load the PDF file.",
    };
  } finally {
    await unlink(tmpFile).catch(() => {});
  }
}

export function extractSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionPatterns = [
    "objective",
    "aim",
    "theory",
    "apparatus",
    "components",
    "materials",
    "procedure",
    "observation",
    "observations",
    "calculations",
    "formula",
    "result",
    "results",
    "precautions",
    "conclusion",
    "discussion",
  ];

  const lines = text.split("\n");
  let currentSection = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    const matchedSection = sectionPatterns.find(
      (s) =>
        trimmedLine === s ||
        trimmedLine.startsWith(s + ":") ||
        trimmedLine.startsWith(s + "s:") ||
        trimmedLine === s.toUpperCase() ||
        trimmedLine.match(new RegExp(`^\\d+\\.?\\s*${s}`, "i"))
    );

    if (matchedSection && trimmedLine.length < 50) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join("\n").trim();
      }
      currentSection = matchedSection;
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join("\n").trim();
  }

  return sections;
}

export function validateExperimentText(text: string): {
  valid: boolean;
  error?: string;
} {
  if (!text || text.trim().length < 50) {
    return {
      valid: false,
      error: "Extracted text is too short to be a valid experiment.",
    };
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount < 30) {
    return {
      valid: false,
      error:
        "Extracted text does not appear to contain enough experiment content.",
    };
  }

  return { valid: true };
}
