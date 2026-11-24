import ShopView from "@/components/ShopView";
import { getCachedProducts } from "@/lib/products-server";

export const revalidate = 300;

export default async function ShopPage() {
  const products = await getCachedProducts().catch((err) => {
    console.error("Error loading products:", err);
    return null;
  });
  return <ShopView products={products} />;
}
