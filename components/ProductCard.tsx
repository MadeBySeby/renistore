import { useLocale } from "next-intl";
import Link from "next/link";
import { BsCartPlus } from "react-icons/bs";
import { IoCart } from "react-icons/io5";
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

  return (
    <Link
      key={product.id}
      className="bg-gray-800 p-4 rounded-lg flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-150"
      href={`${locale}/product/${product.slug}`}>
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-full object-cover mb-4 rounded"
      />
      <h3 className="text-lg font-semibold mb-2 text-center">{product.name}</h3>
      <div className="flex flex-row items-center justify-center gap-2 align-middle">
        <p className="text-primary font-bold flex">
          {product.price.toFixed(2)} ₾
        </p>
        <IoCart className=" text-2xl text-primary cursor-pointer" />
      </div>
      {/* <ul>
        <p>sizes</p>
        <li>s</li>
        <li>m</li>
      </ul> */}
    </Link>
  );
}

export default ProductCard;
