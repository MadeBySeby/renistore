"use client";
import { useCart } from "@/app/context/CartContext";
import type { Product } from "@/lib/products";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useState } from "react";
import { IoCart, IoCheckmark } from "react-icons/io5";

export default function AddToCartButton({ product }: { product: Product }) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = useCallback(() => {
    addItem(product);
    setAdded(true);
  }, [addItem, product]);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90 active:scale-95">
        {added ? <IoCheckmark className="text-xl" /> : <IoCart className="text-xl" />}
        {added ? t("added") : t("addToCart")}
      </button>
      {added && (
        <Link
          href={`/${locale}/cart`}
          className="inline-flex min-h-11 items-center rounded-md border border-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/10">
          {t("viewCart")}
        </Link>
      )}
    </div>
  );
}
