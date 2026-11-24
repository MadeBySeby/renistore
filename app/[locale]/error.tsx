"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error("Page error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-gray-400">{t("body")}</p>
      <button
        type="button"
        onClick={reset}
        className="min-h-11 cursor-pointer rounded-lg bg-primary px-5 font-semibold text-white hover:bg-primary/90">
        {t("retry")}
      </button>
    </div>
  );
}
