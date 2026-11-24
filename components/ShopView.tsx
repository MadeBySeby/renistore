"use client";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";
import { useTranslations } from "next-intl";
import React, { useDeferredValue, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function ShopView({ products }: { products: Product[] | null }) {
  const t = useTranslations("shop");
  const utilities = useTranslations("utilities");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const visible = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!products) return [];
    if (!query) return products;
    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, deferredSearch]);

  const emptyMessage =
    products === null
      ? utilities("loadError")
      : search
        ? utilities("noResults")
        : utilities("noProducts");

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">{t("allProducts")}</h1>
        <label htmlFor="searchBar" className="relative w-full sm:w-72">
          <span className="sr-only">{utilities("search")}</span>
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="h-11 w-full rounded-md border border-gray-700 bg-gray-950 pl-10 pr-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            id="searchBar"
            placeholder={utilities("searchPlaceholder")}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {visible.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {visible.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-gray-400">{emptyMessage}</p>
      )}
    </div>
  );
}
