import { GoogleGenAI } from "@google/genai";

export const TEXT_MODEL = "gemini-3.6-flash";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to assistant/.env.local and restart the server.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function extractJsonArray(text: string): string[] {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const arrayMatch = candidate.match(/\[[\s\S]*\]/);
  if (!arrayMatch) return [];

  try {
    const parsed = JSON.parse(arrayMatch[0]) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    return [];
  }
}
