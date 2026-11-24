import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian, Poppins } from "next/font/google";
import "../globals.css";
import Navbar from "../../components/Navbar";
import Footer from "@/components/Footer";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { locales } from "@/i18n/config";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const notoGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-georgian",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export const metadata: Metadata = {
  title: "Reni Store",
  description: "Georgian E-commerce Platform",
};

export const viewport: Viewport = {
  themeColor: "#020712",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  return (
    <html lang={locale} className={`dark ${poppins.variable} ${notoGeorgian.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="" />
        )}
      </head>

      <body className=" min-h-screen bg-[#020712] text-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <CartProvider>
              <div className=" min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_#111827_0,_#020712_55%)]">
                <Navbar />
                <main className="flex-1 w-full">{children}</main>

                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
