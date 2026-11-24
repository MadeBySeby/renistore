import NewArrivalsView from "@/components/NewArrivalsView";
import { getCachedProducts } from "@/lib/products-server";

export const revalidate = 300;

const NEW_ARRIVALS_LIMIT = 8;

export default async function NewArrivalsPage() {
  const products = await getCachedProducts().catch((err) => {
    console.error("Error loading products:", err);
    return null;
  });
  return <NewArrivalsView products={products?.slice(0, NEW_ARRIVALS_LIMIT) ?? null} />;
}
