import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { customerOrderEmail, ownerOrderEmail, type PlacedOrder } from "@/lib/order-email";

const KNOWN_ORDER_ERRORS = ["invalid_name", "invalid_phone", "invalid_items", "invalid_quantity", "product_unavailable"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEST_SENDER = "ReniStore <onboarding@resend.dev>";
const DEFAULT_OWNER_EMAIL = "david.sebiskveradze.1@btu.edu.ge";

interface OrderRequest {
  customer?: Record<string, unknown>;
  items?: unknown;
  locale?: unknown;
}

/** Sends the owner notification and, when possible, the customer confirmation. Returns whether the customer got one. */
async function sendOrderEmails(order: PlacedOrder, locale: "en" | "ka"): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set; skipping order emails");
    return false;
  }
  const resend = new Resend(apiKey);
  // Customer emails need a verified sending domain; Resend's test sender can only reach the account owner.
  const verifiedSender = process.env.ORDER_EMAIL_FROM;
  const ownerEmail = process.env.ORDER_NOTIFY_EMAIL || DEFAULT_OWNER_EMAIL;

  const customerEmail = order.email && EMAIL_PATTERN.test(order.email) ? order.email : null;
  const owner = ownerOrderEmail(order, locale);
  const customer = customerOrderEmail(order, locale);

  const [ownerResult, customerResult] = await Promise.allSettled([
    resend.emails.send({
      from: verifiedSender || TEST_SENDER,
      to: ownerEmail,
      replyTo: customerEmail ?? undefined,
      subject: owner.subject,
      html: owner.html,
    }),
    verifiedSender && customerEmail
      ? resend.emails.send({
          from: verifiedSender,
          to: customerEmail,
          replyTo: ownerEmail,
          subject: customer.subject,
          html: customer.html,
        })
      : Promise.resolve(null),
  ]);

  const failed = (result: PromiseSettledResult<{ error: unknown } | null>) =>
    result.status === "rejected" ? result.reason : result.value?.error;
  const ownerError = failed(ownerResult);
  const customerError = failed(customerResult);
  if (ownerError) console.error("Owner order email failed:", ownerError);
  if (customerError) console.error("Customer order email failed:", customerError);

  return Boolean(verifiedSender && customerEmail && !customerError);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as OrderRequest | null;
  if (!body || typeof body.customer !== "object" || body.customer === null || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const locale = body.locale === "ka" ? "ka" : "en";

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order_with_details", {
    p_customer: body.customer,
    p_items: body.items,
  });

  if (error || !data) {
    const code = KNOWN_ORDER_ERRORS.find((known) => error?.message.includes(known));
    if (!code) console.error("Order failed:", error?.message);
    return NextResponse.json({ error: code ?? "order_failed" }, { status: code ? 400 : 500 });
  }

  const order = data as PlacedOrder;
  const emailSent = await sendOrderEmails(order, locale);
  return NextResponse.json({ id: order.id, emailSent });
}
