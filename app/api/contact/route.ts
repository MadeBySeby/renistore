import { NextResponse } from "next/server";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/order-email";
export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { name, email, message } = await request.json();
    await resend.emails.send({
      from: "ReniStore <onboarding@resend.dev>",
      to: `david.sebiskveradze.1@btu.edu.ge`,
      subject: `New Contact from ${String(name).slice(0, 100)}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${escapeHtml(String(name))} (${escapeHtml(String(email))})</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(String(message))}</p>
      `,
    });
    return NextResponse.json(
      { message: "Message sent successfully.", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send message.", success: false },
      {
        status: 500,
      },
    );
  }
}
