"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import type { IconType } from "react-icons";
import { FiCpu, FiExternalLink, FiGrid, FiLogOut, FiPackage, FiShoppingBag, FiX } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";

interface NavItem {
  path: string;
  key: "dashboard" | "orders" | "products" | "aiWeight";
  icon: IconType;
}

const NAV_ITEMS: NavItem[] = [
  { path: "", key: "dashboard", icon: FiGrid },
  { path: "/orders", key: "orders", icon: FiShoppingBag },
  { path: "/products", key: "products", icon: FiPackage },
  { path: "/ai-weight", key: "aiWeight", icon: FiCpu },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("sidebar");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const { profile, user, signOut } = useAuth();
  const base = `/${locale}/dashboard`;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-800 bg-[#060b17] p-4 transition-transform duration-300 md:sticky md:top-20 md:z-auto md:h-[calc(100vh-6.5rem)] md:w-60 md:translate-x-0 md:rounded-2xl md:border md:bg-gray-900/60 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="mb-6 flex items-center justify-between gap-2 px-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{tAdmin("panel")}</p>
            <p className="truncate text-sm text-gray-400">{profile?.name || user?.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tAdmin("closeMenu")}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-xl text-gray-300 hover:bg-gray-800 md:hidden">
            <FiX />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ path, key, icon: Icon }) => {
            const href = `${base}${path}`;
            const active = path === "" ? pathname === base : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                  active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}>
                <Icon className="text-lg" />
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-gray-800 pt-4">
          <Link
            href={`/${locale}`}
            onClick={onClose}
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white">
            <FiExternalLink className="text-lg" />
            {tAdmin("viewStore")}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm text-red-300 transition hover:bg-red-500/10">
            <FiLogOut className="text-lg" />
            {tAdmin("signOut")}
          </button>
        </div>
      </aside>
    </>
  );
}
