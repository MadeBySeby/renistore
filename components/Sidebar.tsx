import Link from "next/link";
import React from "react";
import { FaHome, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { GrDashboard, GrOrderedList } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
export default function Sidebar({
  open,
  setOpen,
}: {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300
        ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`
        fixed top-0 left-0 z-50
        h-full w-64
        bg-[radial-gradient(circle_at_top,_#111827_0,_#020712_55%)]
        
        transform transition-transform duration-300
        md:static md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
        `}>
        <ul
          onClick={() => setOpen(false)}
          className="flex flex-col gap-5 p-4
        border-r-2 border-gray-800
      bg-[radial-gradient(circle_at_top,_#111827_0,_#020712_55%)]
      text-white
      h-full
      [&>li]:flex
      [&>li]:hover:bg-primary
      [&>li]:cursor-pointer
      [&>li]:p-3
      [&>li]:rounded
      [&>li>a]:flex
      [&>li>a]:flex-row-reverse
      [&>li>a]:items-center
      items-baseline
      
      [&>li>a]:gap-2
   
      ">
          <li>
            <Link href="/dashboard">
              {" "}
              dashboard
              <GrDashboard />{" "}
            </Link>
          </li>
          <li>
            <Link href="/dashboard/orders">
              Orders
              <FaUser />
            </Link>
          </li>
          <li>
            <Link href="/dashboard/products">
              Products
              <GrOrderedList />
            </Link>
          </li>
          <li>
            <Link href="/dashboard/ai-weight">
              Ai Weight
              <MdDashboard />
            </Link>
          </li>
          {/* <li>
            <Link href="/dashboard/settings">
              Settings
              <FaCog />
            </Link>
          </li> */}
        </ul>
      </aside>
    </>
  );
}
