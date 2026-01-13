"use client";

import { signUpWithEmail } from "@/lib/auth-client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Page() {
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    try {
      const { data, error } = await signUpWithEmail(email, password);
      if (error) throw error;
      console.log(data);
      router.push(`/${locale}/login`);

      console.log("Signup successful");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Signup failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <div className="flex flex-col space-y-2">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
          type="email"
          id="email"
          name="email"
          required
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
          type="text"
          id="name"
          name="name"
          placeholder="Full Name"
          required
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
          type="password"
          id="password"
          name="password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <Link href={`/${locale}/login`} className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
