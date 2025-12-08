import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File;
    // const chineesePrice = form.get("chineesePrice") as string | null;
    // const priceInYuan = chineesePrice ? parseFloat(chineesePrice) : null;
    if (!file) {
      return NextResponse.json({ error: "No file sent" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);
    let mimeType = file.type?.toLowerCase() || "";

    console.log("Original file type:", mimeType);

    if (
      mimeType.includes("avif") ||
      mimeType.includes("heic") ||
      mimeType.includes("heif") ||
      (!mimeType.includes("png") &&
        !mimeType.includes("jpeg") &&
        !mimeType.includes("jpg") &&
        !mimeType.includes("gif") &&
        !mimeType.includes("webp"))
    ) {
      console.log("Converting to JPEG...");
      buffer = Buffer.from(
        await sharp(buffer).jpeg({ quality: 85 }).toBuffer()
      );
      mimeType = "image/jpeg";
    } else if (mimeType.includes("png")) {
      mimeType = "image/png";
    } else if (mimeType.includes("gif")) {
      mimeType = "image/gif";
    } else if (mimeType.includes("webp")) {
      mimeType = "image/webp";
    } else {
      mimeType = "image/jpeg";
    }

    console.log("Final MIME type:", mimeType);

    const base64 = buffer.toString("base64");

    const prompt = `
AYou are an expert product-analysis system that estimates shipping weight with maximum accuracy.

TASK:
1. Analyze the product image in detail.
2. Identify the exact or closest matching product model if possible.
3. Use external world knowledge (e-commerce data, marketplace listings, manufacturer specs).
4. Consider materials, dimensions, typical packaging weight, and similar products.
5. Produce the most realistic and accurate weight estimate in kilograms.

STRICT OUTPUT RULES:
- Output ONLY a number (example: 1.25)
- No text, no units, no explanation.
- If accurate estimation is impossible, output -1.

Return the final estimated weight (kg) as a plain number only.


`.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const raw = response.choices[0].message.content || "";
    console.log("OpenAI raw response:", raw);

    const match = raw.match(/-?\d+(\.\d+)?/);
    if (!match) {
      throw new Error("Model did not return a valid number");
    }

    const estimatedWeightKg = parseFloat(match[0]);

    return NextResponse.json({
      estimatedWeightKg,
      response,
    });
  } catch (err: any) {
    console.error("Error in AI route:", err);
    return NextResponse.json(
      {
        error: "Server error",
        details: err?.message || String(err),
        code: err?.code || "unknown",
      },
      { status: 500 }
    );
  }
}
