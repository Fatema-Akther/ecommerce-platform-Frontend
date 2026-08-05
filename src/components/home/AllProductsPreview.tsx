"use client";

import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
};

export default function AllProductsPreview({ products }: Props) {
  if (!products.length) return null;
    const visibleProducts = products.slice(0, 20);

  return (
    <section className="rounded-2xl    px-4 py-5 md:px-6 md:py-6">
      <div className="mb-4 flex items-center justify-between">
    <div className="ml-2">
  {/* small label */}
  <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold dark:text-[#A39A8F]">
    PICKED FOR YOUR TASTE
  </p>

  {/* title */}
  <h2 className="text-3xl font-serif font-semibold leading-tight text-[#2b1b12] dark:text-[#F2EDE6] ">
    Selected for you
  </h2>

  {/* curved underline */}
  <svg
    className="mt-1"
    width="160"
    height="14"
    viewBox="0 0 160 14"
    fill="none"
  >
    <path
      d="M2 10 C45 0, 110 18, 158 8"
      stroke="#C8956C"
       className="dark:stroke-[#C4623D]"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>

  {/* link */}
  <Link
    href="/products"
    className="mt-2 inline-flex items-center text-sm text-[#2b1b12] dark:text-[#8E9A87] hover:text-[#c24b2b] transition"
  >
    View all picks <span className="ml-1">→</span>
  </Link>
</div>

       
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
    {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id ?? product.slug ?? index}
            product={product}
          isAboveFold={false}
          />
        ))}
      </div>
    </section>
  );
}