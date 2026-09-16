import {
  TEXT_MODEL,
  extractJsonArray,
  getGeminiClient,
  jsonError,
} from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      lang?: string;
    };

    const text = body.text?.trim() ?? "";
    if (!text) {
      return jsonError("Text is required.");
    }

    const language =
      body.lang === "en"
        ? "Use English ingredient names."
        : "Орцын нэрийг монгол хэлээр бич.";

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "Extract only food ingredients from the user text.",
                "Ignore cooking instructions, quantities if unclear, and non-food words.",
                "Normalize names (for example tomato instead of tomatoes if appropriate).",
                "Return ONLY a JSON array of strings. No markdown, no extra text.",
                language,
                "",
                `User text: ${text}`,
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const raw = response.text?.trim() ?? "";
    const ingredients = extractJsonArray(raw);

    if (ingredients.length === 0) {
      return jsonError(
        "No ingredients were recognized. Try a clearer list.",
        422,
      );
    }

    return Response.json({ ingredients, raw });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to recognize ingredients.";
    const status = message.includes("GEMINI_API_KEY") ? 500 : 502;
    return jsonError(message, status);
  }
}
