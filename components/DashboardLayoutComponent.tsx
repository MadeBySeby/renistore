"use client";
import React, { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { HiMenu } from "react-icons/hi";
import Sidebar from "./Sidebar";

export default function DashboardLayoutComponent({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 md:px-8">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex min-w-0 flex-1 flex-col gap-4 text-white">
        <button
          type="button"
          onClick={openSidebar}
          aria-label={t("openMenu")}
          className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/70 px-3 text-sm font-medium text-gray-200 md:hidden">
          <HiMenu className="text-xl" />
          {t("menu")}
        </button>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
