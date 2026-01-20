"use client";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/client";
import React, { memo, useEffect, useMemo, useState } from "react";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .ilike("name", `%${search}%`)
          .order("id", { ascending: true });
        setData(data || []);
        setError(error);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, supabase]);
  const MemorizedProducts = memo(ProductCard);
  return (
    <div className="min-h-screen w-full flex flex-col gap-4  p-6">
      <div className="flex items-center mt-0 mb-0 gap-2 justify-center ">
        <label htmlFor="searchBar">Search</label>
        <input
          className="h-10 w-64 border border-gray-300 rounded-md p-2"
          id="searchBar"
          placeholder="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data?.length > 0 ? (
        <ul className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((product) => (
            <MemorizedProducts key={product.id} product={product} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-gray-600">{`${loading ? "Loading..." : "No products found."}`}</p>
      )}
    </div>
  );
}
