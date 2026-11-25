import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";

const CNY_TO_GEL = 0.382;
const USD_TO_GEL = 2.9;
const SHIPPING_USD_PER_KG = 8;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT = `
You estimate prices for a Georgian streetwear shop that imports from China.
Look at the product in the image and estimate:
1. Its typical price on Pinduoduo in CNY. If it looks like a replica, use a replica price.
2. Its realistic shipping weight in kilograms, including packaging.

Base both numbers on this specific item: its category, size and materials (for example sneakers weigh more than a beanie).
Respond with JSON only, with two numeric fields: "productPriceCNY" and "estimatedWeightKg".
If the image is not a product, set both fields to -1.
`.trim();

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

async function toDataUrl(file: File): Promise<string> {
  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  let mimeType = file.type?.toLowerCase() || "";
  if (!SUPPORTED_TYPES.includes(mimeType)) {
    buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
    mimeType = "image/jpeg";
  }
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  const image = form?.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "no_image" }, { status: 400 });
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image_too_large" }, { status: 413 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: await toDataUrl(image) } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const parsed: unknown = JSON.parse(response.choices[0]?.message.content || "{}");
    const { productPriceCNY, estimatedWeightKg } = (parsed ?? {}) as Record<string, unknown>;
    const priceCny = Number(productPriceCNY);
    const weightKg = Number(estimatedWeightKg);
    if (!(priceCny > 0) || !(weightKg > 0)) {
      return NextResponse.json({ error: "not_a_product" }, { status: 422 });
    }

    const productPriceGEL = round2(priceCny * CNY_TO_GEL);
    const shippingGEL = round2(weightKg * SHIPPING_USD_PER_KG * USD_TO_GEL);
    return NextResponse.json({
      productPriceGEL,
      shippingGEL,
      totalPriceGEL: round2(productPriceGEL + shippingGEL),
      estimatedWeightKg: round2(weightKg),
    });
  } catch (error) {
    console.error("Error estimating price:", error);
    return NextResponse.json({ error: "estimate_failed" }, { status: 502 });
  }
}
