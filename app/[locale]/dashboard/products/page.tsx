"use client";
import { addProduct } from "@/lib/products";
import React, { useState } from "react";

export default function DashboardProductsPage() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productSlug, setProductSlug] = useState("");
  async function handleSubmit() {
    const newProduct = await addProduct(
      {
        name: productName,
        price: productPrice,
      },
      productImage || undefined
    );
    alert("Added product: " + JSON.stringify(newProduct));
  }
  return (
    <div className="flex flex-col   items-start gap-2">
      <h1> add Product</h1>
      <label htmlFor="productName">Product Name</label>{" "}
      <input
        onChange={(e) => setProductName(e.target.value)}
        id="productName"
        className="border border-primary p-2 rounded"
        type="text"
      />
      <label htmlFor="productPrice">Product Price</label>{" "}
      <input
        onChange={(e) => setProductPrice(Number(e.target.value))}
        id="productPrice"
        className="border border-primary p-2 rounded"
        type="number"
      />
      <label htmlFor="productSlug">Product slug</label>{" "}
      <input
        onChange={(e) => setProductSlug(e.target.value)}
        id="productSlug"
        className="border border-primary p-2 rounded"
        type="text"
      />
      <label htmlFor=" productImage">
        Product Image{" "}
        <input
          onChange={(e) =>
            setProductImage(e.target.files ? e.target.files[0] : null)
          }
          className="border border-primary p-2 rounded"
          id="productImage"
          type="file"
        />
      </label>
      <button
        onClick={handleSubmit}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition">
        Add Product
      </button>
    </div>
  );
}
