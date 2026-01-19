"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function SignInPage() {
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [error, setError] = useState("");
  const { signIn, user, isAdmin, profile, loading: authLoading } = useAuth();

  // Listen for user and profile changes after sign in to redirect
  useEffect(() => {
    if (user && redirecting && !authLoading && profile !== undefined) {
      // Profile has been loaded (even if null), now we can redirect
      const redirectPath = isAdmin
        ? `/${locale}/dashboard`
        : `/${locale}/profile`;
      // if (isAdmin) {
      //   router.push(`/${locale}/dashboard`);
      // } else {
      //   router.push(`/${locale}/`);
      // }
      router.refresh();
      router.push(redirectPath);
      // window.location.href = redirectPath;
      setRedirecting(false);
      setLoading(false);
    }
  }, [user, isAdmin, profile, redirecting, authLoading, router, locale]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data,
        error: signInError,
        success,
      } = await signIn(email, password);

      console.log(data, "Signed in user data");

      if (signInError || !success) {
        setError(signInError || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Set redirecting state - useEffect will handle the actual redirect
      // once user and profile state are updated from onAuthStateChange
      setRedirecting(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";
      console.error("Sign in failed:", err);
      setError(errorMessage);
      setLoading(false);
      setRedirecting(false);
    }
  }
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#47b977] mx-auto mb-4"></div>
          <p className="text-white text-xl">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-10 flex items-center justify-center ">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full mx-auto p-6 space-y-4 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-white">Sign In</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white">
            Email:
          </label>
          <input
            className="px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-white">
            Password:
          </label>
          <input
            className="px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-gray-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={`/${locale}/signup`}
            className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
