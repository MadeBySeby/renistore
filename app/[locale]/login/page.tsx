"use client";

import { signInAction, AuthState } from "@/lib/auth-actions";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useActionState } from "react";

const initialState: AuthState = { error: null };

export default function SignInPage() {
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <div className="h-full p-10 flex items-center justify-center">
      <form
        action={formAction}
        className="max-w-md w-full mx-auto p-6 space-y-4 bg-gray-800 rounded-lg">
        <input type="hidden" name="locale" value={locale} />

        <h1 className="text-2xl font-bold text-center text-white">Sign In</h1>

        {state.error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm">
            {state.error}
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
            name="email"
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
            name="password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
          {isPending ? "Signing in..." : "Sign In"}
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
