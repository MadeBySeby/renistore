"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import React, { useState, useEffect } from "react";

export default function DashboardPage() {
  const { profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  if (!isAdmin) router.push(`/${locale}/profile`);

  return <div>hey {profile?.name}</div>;
}
