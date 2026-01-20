import { NextResponse } from "next/server";
import { Resend } from "resend";
export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { name, email, message } = await request.json();

  try {
    await resend.emails.send({
      from: "ReniStore <onboarding@resend.dev>",
      to: `david.sebiskveradze.1@btu.edu.ge`,
      subject: `New Contact from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
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
