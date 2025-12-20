import DashboardLayoutComponent from "@/components/DashboardLayoutComponent";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  const profile = await getUserProfile(user.id);
  if (profile?.role !== "admin") {
    redirect(`/${locale}/`);
  }

  return (
    <div
      className="w-full align-bottom flex h-screen overflow
    -hidden ">
      <DashboardLayoutComponent user={user}>
        {children}
      </DashboardLayoutComponent>
    </div>
  );
}
