"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import { FiArrowRight, FiClock, FiDollarSign, FiPackage, FiPlus, FiShoppingBag } from "react-icons/fi";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { formatGel, orderDateFormatter, orderStatusStyles, type Order } from "@/lib/orders";

type OrderSummary = Pick<Order, "id" | "customer_name" | "total" | "status" | "created_at">;

interface DashboardData {
  orders: OrderSummary[];
  productCount: number;
}

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: IconType }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("admin");
  const tOrders = useTranslations("orders");
  const locale = useLocale();
  const { profile, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    Promise.all([
      supabase.from("orders").select("id, customer_name, total, status, created_at").order("created_at", { ascending: false }),
      supabase.from("products").select("id", { count: "exact", head: true }),
    ]).then(([ordersResult, productsResult]) => {
      if (!active) return;
      if (ordersResult.error || productsResult.error) {
        console.error("Error loading dashboard:", ordersResult.error?.message ?? productsResult.error?.message);
        setLoadError(true);
        return;
      }
      setData({ orders: (ordersResult.data ?? []) as OrderSummary[], productCount: productsResult.count ?? 0 });
    });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    const newOrders = data.orders.filter((order) => order.status === "new").length;
    const revenue = data.orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total), 0);
    return { newOrders, revenue, recent: data.orders.slice(0, 5) };
  }, [data]);

  const dateFormatter = useMemo(() => orderDateFormatter(locale), [locale]);
  const displayName = profile?.name || user?.email?.split("@")[0] || "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t("overviewTitle")}</h1>
        {displayName && <p className="mt-1 text-gray-400">{t("welcome", { name: displayName })}</p>}
      </div>

      {loadError ? (
        <p role="alert" className="rounded-xl border border-red-500/60 bg-red-500/10 p-4 text-red-300">
          {t("loadError")}
        </p>
      ) : !data || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-gray-800 bg-gray-900/60" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("newOrders")} value={String(stats.newOrders)} icon={FiClock} />
            <StatCard label={t("totalOrders")} value={String(data.orders.length)} icon={FiShoppingBag} />
            <StatCard label={t("revenue")} value={formatGel(stats.revenue)} hint={t("revenueHint")} icon={FiDollarSign} />
            <StatCard label={t("products")} value={String(data.productCount)} icon={FiPackage} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{t("recentOrders")}</h2>
                <Link
                  href={`/${locale}/dashboard/orders`}
                  className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {t("viewAll")} <FiArrowRight />
                </Link>
              </div>
              {stats.recent.length === 0 ? (
                <p className="py-8 text-center text-gray-400">{t("noOrders")}</p>
              ) : (
                <ul className="divide-y divide-gray-800">
                  {stats.recent.map((order) => (
                    <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-medium">
                          #{order.id} · {order.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">{dateFormatter.format(new Date(order.created_at))}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${orderStatusStyles[order.status]}`}>
                          {tOrders(`statuses.${order.status}`)}
                        </span>
                        <span className="font-semibold text-white">{formatGel(order.total)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
              <h2 className="text-lg font-semibold">{t("quickActions")}</h2>
              <Link
                href={`/${locale}/dashboard/products`}
                className="flex min-h-12 items-center gap-3 rounded-xl bg-primary px-4 font-semibold text-white transition hover:bg-primary/90">
                <FiPlus className="text-lg" /> {t("addProduct")}
              </Link>
              <Link
                href={`/${locale}/dashboard/orders`}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-gray-700 px-4 font-medium text-gray-200 transition hover:border-primary hover:text-white">
                <FiShoppingBag className="text-lg" /> {t("manageOrders")}
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
