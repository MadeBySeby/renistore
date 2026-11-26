export const ORDER_STATUSES = ["new", "contacted", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  product_id?: number;
  kind?: "estimate";
  name: string;
  slug?: string;
  image_url?: string | null;
  price: number;
  quantity: number;
  size?: string | null;
}

export interface Order {
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

export const orderStatusStyles: Record<OrderStatus, string> = {
  new: "border-primary/60 bg-primary/10 text-primary",
  contacted: "border-sky-500/60 bg-sky-500/10 text-sky-300",
  completed: "border-gray-600 bg-gray-800 text-gray-300",
  cancelled: "border-red-500/60 bg-red-500/10 text-red-300",
};

export function formatGel(value: number): string {
  return `${Number(value).toFixed(2)} ₾`;
}

export function orderDateFormatter(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
