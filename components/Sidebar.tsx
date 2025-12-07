import Link from "next/link";
import React from "react";
import { FaHome, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { GrDashboard, GrOrderedList } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
export default function Sidebar() {
  return (
    <ul
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
      sm:h-full
        
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
      <li>
        <Link href="/dashboard/settings">
          Settings
          <FaCog />
        </Link>
      </li>
    </ul>
  );
}
