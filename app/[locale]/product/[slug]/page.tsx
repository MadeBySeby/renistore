import { getProductBySlug } from "@/lib/products";
import { IoCart } from "react-icons/io5";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="w-full flex p-5 gap-5 ">
      <div>
        <img
          className="border-primary rounded-2xl "
          width="500"
          src={product.image_url}
          alt={product.name}
        />
      </div>
      <div className="flex flex-col ">
        <h1 className="text-primary">Product Name: {product.name}</h1>
        <div>Product Price: {product.price}</div>
        <button className=" bg-primary   text-white px-4 py-2 rounded hover:bg-primary/90 transition mt-5 w-fit">
          Add to Cart
          <IoCart className=" inline ml-2 text-2xl text-white cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
