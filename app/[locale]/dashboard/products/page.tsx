"use client";
import { addProduct } from "@/lib/products";
import React, { useState } from "react";
import { BiUpload } from "react-icons/bi";

export default function DashboardProductsPage() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productSlug, setProductSlug] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!productName || !productPrice || !productImage) return;
    setLoading(true);
    try {
      const newProduct = await addProduct(
        {
          name: productName,
          price: productPrice,
        },
        productImage || undefined
      );
      alert("Added product: " + JSON.stringify(newProduct));
    } catch (error) {
      setLoading(false);
      console.error("Error adding product:", error);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col   items-start gap-5">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <label htmlFor="productName">Product Name</label>{" "}
      <input
        onChange={(e) => setProductName(e.target.value)}
        id="productName"
        className="border border-primary p-2 rounded"
        type="text"
        required
      />
      <label htmlFor="productPrice">Product Price</label>{" "}
      <input
        onChange={(e) => setProductPrice(Number(e.target.value))}
        id="productPrice"
        className="border border-primary p-2 rounded"
        type="number"
        required
      />
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={(e) => setProductImage(e.target.files?.[0] || null)}
        required
      />
      <label
        htmlFor="file-upload"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded cursor-pointer hover:bg-primary/90 transition">
        <BiUpload size={20} />
        Choose Product Photo
      </label>
      {productImage && (
        <div>
          <img src={URL.createObjectURL(productImage)} alt="" />
        </div>
      )}
      <button
        type="submit"
        className="bg-primary text-white p-4 m-2 rounded hover:bg-primary/90 transition">
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}
