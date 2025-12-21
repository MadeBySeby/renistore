"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useLocale } from "next-intl";
import Link from "next/link";
import { BsCartPlus } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { IoCart, IoRemove } from "react-icons/io5";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
function ProductCard({
  product,
}: {
  product: {
    id: number;
    name: string;
    price: number;
    slug: string;
    image_url: string;
  };
}) {
  const locale = useLocale();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [addingToCart, setAddingToCart] = useState(false);
  async function deleteProduct(productId: number) {
    setAddingToCart(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setAddingToCart(false);
    }
  }
  return (
    <div>
      <Link
        key={product.id}
        className="bg-gray-800 p-4 rounded-lg flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-150"
        href={`${locale}/product/${product.slug}`}>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover mb-4 rounded"
        />
        <h3 className="text-lg font-semibold mb-2 text-center">
          {product.name}
        </h3>
        <div className="flex flex-row items-center justify-center gap-2 align-middle">
          <p className="text-primary font-bold flex">
            {product.price.toFixed(2)} ₾
          </p>
          <IoCart className=" text-2xl text-primary cursor-pointer" />
        </div>
      </Link>
      {isAdmin && (
        <div className="flex border-t border-gray-700 p-3 bg-gray-900 flex gap-2">
          <button
            className="flex gap-3 hover:opacity-70 cursor-pointer"
            disabled={addingToCart}
            onClick={() => deleteProduct(product.id)}>
            <p>{addingToCart ? "Deleting..." : "Delete"}</p>
            <MdDelete className=" text-2xl text-red-600 " />
          </button>
        </div>
      )}
      {/* <ul>
        <p>sizes</p>
        <li>s</li>
        <li>m</li>
        </ul> */}
    </div>
  );
}

export default ProductCard;
