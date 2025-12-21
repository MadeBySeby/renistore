"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { HiMenu } from "react-icons/hi";

export default function DashboardLayoutComponent({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col text-white min-h-0 ">
        {/* <p className="p-1 text-red-500">your email: {user.email}</p> */}
        <button
          className="md:hidden p-4 text-2xl"
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          <HiMenu />
        </button>
        {/* <Topbar /> */}
        <main className="p-6  min-h-0 overflow-y-auto  no-scrollbar flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
