"use client";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import {
  ORDER_STATUSES as STATUSES,
  formatGel,
  orderDateFormatter,
  orderStatusStyles as statusStyles,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

type StatusFilter = OrderStatus | "all";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let active = true;
    createClient()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Error loading orders:", error.message);
          setLoadError(true);
          return;
        }
        setOrders((data ?? []) as Order[]);
      });
    return () => {
      active = false;
    };
  }, []);

  async function updateStatus(orderId: number, status: OrderStatus) {
    setUpdateError(false);
    const previous = orders;
    setOrders((current) =>
      current?.map((order) => (order.id === orderId ? { ...order, status } : order)) ?? null,
    );
    const { error } = await createClient().from("orders").update({ status }).eq("id", orderId);
    if (error) {
      console.error("Error updating order:", error.message);
      setOrders(previous);
      setUpdateError(true);
    }
  }

  const dateFormatter = useMemo(() => orderDateFormatter(locale), [locale]);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = { all: 0, new: 0, contacted: 0, completed: 0, cancelled: 0 };
    for (const order of orders ?? []) {
      result.all += 1;
      result[order.status] += 1;
    }
    return result;
  }, [orders]);

  const visibleOrders = useMemo(
    () => (filter === "all" ? orders : orders?.filter((order) => order.status === filter)) ?? null,
    [orders, filter],
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>

      {orders && orders.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="tablist">
          {(["all", ...STATUSES] as StatusFilter[]).map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={filter === status}
              onClick={() => setFilter(status)}
              className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                filter === status
                  ? "border-primary bg-primary text-white"
                  : "border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
              }`}>
              {status === "all" ? tAdmin("filterAll") : t(`statuses.${status}`)}
              <span className={`rounded-full px-2 text-xs ${filter === status ? "bg-white/20" : "bg-gray-800"}`}>
                {counts[status]}
              </span>
            </button>
          ))}
        </div>
      )}

      {updateError && (
        <div role="alert" className="rounded-md border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-400">
          {t("updateError")}
        </div>
      )}

      {loadError ? (
        <p className="text-red-400">{t("loadError")}</p>
      ) : orders === null || visibleOrders === null ? (
        <div className="space-y-4" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl border border-gray-800 bg-gray-900/60" />
          ))}
        </div>
      ) : visibleOrders.length === 0 ? (
        <p className="rounded-2xl border border-gray-800 bg-gray-900/60 p-10 text-center text-gray-400">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visibleOrders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {t("order")} #{order.id}
                  </p>
                  <p className="text-sm text-gray-400">{dateFormatter.format(new Date(order.created_at))}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className="sr-only">{t("status")}</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    className={`min-h-11 cursor-pointer rounded-md border px-3 font-semibold ${statusStyles[order.status]}`}>
                    {STATUSES.map((status) => (
                      <option key={status} value={status} className="bg-gray-900 text-white">
                        {t(`statuses.${status}`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">{t("customer")}</p>
                  <p className="font-semibold">{order.customer_name}</p>
                  <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`} className="block text-primary hover:underline">
                    {order.phone}
                  </a>
                  {order.email && (
                    <a href={`mailto:${order.email}`} className="block text-gray-300 hover:underline">
                      {order.email}
                    </a>
                  )}
                  {(order.city || order.address) && (
                    <p className="text-gray-300">{[order.city, order.address].filter(Boolean).join(", ")}</p>
                  )}
                  {order.note && (
                    <p className="text-gray-300">
                      <span className="text-gray-400">{t("note")}:</span> {order.note}
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">{t("items")}</p>
                  <ul className="space-y-1">
                    {order.items.map((item, index) => (
                      <li key={`${item.product_id ?? "estimate"}-${item.size ?? ""}-${index}`} className="flex justify-between gap-4">
                        <span>
                          {item.name}
                          {item.size ? ` (${item.size})` : ""}
                          {item.kind === "estimate" ? " · AI" : ""} × {item.quantity}
                        </span>
                        <span className="text-gray-300">{formatGel(Number(item.price) * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="flex justify-between border-t border-gray-800 pt-2 font-bold">
                    <span>{t("total")}</span>
                    <span className="text-primary">{formatGel(order.total)}</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
