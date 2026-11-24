"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("footerExtra");
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tContact = useTranslations("contact");

  return (
    <footer className="w-full border-t border-gray-800 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        <div className="flex flex-col gap-3 md:col-span-2">
          <Link href={`/${locale}`} className="w-fit text-2xl font-bold text-primary">
            {tNav("title")}
          </Link>
          <p className="max-w-sm text-sm text-gray-400">{t("tagline")}</p>
        </div>

        <nav aria-label={t("shop")} className="flex flex-col gap-1 text-sm">
          <p className="mb-1 font-semibold text-white">{t("shop")}</p>
          <Link href={`/${locale}/shop`} className="py-1.5 text-gray-400 hover:text-primary">
            {tNav("shop")}
          </Link>
          <Link href={`/${locale}/new-arrivals`} className="py-1.5 text-gray-400 hover:text-primary">
            {tNav("newArrivals")}
          </Link>
          <Link href={`/${locale}/cart`} className="py-1.5 text-gray-400 hover:text-primary">
            {tNav("cart")}
          </Link>
        </nav>

        <div className="flex flex-col gap-1 text-sm">
          <p className="mb-1 font-semibold text-white">{t("help")}</p>
          <Link href={`/${locale}/contact`} className="py-1.5 text-gray-400 hover:text-primary">
            {tNav("contact")}
          </Link>
          <a href="tel:+995558200609" className="py-1.5 text-gray-400 hover:text-primary">
            +995 558 200 609
          </a>
          <p className="py-1.5 text-gray-400">{tContact("location")}: Tbilisi</p>
          <div className="mt-2 flex gap-3" aria-label={t("followUs")}>
            <a
              href="https://instagram.com/reni_store.ge"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition hover:border-primary hover:text-primary">
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com/@reni__istore"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition hover:border-primary hover:text-primary">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>
      <p className="border-t border-gray-800 px-4 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ReniStore. {tFooter("rights")}.
      </p>
    </footer>
  );
}
