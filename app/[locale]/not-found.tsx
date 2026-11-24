"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-gray-400">{t("body")}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href={`/${locale}`}
          className="flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-white hover:bg-primary/90">
          {t("home")}
        </Link>
        <Link
          href={`/${locale}/shop`}
          className="flex min-h-11 items-center rounded-lg border border-gray-700 px-5 font-medium text-gray-200 hover:border-primary">
          {t("shop")}
        </Link>
      </div>
    </div>
  );
}
