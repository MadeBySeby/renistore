import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Product } from "./products";

export const PRODUCTS_TAG = "products";
const REVALIDATE_SECONDS = 300;

// Cookie-free client: product reads are public, so results can be cached and shared.
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await publicClient()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  ["products-all"],
  { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_TAG] },
);

export const getCachedProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const { data, error } = await publicClient()
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  ["product-by-slug"],
  { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_TAG] },
);
