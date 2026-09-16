import {
  TEXT_MODEL,
  extractJsonArray,
  getGeminiClient,
  jsonError,
} from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    const lang = String(form.get("lang") ?? "mn");

    if (!(image instanceof File)) {
      return jsonError("Image file is required.");
    }

    if (!image.type.startsWith("image/")) {
      return jsonError("Only image files are supported.");
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const base64 = bytes.toString("base64");
    const language =
      lang === "en"
        ? "Respond in English."
        : "Хариултаа монгол хэлээр өг.";

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: image.type || "image/jpeg",
                data: base64,
              },
            },
            {
              text: [
                "You are a food vision assistant.",
                "Look at this food photo and identify visible ingredients and the likely dish.",
                "Return a short plain-text summary first, then a JSON array of ingredients.",
                'Format exactly like this:',
                "SUMMARY:",
                "<1-3 sentences>",
                "INGREDIENTS:",
                '["ingredient1","ingredient2"]',
                language,
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() ?? "";
    if (!text) {
      return jsonError("The model returned an empty response.", 502);
    }

    const ingredients = extractJsonArray(text);
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?:INGREDIENTS:|$)/i);
    const summary = summaryMatch?.[1]?.trim() || text;

    return Response.json({
      summary,
      ingredients,
      raw: text,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze image.";
    const status = message.includes("GEMINI_API_KEY") ? 500 : 502;
    return jsonError(message, status);
  }
}
