"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useLocale } from "next-intl";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import { IoCart } from "react-icons/io5";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import type { Product } from "@/lib/products";

function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function deleteProduct() {
    setDeleting(true);
    try {
      const { error } = await createClient().from("products").delete().eq("id", product.id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/80 transition hover:border-primary/60">
      <Link href={`/${locale}/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="aspect-square w-full overflow-hidden bg-gray-950">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-base font-semibold text-white">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between">
            <p className="font-bold text-primary">{Number(product.price).toFixed(2)} ₾</p>
            <IoCart className="text-2xl text-primary" aria-hidden />
          </div>
        </div>
      </Link>
      {isAdmin && (
        <button
          className="flex cursor-pointer items-center justify-center gap-2 border-t border-gray-800 p-3 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-60"
          disabled={deleting}
          onClick={deleteProduct}>
          <MdDelete className="text-xl" />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      )}
    </div>
  );
}

export default memo(ProductCard);
