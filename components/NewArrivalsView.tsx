"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

export default function NewArrivalsView({ products }: { products: Product[] | null }) {
  const t = useTranslations("newArrivals");
  const utilities = useTranslations("utilities");
  const tCart = useTranslations("cart");
  const locale = useLocale();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="text-gray-400">{t("subtitle")}</p>
      </header>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-10 text-center">
          <p className="text-gray-400">{products === null ? utilities("loadError") : utilities("noProducts")}</p>
          <Link
            href={`/${locale}/shop`}
            className="flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-white hover:bg-primary/90">
            {tCart("browse")}
          </Link>
        </div>
      )}
    </div>
  );
}
