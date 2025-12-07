"use client";
import React, { useState } from "react";

export default function AiWeightPage() {
  const [image, setImage] = useState<File | null>(null);
  const [weight, setWeight] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [chineesePrice, setChineesePrice] = useState<string | null>(null);
  async function sentToAi() {
    if (!image) return;
    const formdata = new FormData();
    formdata.append("image", image);
    formdata.append("chineesePrice", chineesePrice || "");
    const res = await fetch("/api/ai", {
      method: "POST",
      body: formdata,
    });
    const data = await res.json();
    console.log("AI Response:", data);
    setWeight(data.estimatedWeightKg?.toString() || null);
    setPrice(data.finalPriceGEL?.toString() || null);
  }
  return (
    <div className=" sm:px-8 sm:flex-column  sm:items-center md:px-20 lg:px-32 xl:px-40 2xl:px-48 py-8">
      შეამოწმე პროდუქტის თვითღირებულება AI-ს დახმარებით
      <section>
        <div>AI Weight Page</div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
          }}
        />
        {image && (
          <div className="flex items-baseline flex-col gap-4 mt-4">
            {price && <div>თვითღირებულება {price}₾ </div>}
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setImage(null)}>
              წაშლა
            </button>
            <img width={200} src={URL.createObjectURL(image)} alt="Selected" />
            <input
              className="p-3 border-1 border-red-500"
              type="number"
              placeholder="ჩინური ფასი"
              onChange={(e) => setChineesePrice(e.target.value)}
            />
            <button
              onClick={sentToAi}
              className="bg-primary text-white px-4 py-2 rounded mt-5">
              გაუგზავნე ხელოვნურ ინტელექტს
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
