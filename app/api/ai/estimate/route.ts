import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get("image") as Blob;

  if (!image) {
    return new Response(JSON.stringify({ error: "No image provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const imageData = await image.arrayBuffer();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: Buffer.from(imageData).toString("base64"),
              },
            },
            {
              text: `
You are a price estimation AI.

I will provide an image of a product. Your task is to estimate the total price of the product in GEL, including product cost and shipping.

Rules:
1. Estimate the approximate price of the product on Pinduoduo. If the product is fake/replica, lower the price accordingly.
2. Estimate the weight of the product in kilograms.
3. Shipping cost is $8 per kg.
4. Convert currencies using:
   - 1 CNY = 0.382 GEL
   - 1 USD = 2.9 GEL
5. Total price = product price (GEL) + shipping (GEL).

Return ONLY raw JSON.
Do NOT wrap the response in markdown.
Do NOT include explanations.

{
  "productPriceGEL": 22.92,
  "shippingGEL": 15,
  "totalPriceGEL": 37.92,
  "estimatedWeightKg": 0.7
}
`,
            },
          ],
        },
      ],
    });
    const aiText =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No content generated";
    return new Response(JSON.stringify({ aiText, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
