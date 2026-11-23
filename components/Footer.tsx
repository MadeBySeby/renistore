import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black/60 p-5 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} ReniStore. All rights reserved.
    </footer>
  );
}
