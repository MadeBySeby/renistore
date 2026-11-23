"use client";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { FiUser } from "react-icons/fi";
import { BiMenu, BiX } from "react-icons/bi";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const t = useTranslations("nav");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const handleSignOut = useCallback(async () => {
    setMenuOpen(false);
    await signOut();
  }, [signOut]);

  const accountHref = user
    ? isAdmin
      ? `/${locale}/dashboard`
      : `/${locale}/profile`
    : `/${locale}/login`;

  const links = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/shop`, label: t("shop") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800 bg-[#020712]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href={`/${locale}`}
          className="text-2xl font-bold text-primary md:text-3xl"
          onClick={closeMenu}>
          {t("title")}
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-gray-200 transition hover:text-primary">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <button
                className="cursor-pointer text-gray-200 transition hover:text-primary"
                onClick={handleSignOut}>
                {t("logout")}
              </button>
            ) : (
              <Link href={`/${locale}/login`} className="text-gray-200 transition hover:text-primary">
                {t("login")}
              </Link>
            )}
          </div>
          <Link
            href={accountHref}
            aria-label={user ? t("dashboard") : t("login")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-gray-200 transition hover:border-primary hover:text-primary">
            <FiUser />
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-2xl text-gray-200 md:hidden">
            {menuOpen ? <BiX /> : <BiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-800 bg-[#020712] md:hidden">
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-md px-2 py-3 text-gray-200 hover:bg-gray-800 hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full cursor-pointer rounded-md px-2 py-3 text-left text-gray-200 hover:bg-gray-800 hover:text-primary">
                  {t("logout")}
                </button>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={closeMenu}
                  className="block rounded-md px-2 py-3 text-gray-200 hover:bg-gray-800 hover:text-primary">
                  {t("login")}
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
