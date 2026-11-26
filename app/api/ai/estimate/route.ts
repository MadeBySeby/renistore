import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";
import type { Product } from "@/lib/products";
import { getCachedProducts } from "@/lib/products-server";

const CNY_TO_GEL = 0.382;
const USD_TO_GEL = 2.9;
const SHIPPING_USD_PER_KG = 8;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1280;
const MAX_CATALOG_ITEMS = 200;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildPrompt(catalog: Product[]): string {
  const catalogLines = catalog
    .map((product) => `${product.id}: ${product.name}${product.description ? ` (${product.description})` : ""}`)
    .join("\n");

  return `
You help a Georgian streetwear shop that imports clothes, shoes and accessories from China.

Task 1 (always do this for any clothing, shoes or accessory, whether or not the shop sells it):
- "productPriceCNY": the item's typical price on Pinduoduo in CNY. If it looks like a replica, use a replica price.
- "estimatedWeightKg": its realistic shipping weight in kilograms, including packaging.
Base both numbers on this specific item's category, size and materials (for example sneakers weigh more than a beanie).
Use -1 for both numbers only when the photo shows no clothing, shoes or accessory at all.

Task 2: compare the photo with the shop's catalog below (format "id: name (description)").
${catalogLines || "(empty)"}
"matchedProductId": the numeric catalog id when the photo shows the same kind of item with the same main colors and design as a catalog entry (brand logos may be missing from the photo). Otherwise null.

Respond with JSON only, in the shape {"productPriceCNY": number, "estimatedWeightKg": number, "matchedProductId": number or null}.
`.trim();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

async function toDataUrl(file: File): Promise<string | null> {
  const input = Buffer.from(await file.arrayBuffer());
  try {
    const output = await sharp(input)
      .rotate()
      .resize({ width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return `data:image/jpeg;base64,${output.toString("base64")}`;
  } catch (error) {
    const mimeType = file.type?.toLowerCase() || "";
    if (SUPPORTED_TYPES.includes(mimeType)) return `data:${mimeType};base64,${input.toString("base64")}`;
    console.error("Unsupported image for estimate:", mimeType, error);
    return null;
  }
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

  const imageUrl = await toDataUrl(image);
  if (!imageUrl) {
    return NextResponse.json({ error: "unsupported_image" }, { status: 415 });
  }

  try {
    const catalog = (
      await getCachedProducts().catch((error: unknown) => {
        console.error("Error loading catalog for estimate:", error);
        return [] as Product[];
      })
    ).slice(0, MAX_CATALOG_ITEMS);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: buildPrompt(catalog) },
          ],
        },
      ],
    });

    const parsed: unknown = JSON.parse(response.choices[0]?.message.content || "{}");
    const { matchedProductId, productPriceCNY, estimatedWeightKg } = (parsed ?? {}) as Record<string, unknown>;

    const matched =
      matchedProductId === null || matchedProductId === undefined
        ? undefined
        : catalog.find((product) => String(product.id) === String(matchedProductId));
    if (matched) {
      return NextResponse.json({
        matchedProduct: {
          id: matched.id,
          name: matched.name,
          slug: matched.slug,
          price: Number(matched.price),
          image_url: matched.image_url,
          sizes: matched.sizes ?? [],
        },
      });
    }

    const priceCny = Number(productPriceCNY);
    const weightKg = Number(estimatedWeightKg);
    if (!(priceCny > 0) || !(weightKg > 0)) {
      return NextResponse.json({ error: "not_a_product" }, { status: 422 });
    }

    const productPriceGEL = round2(priceCny * CNY_TO_GEL);
    const shippingGEL = round2(weightKg * SHIPPING_USD_PER_KG * USD_TO_GEL);
    return NextResponse.json({
      estimate: {
        productPriceGEL,
        shippingGEL,
        totalPriceGEL: round2(productPriceGEL + shippingGEL),
        estimatedWeightKg: round2(weightKg),
      },
    });
  } catch (error) {
    console.error("Error estimating price:", error);
    return NextResponse.json({ error: "estimate_failed" }, { status: 502 });
  }
}
