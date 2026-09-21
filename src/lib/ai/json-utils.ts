/**
 * Robustly extract and parse JSON from LLM responses.
 * Handles markdown code blocks, control characters, and bad escapes.
 */
export function extractAndParseJSON<T>(content: string): T {
  let text = content;

  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    text = codeBlockMatch[1];
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  let raw = jsonMatch[0];

  raw = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  raw = raw.replace(
    /("(?:[^"\\]|\\.)*")/g,
    (str) => {
      return str.replace(/\\(?!["\\\/bfnrtu])/g, "");
    }
  );

  return JSON.parse(raw) as T;
}
