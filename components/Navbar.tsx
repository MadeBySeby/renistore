"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/user");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          console.log("Navbar user:", data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    }
    fetchUser();
  }, []);
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
          {user ? (
            <>
              <button
                className="cursor-pointer"
                onClick={async () => {
                  await signOut();
                  router.refresh();
                }}>
                logout
              </button>
            </>
          ) : (
            <Link href={`/${locale}/login`}>login</Link>
          )}
        </li>
        <li>
          <Link href={`/${locale}/dashboard`}>
            {" "}
            <FiUser
              onPointerOver={() => setShowUserDropdown(true)}
              onPointerOut={() => setShowUserDropdown(false)}
            />
            {showUserDropdown && user && (
              <div
                className=" absolute right-0 text-primary bg-white border mt-2 p-2 rounded shadow-lg"
                onPointerOver={() => setShowUserDropdown(true)}
                onPointerOut={() => setShowUserDropdown(false)}>
                {/* User dropdown content */}
                {user.email}
              </div>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
