"use client";
import Link from "next/link";
import React from "react";
import { FiUser } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";
export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  return (
    <nav className="flex-wrap flex justify-between items-center p-3 border-b-1 border-gray-800 ">
      <LanguageSwitcher />
      <h1 className="text-4xl text-primary mask-l-from-0%-500 to-blue-500 font-bold">
        <Link href="/">{t("title")}</Link>
      </h1>
      <ul>
        <li>
          {" "}
          <Link href={`/${locale}`}>{t("home")}</Link>
        </li>
        <li>
          {" "}
          <Link href={`/${locale}/shop`}>{t("shop")}</Link>{" "}
        </li>
        <li>
          {" "}
          <Link href={`/${locale}/new-arrivals`}>{t("newArrivals")}</Link>{" "}
        </li>
        <li>
          {" "}
          <Link href={`/${locale}/contact`}>{t("contact")}</Link>{" "}
        </li>
      </ul>
      <ul>
        <li>
          <Link href={`/${locale}/cart`}>{t("cart")}</Link>
        </li>
        <li>
          <Link href={`/${locale}/dashboard`}>
            {" "}
            <FiUser />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
