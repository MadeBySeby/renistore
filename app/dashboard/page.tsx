"use client";
import React, { useState } from "react";

export default function DashboardPage() {
  const [productImage, setProductImage] = useState<File | null>(null);
  return (
    <div>
      <input
        type="file"
        name=""
        id=""
        accept="image/*"
        onChange={(e) =>
          setProductImage(e.target.files ? e.target.files[0] : null)
        }
      />
      {productImage && (
        <img
          src={URL.createObjectURL(productImage)}
          alt="product"
          className="w-48 h-48 object-cover mt-4"
        />
      )}
    </div>
  );
}
