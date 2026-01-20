"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { BiUpload } from "react-icons/bi";
import { useEffect, useState, memo } from "react";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Snowfall from "react-snowfall";
interface EstimatedPrice {
  productPriceGEL: number;
  shippingGEL: number;
  totalPriceGEL: number;
  estimatedWeightKg: number;
}
export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const locale = useLocale();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const [estimatedPrice, setEstimatedPrice] = useState<EstimatedPrice | null>(
    null,
  );
  const t = useTranslations("home");
  const utilities = useTranslations("utilities");
  useEffect(() => {
    setLoadingProducts(true);
    async function loadProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingProducts(false);
      }
      console.log(products);
    }
    loadProducts();
  }, []);
  async function handleEstimate() {
    if (!image) return;
    setLoadingEstimate(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      const response = await fetch("/api/ai/estimate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const parsed = JSON.parse(data.aiText);
      setEstimatedPrice(parsed);
      // console.log(data.productPriceGEL);
      console.log(estimatedPrice);
    } catch (err) {
      console.error("Error estimating price:", err);
    } finally {
      setLoadingEstimate(false);
    }
  }
  const MemoizedProductCard = memo(ProductCard);
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
                <MemoizedProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : loadingProducts ? (
            <p>{utilities("loadingProducts")}</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            <p>{utilities("noProducts")}</p>
          )}
          <h2>{t("aiTagline")}</h2>
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
              {utilities("uploadImage")}
            </label>
            {image && (
              <div className="flex flex-col  items-center gap-3">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded curpors-pointer hover:bg-red-600 transition"
                  onClick={() => {
                    setImage(null);
                    setEstimatedPrice(null);
                  }}>
                  {utilities("delete")}
                </button>
                <img
                  width={200}
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                />
                {loadingEstimate && image && <p>{utilities("estimating")}</p>}
                <button
                  disabled={loadingEstimate}
                  onClick={handleEstimate}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-secondary/90 transition cursor-pointer">
                  {utilities("estimatePrice")}
                </button>
                {estimatedPrice && (
                  <ul className="flex flex-col gap-2 mt-4">
                    <li className="text-sm md:text-base">
                      <span className="font-semibold">Product price:</span>{" "}
                      {estimatedPrice?.productPriceGEL} GEL
                    </li>
                    <li className="text-sm md:text-base">
                      <span className="font-semibold">Shipping:</span>{" "}
                      {estimatedPrice?.shippingGEL} GEL
                    </li>
                    <li className="text-sm md:text-base">
                      <span className="font-semibold">Total price:</span>{" "}
                      {estimatedPrice?.totalPriceGEL} GEL
                    </li>
                    <li className="text-sm md:text-base">
                      <span className="font-semibold">Estimated weight:</span>{" "}
                      {estimatedPrice?.estimatedWeightKg} kg
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
