"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { BiUpload } from "react-icons/bi";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Snowfall from "react-snowfall";
export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const locale = useLocale();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("home");
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAllProducts();
        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      console.log(products);
    }
    loadProducts();
  }, []);
  async function handleEstimate() {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);
    const response = await fetch("/api/estimate-price", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log(data);
  }
  return (
    <>
      <Snowfall color="#82C3D9" />
      <div className="p-5 flex flex-col  p-5 gap-5 ">
        <div className="flex flex-col md:flex-row gap-5 w-full">
          <div className=" relative w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[500px]">
            <Image
              src="/heromg.png"
              alt="Hero banner showcasing featured products or promotional content for the stzore"
              fill
              className=" object-cover opacity-50"
            />
          </div>
          <div className="flex flex-col w-full md:w-1/2 items-start gap-10 ">
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {t("subtitlePart1")} <br />
              {t("subtitlePart2")},
              <br />
              {t("subtitlePart3")}
            </h1>
            <ul className="flex flex-col gap-2">
              <li>{t("features.quality")}</li>
              <li>{t("features.delivery")}</li>
              <li>{t("features.shipping")}</li>
            </ul>
            <div className="flex  flex-row gap-4 mt-10 justify-center items-center">
              <Link
                href={`/${locale}/shop`}
                className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition active:scale-95 touch-manipulation">
                {t("shopNow")}
              </Link>
              <Link href={`/${locale}/new-arrivals`}>
                <button className=" text-white px-4 py-2 rounded border-1 border-primary">
                  {t("newDrops")}
                </button>
              </Link>
            </div>
          </div>
        </div>
        <section className="w-full  flex flex-col md:flex-col items-center gap-5 mt-10">
          {products.length > 0 ? (
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            <p>No products available.</p>
          )}
          <h2>ატვირთე ნებისმიერი პროდუქტი გაიგე ფასი და გამოიწერე!</h2>
          <div className="relative flex flex-col md:flex-row items-center gap-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded cursor-pointer hover:bg-primary/90 transition">
              <BiUpload size={20} />
              Choose File
            </label>
            {image && (
              <div className="flex flex-col  items-center gap-3">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded curpors-pointer hover:bg-red-600 transition"
                  onClick={() => setImage(null)}>
                  წაშლა
                </button>
                <img
                  width={200}
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                />
                <button
                  onClick={handleEstimate}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-secondary/90 transition cursor-pointer">
                  Estimate Price
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
