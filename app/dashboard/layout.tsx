import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import React from "react";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      <div className="flex-1 bg-[radial-gradient(circle_at_top,_#111827_0,_#020712_55%)] text-white ">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
