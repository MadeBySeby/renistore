"use client";
import { sendToAi } from "@/libs/aiUtils";
import React, { useMemo, useState } from "react";
export default function AiWeightPage() {
  const [image, setImage] = useState<File | null>(null);
  const [weight, setWeight] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [chineesePrice, setChineesePrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sellingPrice, setSellingPrice] = useState<string | null>(null);
  async function handleEstimate() {
    if (!image) return;
    setLoading(true);
    try {
      const data = await sendToAi(image, "/api/ai");
      setWeight(data.estimatedWeightKg?.toString() || "-1");
    } catch (error) {
      console.error("Error estimating weight:", error);
    } finally {
      setLoading(false);
    }
  }

  const calculatedPrice = (
    parseFloat(chineesePrice || "0") * 0.38 +
    (parseFloat(weight || "0") || 0) * 21.56
  ).toFixed(2);

  return (
    <div className=" sm:px-8 sm:flex-column  sm:items-center md:px-20 lg:px-32 xl:px-40 2xl:px-48 py-8">
      შეამოწმე პროდუქტის თვითღირებულება AI-ს დახმარებით
      <section>
        <div className="">AI Weight Page</div>

        <input
          type="file"
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setImage(file);
          }}
        />
        {image && (
          <div className="flex items-baseline flex-col gap-4 mt-4">
            {loading ? (
              <div>მუშავდება...</div>
            ) : (
              weight && (
                <div>
                  პროდუქტის თვითღირებულება: {calculatedPrice} ლ
                  <div className="mt-2 flex flex-col  sm:flex-row gap-2">
                    <button
                      className="
                      mr-2
                      bg-green-500
                      text-white
                      px-4
                      py-2
                      rounded
                    "
                      onClick={() =>
                        setSellingPrice(
                          (parseFloat(calculatedPrice) * 1.2).toFixed(2)
                        )
                      }>
                      დაამატე +20%იანი ფასნამატი
                    </button>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded"
                      onClick={() =>
                        setSellingPrice(
                          (parseFloat(calculatedPrice) * 1.4).toFixed(2)
                        )
                      }>
                      დაამატე +40%იანი ფასნამატი
                    </button>
                    {sellingPrice && (
                      <div>
                        გასაყიდი ფასი{" "}
                        <span className=" text-2xl text-red-600">
                          {sellingPrice}
                        </span>{" "}
                        ლ
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setImage(null)}>
              წაშლა
            </button>
            <img width={200} src={URL.createObjectURL(image)} alt="Selected" />
            <input
              className="p-3 border-1 rounded-2xl border-red-500 focus:outline-none "
              type="number"
              placeholder="ჩინური ფასი"
              onChange={(e) => setChineesePrice(e.target.value)}
            />
            <button
              onClick={() => {
                handleEstimate();
              }}
              className="bg-primary text-white px-4 py-2 rounded mt-5">
              გაუგზავნე ხელოვნურ ინტელექტს
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
