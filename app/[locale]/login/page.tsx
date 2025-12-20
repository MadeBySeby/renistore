"use client";

import { signIn } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignInPage() {
  const supabase = createClient();
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // try {
    //   await signIn(email, password);
    //   // router.push(`/${locale}/dashboard`);
    //   // router.refresh();
    // } catch (err: any) {
    //   console.error("Sign in failed:", err);
    //   setError(err.message || "Invalid email or password");
    // } finally {
    //   setLoading(false);
    // }
    try {
      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to dashboard
      router.push(`/${locale}/dashboard`);
      router.refresh(); // ← Refresh to update server state
    } catch (err: any) {
      console.error("Sign in failed:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
          Don't have an account?{" "}
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
