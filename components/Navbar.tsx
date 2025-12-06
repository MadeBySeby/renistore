import Link from "next/link";
import React from "react";
import { FiUser } from "react-icons/fi";
export default function Navbar() {
  return (
    <div className=" flex justify-between items-center p-3 border-b-1 border-gray-800 ">
      <h1 className="text-4xl text-primary">ReniStore</h1>
      <ul>
        <li>
          {" "}
          <Link href="/">Home</Link>{" "}
        </li>
        <li>
          {" "}
          <Link href="/shop">Shop</Link>{" "}
        </li>
        <li>
          {" "}
          <Link href="/new-arrivals">New Arrivals</Link>{" "}
        </li>
        <li>
          {" "}
          <Link href="/contact">Contact</Link>{" "}
        </li>
      </ul>
      <ul>
        <li>
          <Link href="/cart">Cart</Link>
        </li>
        <li>
          <Link href="/dashboard">
            {" "}
            <FiUser />
          </Link>
        </li>
      </ul>
    </div>
  );
}
