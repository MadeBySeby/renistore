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
            className="border-primary border-1 rounded p-2 hover:bg-primary hover:text-white transition cursor-pointer touch-manipulation active:scale-95 active:opacity-80 "
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
