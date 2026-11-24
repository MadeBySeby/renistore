import { getCachedProductBySlug, getCachedProducts } from "@/lib/products-server";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getCachedProducts().catch(() => []);
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const product = await getCachedProductBySlug(decodeURIComponent(slug)).catch(() => null);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-xl text-gray-300">Product not found.</p>
        <Link
          href={`/${locale}/shop`}
          className="rounded-md bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary/90">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-2 md:gap-12 md:px-8 md:py-12">
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
        {product.image_url && (
          <img
            className="aspect-square w-full object-cover"
            src={product.image_url}
            alt={product.name}
            width={800}
            height={800}
            fetchPriority="high"
          />
        )}
      </div>
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
        <p className="text-2xl font-bold text-primary">{Number(product.price).toFixed(2)} ₾</p>
        {product.description && <p className="leading-relaxed text-gray-300">{product.description}</p>}
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
