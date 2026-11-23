"use client";

import { signUpWithEmail } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/auth-errors";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignUpPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await signUpWithEmail(email, password, name);
      if (data.session) {
        router.replace(`/${locale}/profile`);
        router.refresh();
        return;
      }
      router.replace(`/${locale}/login?registered=true`);
    } catch (err) {
      setError(friendlyAuthError(err, t));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border border-gray-800 bg-gray-900/80 p-8 shadow-xl">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold text-white">{t("signUpTitle")}</h1>
          <p className="text-sm text-gray-400">{t("signUpSubtitle")}</p>
        </div>

        {error && (
          <div role="alert" className="rounded-md border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-200">
            {t("name")}
          </label>
          <input
            className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-200">
            {t("email")}
          </label>
          <input
            className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-200">
            {t("password")}
          </label>
          <input
            className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500">{t("passwordHint")}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? t("signingUp") : t("signUp")}
        </button>

        <p className="text-center text-sm text-gray-400">
          {t("haveAccount")}{" "}
          <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </form>
    </div>
  );
}
