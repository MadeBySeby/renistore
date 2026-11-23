"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { friendlyAuthError } from "@/lib/auth-errors";

function SignInForm() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const justRegistered = searchParams.get("registered") === "true";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn(email, password);
    if (!result.success) {
      setError(friendlyAuthError(result.error, t));
      setLoading(false);
      return;
    }

    router.replace(result.isAdmin ? `/${locale}/dashboard` : `/${locale}/profile`);
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border border-gray-800 bg-gray-900/80 p-8 shadow-xl">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold text-white">{t("signInTitle")}</h1>
          <p className="text-sm text-gray-400">{t("signInSubtitle")}</p>
        </div>

        {justRegistered && !error && (
          <div className="rounded-md border border-primary/60 bg-primary/10 p-3 text-sm text-primary">
            {t("registered")}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-md border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-200">
            {t("email")}
          </label>
          <input
            className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="email"
            id="email"
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? t("signingIn") : t("signIn")}
        </button>

        <p className="text-center text-sm text-gray-400">
          {t("noAccount")}{" "}
          <Link href={`/${locale}/signup`} className="font-medium text-primary hover:underline">
            {t("signUp")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
