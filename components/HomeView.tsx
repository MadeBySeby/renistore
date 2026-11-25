"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { BiUpload } from "react-icons/bi";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import { compressImage } from "@/lib/compress-image";
import Snowfall from "react-snowfall";

interface EstimatedPrice {
  productPriceGEL: number;
  shippingGEL: number;
  totalPriceGEL: number;
  estimatedWeightKg: number;
}

type MatchedProduct = Pick<Product, "id" | "name" | "slug" | "price" | "image_url">;

interface EstimateResponse {
  estimate?: EstimatedPrice;
  matchedProduct?: MatchedProduct;
}

export default function HomeView({ products }: { products: Product[] | null }) {
  const [image, setImage] = useState<File | null>(null);
  const locale = useLocale();
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [estimateError, setEstimateError] = useState<"estimateError" | "unsupportedImage" | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<EstimatedPrice | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<MatchedProduct | null>(null);
  const t = useTranslations("home");
  const utilities = useTranslations("utilities");

  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleEstimate() {
    if (!image) return;
    setLoadingEstimate(true);
    setEstimateError(null);
    setEstimatedPrice(null);
    setMatchedProduct(null);
    try {
      const formData = new FormData();
      formData.append("image", await compressImage(image));
      const response = await fetch("/api/ai/estimate", {
        method: "POST",
        body: formData,
      });
      if (response.status === 413 || response.status === 415) {
        setEstimateError("unsupportedImage");
        return;
      }
      if (!response.ok) throw new Error(`Estimate failed with status ${response.status}`);
      const data = (await response.json()) as EstimateResponse;
      if (data.matchedProduct) setMatchedProduct(data.matchedProduct);
      else if (data.estimate) setEstimatedPrice(data.estimate);
      else throw new Error("Empty estimate response");
    } catch (err) {
      console.error("Error estimating price:", err);
      setEstimateError("estimateError");
    } finally {
      setLoadingEstimate(false);
    }
  }

  function clearImage() {
    setImage(null);
    setEstimatedPrice(null);
    setMatchedProduct(null);
    setEstimateError(null);
  }

  return (
    <>
      <Snowfall color="#82C3D9" />
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-8 md:px-8 md:py-12">
        <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-gray-800 sm:h-[400px] md:h-[500px]">
            <Image
              src="/heromg.png"
              alt="ReniStore streetwear"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-85"
            />
          </div>
          <div className="flex flex-col items-start gap-8">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {t("subtitlePart1")} <span className="text-primary">{t("subtitlePart2")}</span>,
              <br />
              {t("subtitlePart3")}
            </h1>
            <ul className="flex flex-col items-start gap-3 text-gray-300">
              <li>{t("features.quality")}</li>
              <li>{t("features.delivery")}</li>
              <li>{t("features.shipping")}</li>
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/${locale}/shop`}
                className="rounded-md bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90 active:scale-95">
                {t("shopNow")}
              </Link>
              <Link
                href={`/${locale}/new-arrivals`}
                className="rounded-md border border-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/10 active:scale-95">
                {t("newDrops")}
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full">
          {products && products.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              {products === null ? utilities("loadError") : utilities("noProducts")}
            </p>
          )}
        </section>

        <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center md:p-10">
          <h2 className="text-xl font-semibold md:text-2xl">{t("aiTagline")}</h2>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          {!image && (
            <label
              htmlFor="file-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90">
              <BiUpload size={20} />
              {utilities("uploadImage")}
            </label>
          )}
          {image && previewUrl && (
            <div className="flex w-full flex-col items-center gap-4">
              <img
                src={previewUrl}
                alt={image.name}
                className="max-h-64 rounded-lg border border-gray-800 object-contain"
              />
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  disabled={loadingEstimate}
                  onClick={handleEstimate}
                  className="cursor-pointer rounded-md bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60">
                  {loadingEstimate ? utilities("estimating") : utilities("estimatePrice")}
                </button>
                <button
                  onClick={clearImage}
                  className="cursor-pointer rounded-md border border-red-500/60 px-5 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/10">
                  {utilities("delete")}
                </button>
              </div>
              {estimateError && (
                <p className="text-sm text-red-400">{utilities(estimateError)}</p>
              )}
              {matchedProduct && (
                <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-primary/50 bg-primary/10 p-4 text-left">
                  <p className="font-semibold text-primary">{t("inStockTitle")}</p>
                  <Link href={`/${locale}/product/${matchedProduct.slug}`} className="flex items-center gap-3">
                    {matchedProduct.image_url && (
                      <img
                        src={matchedProduct.image_url}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-md border border-gray-800 object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-white">{matchedProduct.name}</span>
                      <span className="block text-lg font-bold text-primary">
                        {Number(matchedProduct.price).toFixed(2)} ₾
                      </span>
                    </span>
                  </Link>
                  <p className="text-sm text-gray-300">{t("inStockBody")}</p>
                  <AddToCartButton product={matchedProduct} />
                </div>
              )}
              {estimatedPrice && (
                <ul className="flex w-full max-w-sm flex-col gap-2 rounded-lg bg-gray-950/70 p-4 text-left text-sm md:text-base">
                  <li className="flex justify-between gap-4">
                    <span className="text-gray-400">Product price</span>
                    <span>{estimatedPrice.productPriceGEL} GEL</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="text-gray-400">Shipping</span>
                    <span>{estimatedPrice.shippingGEL} GEL</span>
                  </li>
                  <li className="flex justify-between gap-4 font-semibold">
                    <span>Total price</span>
                    <span className="text-primary">{estimatedPrice.totalPriceGEL} GEL</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="text-gray-400">Estimated weight</span>
                    <span>{estimatedPrice.estimatedWeightKg} kg</span>
                  </li>
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
