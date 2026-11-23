"use client";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/products";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function ShopPage() {
  const t = useTranslations("shop");
  const utilities = useTranslations("utilities");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await createClient()
          .from("products")
          .select("*")
          .ilike("name", `%${search}%`)
          .order("id", { ascending: true });
        if (error) throw error;
        if (!active) return;
        setData(data || []);
        setLoadError(false);
      } catch (err) {
        console.error("Error loading products:", err);
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [search]);

  const emptyMessage = loading
    ? utilities("loadingProducts")
    : loadError
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
      {data.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-gray-400">{emptyMessage}</p>
      )}
    </div>
  );
}
