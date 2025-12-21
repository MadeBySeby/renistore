"use client";
import { useAuth } from "@/app/context/AuthContext";
import React, { useState } from "react";
export default function DashboardPage() {
  const { profile } = useAuth();
  const [productImage, setProductImage] = useState<File | null>(null);
  return <div>hey {profile?.name}</div>;
}
