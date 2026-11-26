"use client";
import { useCart } from "@/app/context/CartContext";
import SizePicker from "@/components/SizePicker";
import { isSoldOut, productSizes, type Product } from "@/lib/products";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { IoCart, IoCheckmark } from "react-icons/io5";

export default function AddToCartButton({ product }: { product: Product }) {
  const t = useTranslations("cart");
  const tProduct = useTranslations("product");
  const locale = useLocale();
  const { addItem } = useCart();
  const sizes = useMemo(() => productSizes(product), [product]);
  const needsSize = sizes.length > 0;
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const soldOut = isSoldOut(product);

  const handleAdd = useCallback(() => {
    if (soldOut) return;
    if (needsSize && !size) {
      setNeedSize(true);
      return;
    }
    addItem(product, size ?? undefined);
    setAdded(true);
    setNeedSize(false);
  }, [addItem, needsSize, product, size, soldOut]);

  const handleSize = useCallback((next: string) => {
    setSize(next);
    setNeedSize(false);
    setAdded(false);
  }, []);

  return (
    <div className="mt-2 flex flex-col gap-3">
      {needsSize && <SizePicker product={product} value={size} onChange={handleSize} />}
      {soldOut ? (
        <p className="text-sm font-semibold text-red-400">{tProduct("soldOut")}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
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
      )}
      {needSize && <p className="text-sm text-red-400">{tProduct("pickSize")}</p>}
    </div>
  );
}
