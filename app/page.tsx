import Image from "next/image";
import heroMG from "../public/heromg.png";
export default function Home() {
  return (
    <div className="p-5 flex p-5 gap-5 ">
      <div className=" relative w-1/2 h-[300px] sm:h-[400px] md:h-[500px]">
        <Image
          src="/heromg.png"
          alt="Hero banner showcasing featured products or promotional content for the stzore"
          fill
          className=" object-cover opacity-50"
        />
      </div>
      <div className=" flex flex-col items-start gap-10 w-1/2">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
          Premium <br />
          Streetwear,
          <br />
          Delivered Fast
        </h1>
        <ul className="flex flex-col gap-2">
          <li>🔥Quality streetwear we wear ourselves</li>
          <li>🚚 Products Arrives in 7-10 working days</li>
          <li>📦 Free Shipping nationwide</li>
        </ul>
        <div className="flex flex-row gap-4 mt-10">
          <button className="bg-primary text-white px-4 py-2 rounded">
            Shop Now
          </button>
          <button className=" text-white px-4 py-2 rounded border-1 border-primary">
            New Drops
          </button>
        </div>
      </div>
    </div>
  );
}
