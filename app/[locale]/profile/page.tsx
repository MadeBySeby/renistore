"use client";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { formatGel, orderDateFormatter, orderStatusStyles, type Order } from "@/lib/orders";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiMail, FiShoppingBag, FiUser } from "react-icons/fi";

type MyOrder = Pick<Order, "id" | "items" | "total" | "status" | "created_at">;

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const t = useTranslations("profile");
  const tOrders = useTranslations("orders");
  const locale = useLocale();
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [ordersError, setOrdersError] = useState(false);

  useEffect(() => {
    if (!user && !loading) router.replace(`/${locale}/login`);
  }, [user, loading, locale, router]);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    createClient()
      .from("orders")
      .select("id, items, total, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Error loading my orders:", error.message);
          setOrdersError(true);
          return;
        }
        setOrders((data ?? []) as MyOrder[]);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const dateFormatter = useMemo(() => orderDateFormatter(locale), [locale]);

  async function handleNameChange() {
    if (!user) return;
    setSaving(true);
    setSaveError(false);
    const { error } = await createClient().from("profiles").update({ name: name.trim() }).eq("id", user.id);
    setSaving(false);
    if (error) {
      console.error("Error updating name:", error.message);
      setSaveError(true);
      return;
    }
    await refreshProfile();
    setModal(false);
  }

  function closeModal() {
    setName(profile?.name ?? "");
    setSaveError(false);
    setModal(false);
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <section className="grid gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl bg-gray-950/60 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <FiMail />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">{t("email")}</p>
            <p className="truncate text-white">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-gray-950/60 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <FiUser />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400">{t("name")}</p>
            <p className="truncate text-white">{profile?.name || "—"}</p>
          </div>
          <button
            type="button"
            onClick={() => setModal(true)}
            aria-label={t("changeName")}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-700 text-gray-300 transition hover:border-primary hover:text-primary">
            <FiEdit2 />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="mb-4 text-lg font-semibold">{t("myOrders")}</h2>
        {ordersError ? (
          <p className="text-red-300">{t("ordersError")}</p>
        ) : orders === null ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-gray-800/50" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <FiShoppingBag className="text-3xl text-gray-500" />
            <p className="text-gray-400">{t("noOrders")}</p>
            <Link
              href={`/${locale}/shop`}
              className="flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-white hover:bg-primary/90">
              {t("shopNow")}
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl bg-gray-950/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {t("order")} #{order.id}
                    </p>
                    <p className="text-xs text-gray-500">{dateFormatter.format(new Date(order.created_at))}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${orderStatusStyles[order.status]}`}>
                    {tOrders(`statuses.${order.status}`)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {order.items
                    .map((item) => `${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity}`)
                    .join(", ")}
                </p>
                <p className="mt-1 text-right font-semibold text-primary">{formatGel(order.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-name-title"
            className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 id="change-name-title" className="mb-4 text-xl font-bold text-white">
              {t("changeName")}
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder={t("namePlaceholder")}
              autoFocus
            />
            {saveError && <p className="mb-2 text-sm text-red-300">{t("saveError")}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="min-h-11 cursor-pointer rounded-lg px-4 text-gray-300 hover:bg-gray-800">
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleNameChange}
                disabled={saving || !name.trim()}
                className="min-h-11 cursor-pointer rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
