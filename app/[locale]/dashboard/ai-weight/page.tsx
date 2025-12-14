"use client";
import React, { useMemo, useState } from "react";
export default function AiWeightPage() {
  const [image, setImage] = useState<File | null>(null);
  const [weight, setWeight] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [chineesePrice, setChineesePrice] = useState<string | null>(null);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [sellingPrice, setSellingPrice] = useState<string | null>(null);
  async function sentToAi() {
    if (!image) return;
    const formdata = new FormData();
    formdata.append("image", image);
    // formdata.append("chineesePrice", chineesePrice || "");
    const res = await fetch("/api/ai", {
      method: "POST",
      body: formdata,
    });
    const data = await res.json();
    console.log("AI Response:", data);
    setWeight(data.estimatedWeightKg?.toString() || null);
    // setPrice(data.finalPriceGEL?.toString() || null);
  }
  // const calculatedPrice = useMemo(() => {
  //   if (!weight || !chineesePrice) return null;
  //   const priceInYuan = parseFloat(chineesePrice);
  //   const weightKg = parseFloat(weight);
  //   const finalPrice = priceInYuan * 0.38 + weightKg * 21.56;
  //   return finalPrice.toFixed(2);
  // }, [weight, chineesePrice]);
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
            {buttonClicked && !weight ? (
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
                sentToAi();
                setButtonClicked(true);
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
