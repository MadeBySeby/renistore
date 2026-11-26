"use client";
import { useTranslations } from "next-intl";
import { LOW_STOCK_LIMIT, productSizes, type Product } from "@/lib/products";

export default function SizePicker({
  product,
  value,
  onChange,
}: {
  product: Pick<Product, "sizes">;
  value: string | null;
  onChange: (size: string) => void;
}) {
  const t = useTranslations("product");
  const sizes = productSizes(product);
  if (sizes.length === 0) return null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-gray-300">{t("size")}</legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((entry) => {
          const soldOut = entry.stock <= 0;
          const selected = value === entry.size;
          return (
            <button
              key={entry.size}
              type="button"
              disabled={soldOut}
              aria-pressed={selected}
              onClick={() => onChange(entry.size)}
              className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-semibold transition ${
                soldOut
                  ? "cursor-not-allowed border-gray-800 text-gray-600 line-through"
                  : selected
                    ? "border-primary bg-primary text-white"
                    : "cursor-pointer border-gray-700 text-gray-200 hover:border-primary"
              }`}>
              {entry.size}
            </button>
          );
        })}
      </div>
      {value &&
        (() => {
          const stock = sizes.find((entry) => entry.size === value)?.stock ?? 0;
          if (stock <= 0) return null;
          if (stock <= LOW_STOCK_LIMIT) {
            return <p className="text-sm font-medium text-red-400">{t("onlyLeft", { count: stock })}</p>;
          }
          return <p className="text-sm text-gray-400">{t("inStock", { count: stock })}</p>;
        })()}
    </fieldset>
  );
}
