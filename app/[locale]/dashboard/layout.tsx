import DashboardLayoutComponent from "@/components/DashboardLayoutComponent";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
