import { TEXT_MODEL, getGeminiClient, jsonError } from "@/lib/gemini";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      lang?: string;
      history?: ChatMessage[];
    };

    const message = body.message?.trim() ?? "";
    if (!message) {
      return jsonError("Message is required.");
    }

    const language =
      body.lang === "en"
        ? "Answer in clear English."
        : "Хариултаа монгол хэлээр, энгийн ойлгомжтой өг.";

    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "You are FoodAI's cooking assistant.",
                "You ONLY help with food and cooking topics:",
                "- ingredients and substitutions",
                "- recipes and how to cook step by step",
                "- cooking time and temperature",
                "- portions, nutrition tips, and meal ideas",
                "- food storage and preparation tips",
                "Keep answers practical, short, and easy to follow.",
                "When useful, include ingredients, steps, and approximate time.",
                "If the question is not about food or cooking, politely refuse and ask a food-related question instead.",
                "Do not discuss programming, Gemini, Hugging Face, APIs, or unrelated tech topics.",
                language,
                "",
                "Conversation so far:",
                ...history.map(
                  (item) =>
                    `${item.role === "user" ? "User" : "Assistant"}: ${item.content}`,
                ),
                "",
                `User: ${message}`,
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const reply = response.text?.trim() ?? "";
    if (!reply) {
      return jsonError("The model returned an empty response.", 502);
    }

    return Response.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get assistant reply.";
    const status = message.includes("GEMINI_API_KEY") ? 500 : 502;
    return jsonError(message, status);
  }
}
