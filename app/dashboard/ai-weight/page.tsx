"use client";
import React, { useState } from "react";

export default function AiWeightPage() {
  const [image, setImage] = useState<File | null>(null);
  return (
    <div>
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
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setImage(null)}>
              წაშლა
            </button>
            <img width={200} src={URL.createObjectURL(image)} alt="Selected" />
            <button
              onClick={() => {}}
              className="bg-primary text-white px-4 py-2 rounded mt-5">
              გაუგზავნე ხელოვნურ ინტელექტს
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
