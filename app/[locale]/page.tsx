import HomeView from "@/components/HomeView";
import { getCachedProducts } from "@/lib/products-server";

export const revalidate = 300;

export default async function Home() {
  const products = await getCachedProducts().catch((err) => {
    console.error("Error loading products:", err);
    return null;
  });
  return <HomeView products={products} />;
}
