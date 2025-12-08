"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import React, { useState } from "react";
import { HiMenu } from "react-icons/hi";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="w-full align-bottom flex h-screen overflow-hidden ">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top,_#111827_0,_#020712_55%)] text-white ">
        <button
          className="md:hidden p-4 text-2xl"
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          <HiMenu />
        </button>
        <Topbar />
        <main className="p-6  flex-1">{children}</main>
      </div>
    </div>
  );
}
