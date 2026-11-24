"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import { IoCart, IoCheckmark } from "react-icons/io5";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { refreshProductsCache } from "@/app/actions/products";

function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("cart");
  const { isAdmin } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = useCallback(() => {
    addItem(product);
    setJustAdded(true);
  }, [addItem, product]);

  async function deleteProduct() {
    setDeleting(true);
    try {
      const { error } = await createClient().from("products").delete().eq("id", product.id);
      if (error) throw error;
      await refreshProductsCache();
      router.refresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/80 transition hover:border-primary/60">
      <Link href={`/${locale}/product/${product.slug}`} className="flex flex-col">
        <div className="aspect-square w-full overflow-hidden bg-gray-950">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              width={800}
              height={800}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <h3 className="line-clamp-2 px-4 pt-4 text-base font-semibold text-white">{product.name}</h3>
      </Link>
      <div className="mt-auto flex items-center justify-between gap-2 p-4 pt-2">
        <p className="font-bold text-primary">{Number(product.price).toFixed(2)} ₾</p>
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`${t("addToCart")}: ${product.name}`}
          className="flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary/50 px-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-95">
          {justAdded ? <IoCheckmark className="text-xl" /> : <IoCart className="text-xl" />}
          <span className="hidden sm:inline">{justAdded ? t("added") : t("addToCart")}</span>
        </button>
      </div>
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
