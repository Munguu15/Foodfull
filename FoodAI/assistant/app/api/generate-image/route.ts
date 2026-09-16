import { InferenceClient } from "@huggingface/inference";

import { jsonError } from "@/lib/gemini";

const HF_IMAGE_MODEL =
  process.env.HF_IMAGE_MODEL?.trim() || "black-forest-labs/FLUX.1-schnell";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      lang?: string;
    };

    const prompt = body.prompt?.trim() ?? "";
    if (!prompt) {
      return jsonError("Prompt is required.");
    }

    const token = process.env.HF_TOKEN?.trim();
    if (!token) {
      return jsonError(
        "HF_TOKEN is missing. Add it to assistant/.env.local and restart the server.",
        500,
      );
    }

    const client = new InferenceClient(token);
    const imageUrl = await client.textToImage(
      {
        model: HF_IMAGE_MODEL,
        provider: "auto",
        inputs: [
          "Realistic food photograph.",
          "No text overlays, logos, or watermarks.",
          `Dish description: ${prompt}`,
        ].join(" "),
      },
      { outputType: "dataUrl" },
    );

    if (!imageUrl) {
      return jsonError("The model did not return an image. Try another prompt.", 502);
    }

    return Response.json({
      imageUrl,
      caption: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate image.";
    const status = message.includes("HF_TOKEN") ? 500 : 502;
    return jsonError(message, status);
  }
}
