"use client";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const STATUSES = ["new", "contacted", "completed", "cancelled"] as const;
type OrderStatus = (typeof STATUSES)[number];

interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
  note: string | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
}

const statusStyles: Record<OrderStatus, string> = {
  new: "border-primary/60 bg-primary/10 text-primary",
  contacted: "border-sky-500/60 bg-sky-500/10 text-sky-300",
  completed: "border-gray-600 bg-gray-800 text-gray-300",
  cancelled: "border-red-500/60 bg-red-500/10 text-red-300",
};

export default function OrdersPage() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [updateError, setUpdateError] = useState(false);

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

  const dateFormatter = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {updateError && (
        <div role="alert" className="rounded-md border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-400">
          {t("updateError")}
        </div>
      )}

      {loadError ? (
        <p className="text-red-400">{t("loadError")}</p>
      ) : orders === null ? (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-primary" />
      ) : orders.length === 0 ? (
        <p className="text-gray-400">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-gray-800 bg-gray-900/80 p-5">
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
                    {order.items.map((item) => (
                      <li key={item.product_id} className="flex justify-between gap-4">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-gray-300">{(Number(item.price) * item.quantity).toFixed(2)} ₾</span>
                      </li>
                    ))}
                  </ul>
                  <p className="flex justify-between border-t border-gray-800 pt-2 font-bold">
                    <span>{t("total")}</span>
                    <span className="text-primary">{Number(order.total).toFixed(2)} ₾</span>
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
