"use client";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";
import { refreshProductsCache } from "@/app/actions/products";
import { addProduct, getAllProducts, type Product } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import { formatGel } from "@/lib/orders";

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

type Notice = { type: "success" | "error"; text: string } | null;

export default function DashboardProductsPage() {
  const t = useTranslations("admin");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const loadProducts = useCallback(() => {
    getAllProducts()
      .then((items) => {
        setProducts(items);
        setLoadError(false);
      })
      .catch((error: unknown) => {
        console.error("Error loading products:", error);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const numericPrice = Number(price);
    if (!trimmedName || !(numericPrice > 0) || !image) {
      setNotice({ type: "error", text: t("fillRequired") });
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      await addProduct(
        { name: trimmedName, price: numericPrice, description: description.trim() || undefined },
        image,
      );
      await refreshProductsCache();
      setNotice({ type: "success", text: t("added", { name: trimmedName }) });
      setName("");
      setPrice("");
      setDescription("");
      setImage(null);
      loadProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      setNotice({ type: "error", text: t("addError") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(t("deleteConfirm", { name: product.name }))) return;
    setDeletingId(product.id);
    setNotice(null);
    const { error } = await createClient().from("products").delete().eq("id", product.id);
    setDeletingId(null);
    if (error) {
      console.error("Error deleting product:", error.message);
      setNotice({ type: "error", text: t("deleteError") });
      return;
    }
    setProducts((current) => current?.filter((item) => item.id !== product.id) ?? null);
    await refreshProductsCache();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold md:text-3xl">{t("productsTitle")}</h1>

      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`rounded-xl border p-3 text-sm ${
            notice.type === "error"
              ? "border-red-500/60 bg-red-500/10 text-red-300"
              : "border-primary/60 bg-primary/10 text-primary"
          }`}>
          {notice.text}
        </p>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 xl:sticky xl:top-20">
          <h2 className="text-lg font-semibold">{t("addProductTitle")}</h2>

          <label className="flex flex-col gap-1.5 text-sm text-gray-300">
            {t("productName")}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("productNamePlaceholder")}
              className={inputClass}
              maxLength={120}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-gray-300">
            {t("productPrice")}
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="199"
              className={inputClass}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-gray-300">
            {t("productDescription")}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("productDescriptionPlaceholder")}
              rows={3}
              maxLength={1000}
              className={`${inputClass} resize-none`}
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm text-gray-300">
            {t("productImage")}
            <input
              type="file"
              id="product-image"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="product-image"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-gray-700 bg-gray-950/60 text-gray-400 transition hover:border-primary hover:text-primary">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <span className="flex min-h-36 flex-col items-center justify-center gap-2">
                  <FiImage className="text-3xl" />
                  {t("chooseImage")}
                </span>
              )}
            </label>
            {previewUrl && (
              <label htmlFor="product-image" className="cursor-pointer text-center text-xs text-primary hover:underline">
                {t("changeImage")}
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 cursor-pointer rounded-xl bg-primary font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60">
            {submitting ? t("adding") : t("add")}
          </button>
        </form>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="mb-4 text-lg font-semibold">
            {t("allProducts", { count: products?.length ?? 0 })}
          </h2>
          {loadError ? (
            <p className="text-red-300">{t("loadError")}</p>
          ) : products === null ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-gray-800/50" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-gray-400">{t("noProducts")}</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {products.map((product) => (
                <li key={product.id} className="flex items-center gap-4 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-950">
                    {product.image_url && (
                      <img src={product.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{product.name}</p>
                    <p className="text-sm font-semibold text-primary">{formatGel(product.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    aria-label={`${t("delete")}: ${product.name}`}
                    className="flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/40 px-3 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-60">
                    <FiTrash2 />
                    <span className="hidden sm:inline">{deletingId === product.id ? t("deleting") : t("delete")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
