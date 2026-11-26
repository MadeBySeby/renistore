"use client";
import { useAuth } from "@/app/context/AuthContext";
import { cartLineKey, useCart } from "@/app/context/CartContext";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";

const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;

const inputClass =
  "w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

function orderErrorKey(message: string) {
  if (message.includes("invalid_name")) return "invalidName";
  if (message.includes("invalid_phone")) return "invalidPhone";
  if (message.includes("product_unavailable")) return "productUnavailable";
  if (message.includes("size_required") || message.includes("size_unavailable")) return "sizeRequired";
  if (message.includes("not_enough_stock")) return "notEnoughStock";
  if (message.includes("invalid_estimate")) return "orderError";
  return "orderError";
}

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { user, profile } = useAuth();
  const { items, total, ready, setQuantity, removeItem, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.name) setName((current) => current || profile.name || "");
    if (user?.email) setEmail((current) => current || user.email || "");
  }, [profile, user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError(t("invalidName"));
    if (!PHONE_PATTERN.test(phone.trim())) return setError(t("invalidPhone"));

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          customer: { name, phone, email, city, address, note },
          items: items.map((item) =>
            item.estimate
              ? {
                  kind: "estimate",
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image_url: item.imageUrl?.startsWith("http") ? item.imageUrl : undefined,
                  estimate: item.estimate,
                }
              : {
                  product_id: Number(item.productId),
                  quantity: item.quantity,
                  size: item.size,
                },
          ),
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { id?: number; error?: string; emailSent?: boolean };
      if (!response.ok || typeof result.id !== "number") {
        console.error("Order failed:", result.error ?? response.status);
        setError(t(orderErrorKey(result.error ?? "")));
        return;
      }
      setOrderId(result.id);
      setConfirmationEmail(result.emailSent ? email.trim() : null);
      clear();
    } catch (err) {
      console.error("Order failed:", err);
      setError(t("orderError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId !== null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-800 bg-gray-900/80 p-8 text-center shadow-xl">
          <IoCheckmarkCircle className="mx-auto text-6xl text-primary" aria-hidden />
          <h1 className="text-2xl font-bold">{t("successTitle")}</h1>
          <p className="text-gray-300">{t("successBody", { id: orderId })}</p>
          {confirmationEmail && (
            <p className="text-sm text-gray-400">{t("emailSent", { email: confirmationEmail })}</p>
          )}
          <Link
            href={`/${locale}/shop`}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90">
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="min-h-[70vh]" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">{t("empty")}</h1>
        <p className="text-gray-400">{t("emptyHint")}</p>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90">
          {t("browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_400px]">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const key = cartLineKey(item);
            const maxQty = item.maxQuantity ?? 20;
            const href = item.estimate ? null : `/${locale}/product/${item.slug}`;
            const thumb = item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gray-950" />
            );
            return (
              <li key={key} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/80 p-3">
                {href ? (
                  <Link href={href} className="shrink-0">
                    {thumb}
                  </Link>
                ) : (
                  <div className="shrink-0">{thumb}</div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {href ? (
                    <Link href={href} className="truncate font-semibold hover:text-primary">
                      {item.name}
                    </Link>
                  ) : (
                    <p className="truncate font-semibold">{item.name}</p>
                  )}
                  {(item.size || item.estimate) && (
                    <p className="text-sm text-gray-400">
                      {item.size ? `${t("size")}: ${item.size}` : null}
                      {item.size && item.estimate ? " · " : null}
                      {item.estimate ? t("aiEstimate") : null}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center rounded-md border border-gray-700">
                      <button
                        type="button"
                        aria-label={t("decrease")}
                        disabled={item.quantity <= 1}
                        onClick={() => setQuantity(key, item.quantity - 1)}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center text-gray-300 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
                        <FiMinus />
                      </button>
                      <span className="w-8 text-center font-semibold" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={t("increase")}
                        disabled={item.quantity >= maxQty}
                        onClick={() => setQuantity(key, item.quantity + 1)}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center text-gray-300 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
                        <FiPlus />
                      </button>
                    </div>
                    <span className="font-bold text-primary">{(item.price * item.quantity).toFixed(2)} ₾</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`${t("remove")}: ${item.name}`}
                  onClick={() => removeItem(key)}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 hover:bg-red-500/10 hover:text-red-400">
                  <FiTrash2 />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <form
        onSubmit={handleSubmit}
        className="flex h-fit flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900/80 p-6 lg:sticky lg:top-24">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{t("detailsTitle")}</h2>
          <p className="text-sm text-gray-400">{t("detailsHint")}</p>
        </div>

        {error && (
          <div role="alert" className="rounded-md border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
          {t("name")}
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            autoComplete="name"
            maxLength={100}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
          {t("phone")}
          <input
            className={inputClass}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phonePlaceholder")}
            autoComplete="tel"
            maxLength={20}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
          {t("email")}
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={200}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
            {t("city")}
            <input
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("cityPlaceholder")}
              autoComplete="address-level2"
              maxLength={100}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
            {t("address")}
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("addressPlaceholder")}
              autoComplete="street-address"
              maxLength={300}
              required
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
          {t("note")}
          <textarea
            className={`${inputClass} min-h-20 resize-y`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("notePlaceholder")}
            maxLength={1000}
          />
        </label>

        <div className="flex items-center justify-between border-t border-gray-800 pt-4 text-lg font-bold">
          <span>{t("total")}</span>
          <span className="text-primary">{total.toFixed(2)} ₾</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full cursor-pointer rounded-md bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? t("placing") : t("checkout")}
        </button>
      </form>
    </div>
  );
}
