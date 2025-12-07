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
    const chineesePrice = form.get("chineesePrice") as string | null;
    const priceInYuan = chineesePrice ? parseFloat(chineesePrice) : null;
    if (!file) {
      return NextResponse.json({ error: "No file sent" }, { status: 400 });
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);
    let mimeType = file.type?.toLowerCase() || "";

    console.log("Original file type:", mimeType);

    // Convert unsupported formats (AVIF, HEIC, etc.) to JPEG
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

    // Convert to base64
    const base64 = buffer.toString("base64");

    // Call OpenAI
    const prompt = `
Analyze this product image.

1) Estimate the shipping weight in kilograms (realistic guess).
2) Convert the Chinese price to Georgian Lari (GEL) using: 1 CNY = 0.38 GEL.
3) Calculate the final price using:

FinalPrice = (priceInYuan * 0.38) + (weightKg * 21.56)

Where:
- priceInYuan = ${priceInYuan}
- weightKg = your estimated weight

❗ VERY IMPORTANT:
Return ONLY the final calculated price in GEL as a NUMBER.
No text, no explanation, no labels. Only output the GEL number.

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

    const finalPriceGEL = parseFloat(match[0]);

    return NextResponse.json({
      finalPriceGEL,
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
