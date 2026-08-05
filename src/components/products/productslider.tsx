



"use client";

import React, { useRef } from "react";
import ProductCard from "@/components/products/ProductCard";
import { SearchableProduct } from "@/lib/search/productSearch";
import Link from "next/link";

const RandomProductsSlider: React.FC<{ products: SearchableProduct[] }> = ({
  products,
}) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);

const visibleProducts = products.slice(Math.max(products.length - 20, 0));

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -600,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 600,
      behavior: "smooth",
    });
  };

  if (!visibleProducts.length) {
    return null;
  }

  return (
    <section className="relative min-h-[360px] pt-8 ">
 <div className="ml-6 mb-6">
  
 <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold dark:text-[#A39A8F]">
   Handpicked for You
  </p>
  
  <h2 className="text-3xl font-serif font-semibold text-black dark:text-[#F2EDE6]">
    Top collections
  </h2>

  {/* Curved underline */}
  <svg
    className="mt-1"
    width="140"
    height="12"
    viewBox="0 0 140 12"
    fill="none"
  >
    <path
      d="M2 8 C40 0, 100 16, 138 6"
      stroke="#C8956C"
      className="dark:stroke-[#C4623D]"

      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>


  <Link
    href="/products"
    className="mt-2 inline-flex items-center text-sm text-[#3D2410] dark:text-[#8E9A87] hover:text-[#C8956C] transition"
  >
    Browse all collections <span className="ml-1">→</span>
  </Link>
</div>

      <button
        type="button"
        aria-label="Previous products"
        onClick={scrollLeft}
        className="absolute  hidden  md:flex left-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 text-2xl text-black shadow-md hover:bg-gray-100 dark:bg-gray-900 dark:text-white"
      >
        ‹
      </button>

      <button
        type="button"
        aria-label="Next products"
        onClick={scrollRight}
        className="absolute  hidden  md:flex right-2 top-1/2 z-20  h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300text-2xl text-black shadow-md hover:bg-gray-100 dark:bg-gray-900 dark:text-white"
      >
        ›
      </button>

      <div
        ref={sliderRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
      {visibleProducts.map((product, index) => (
  <div
    key={product.id}
    className="shrink-0 w-[48%] md:w-[31.5%] lg:w-[18.8%]"
  >
    <ProductCard product={product} isAboveFold={index < 5} />
  </div>
))}
      </div>
    </section>
  );
};

export default RandomProductsSlider;