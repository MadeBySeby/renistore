"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { locales } from "@/i18n/config";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="flex gap-2">
      {locales.map((loc) => {
        if (loc === locale) return null;
        return (
          <button
            key={loc}
            className="flex h-10 min-w-10 items-center justify-center rounded-md border border-primary px-2 text-sm font-medium hover:bg-primary hover:text-white transition cursor-pointer touch-manipulation active:scale-95 active:opacity-80"
            onClick={() => {
              const newPathname = pathname.replace(`/${locale}`, `/${loc}`);
              router.push(newPathname);
            }}>
            {loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
