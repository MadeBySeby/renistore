"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import React, { useState, useEffect } from "react";

export default function DashboardPage() {
  const { profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (!loading) {
      // If user is not admin after loading is complete, redirect
      if (!isAdmin) {
        router.push(`/${locale}/profile`);
      }
      setIsChecking(false);
    }
  }, [loading, isAdmin, router, locale]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return <div>hey {profile?.name}</div>;
}
