import type { OrderItem } from "./orders";

export interface PlacedOrder {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
  note: string | null;
  items: OrderItem[];
  total: number;
  created_at: string;
}

type EmailLocale = "en" | "ka";

const copy = {
  en: {
    customerSubject: (id: number) => `ReniStore — we received your order #${id}`,
    greeting: (name: string) => `Thank you, ${name}!`,
    received: (id: number) => `We received your order <strong>#${id}</strong>. No payment is needed now.`,
    nextStep: (phone: string) => `We will call you at <strong>${phone}</strong> soon to confirm the order and delivery.`,
    item: "Item",
    qty: "Qty",
    price: "Price",
    total: "Total",
    delivery: "Delivery address",
    note: "Note",
    questions: "Questions? Just reply to this email or call +995 558 200 609.",
    ownerSubject: (id: number, name: string) => `New order #${id} from ${name}`,
    ownerIntro: "A new order was placed on renistore.ge.",
    customer: "Customer",
  },
  ka: {
    customerSubject: (id: number) => `ReniStore — თქვენი შეკვეთა #${id} მიღებულია`,
    greeting: (name: string) => `გმადლობთ, ${name}!`,
    received: (id: number) => `თქვენი შეკვეთა <strong>#${id}</strong> მიღებულია. ახლა გადახდა საჭირო არ არის.`,
    nextStep: (phone: string) => `მალე დაგიკავშირდებით ნომერზე <strong>${phone}</strong> შეკვეთისა და მიწოდების დასადასტურებლად.`,
    item: "პროდუქტი",
    qty: "რაოდ.",
    price: "ფასი",
    total: "ჯამი",
    delivery: "მიწოდების მისამართი",
    note: "შენიშვნა",
    questions: "კითხვები გაქვთ? უპასუხეთ ამ წერილს ან დაგვირეკეთ: +995 558 200 609.",
    ownerSubject: (id: number, name: string) => `ახალი შეკვეთა #${id} — ${name}`,
    ownerIntro: "renistore.ge-ზე ახალი შეკვეთა გაკეთდა.",
    customer: "მომხმარებელი",
  },
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function gel(value: number): string {
  return `${Number(value).toFixed(2)} ₾`;
}

function itemsTable(order: PlacedOrder, locale: EmailLocale): string {
  const t = copy[locale];
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">${gel(Number(item.price) * item.quantity)}</td>
        </tr>`,
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      <thead>
        <tr style="color:#6b7280;text-align:left">
          <th style="padding-bottom:8px;font-weight:600">${t.item}</th>
          <th style="padding-bottom:8px;font-weight:600;text-align:center">${t.qty}</th>
          <th style="padding-bottom:8px;font-weight:600;text-align:right">${t.price}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding-top:12px;font-weight:700">${t.total}</td>
          <td style="padding-top:12px;font-weight:700;text-align:right;color:#2f8f57">${gel(order.total)}</td>
        </tr>
      </tfoot>
    </table>`;
}

function layout(body: string): string {
  return `
    <div style="background:#f3f4f6;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#111827">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
        <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#47b977">ReniStore</p>
        ${body}
      </div>
    </div>`;
}

function addressBlock(order: PlacedOrder, locale: EmailLocale): string {
  const t = copy[locale];
  const address = [order.city, order.address].filter(Boolean).map((part) => escapeHtml(String(part))).join(", ");
  return `
    ${address ? `<p style="margin:0 0 4px;font-size:14px"><strong>${t.delivery}:</strong> ${address}</p>` : ""}
    ${order.note ? `<p style="margin:0 0 4px;font-size:14px"><strong>${t.note}:</strong> ${escapeHtml(order.note)}</p>` : ""}`;
}

export function customerOrderEmail(order: PlacedOrder, locale: EmailLocale) {
  const t = copy[locale];
  return {
    subject: t.customerSubject(order.id),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px">${t.greeting(escapeHtml(order.customer_name))}</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.5">${t.received(order.id)}</p>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.5">${t.nextStep(escapeHtml(order.phone))}</p>
      ${itemsTable(order, locale)}
      ${addressBlock(order, locale)}
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280">${t.questions}</p>
    `),
  };
}

export function ownerOrderEmail(order: PlacedOrder, locale: EmailLocale) {
  const t = copy[locale];
  const contact = [escapeHtml(order.phone), order.email ? escapeHtml(order.email) : null].filter(Boolean).join(" · ");
  return {
    subject: t.ownerSubject(order.id, order.customer_name),
    html: layout(`
      <p style="margin:0 0 12px;font-size:15px">${t.ownerIntro}</p>
      <p style="margin:0 0 4px;font-size:14px"><strong>${t.customer}:</strong> ${escapeHtml(order.customer_name)} — ${contact}</p>
      ${addressBlock(order, locale)}
      ${itemsTable(order, locale)}
      <p style="margin:16px 0 0"><a href="https://renistore.ge/${locale}/dashboard/orders" style="color:#2f8f57;font-weight:700">renistore.ge/dashboard/orders</a></p>
    `),
  };
}
