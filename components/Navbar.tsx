"use client";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { user, signOut, session, isAdmin } = useAuth();
  const router = useRouter();
  // const [user, setUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  // useEffect(() => {
  //   async function fetchUser() {
  //     try {
  //       const res = await fetch("/api/auth/user");
  //       if (res.ok) {
  //         const data = await res.json();
  //         setUser(data.user);
  //         console.log("Navbar user:", data);
  //       } else {
  //         setUser(null);
  //       }
  //     } catch (error) {
  //       setUser(null);
  //     }
  //   }
  //   fetchUser();
  // }, []);
  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}/signin`);
    router.refresh();
  };

  // console.log("Navbar user from context:", user);
  // console.log("Navbar session from context:", session);
  // console.log("Is Admin:", isAdmin);
  const t = useTranslations("nav");
  const locale = useLocale();
  return (
    <nav className="flex-wrap flex justify-between items-center p-3 border-b-1 border-gray-800 ">
      <LanguageSwitcher />

      <h1 className="text-4xl text-primary mask-l-from-0%-500 to-blue-500 font-bold">
        <Link href={`/${locale}`}>{t("title")}</Link>
      </h1>

      <ul className="gap-3">
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
        <li>
          {session ? (
            <>
              <button className="cursor-pointer" onClick={handleSignOut}>
                {t("logout")}
              </button>
            </>
          ) : (
            <Link href={`/${locale}/login`}>{t("login")}</Link>
          )}
        </li>
        <li>
          <Link
            href={
              user && !isAdmin ? `/${locale}/profile` : `/${locale}/dashboard`
            }>
            {" "}
            <FiUser />
          </Link>
        </li>
      </ul>
      {/* <li>
          <Link href={`/${locale}/cart`}>{t("cart")}</Link>
        </li> */}
    </nav>
  );
}
