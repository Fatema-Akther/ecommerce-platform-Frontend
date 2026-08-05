

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

import { PublicAPI, FlashDealProduct } from "@/lib/api/publicApi";
import ProductCard from "@/components/products/ProductCard";
import { ProductsResponse } from "@/types/product";

export default function FlashDealsSection() {
  const sliderRef = useRef<HTMLDivElement | null>(null);

const {
  data,
  isLoading,
  isError,
} = useQuery<ProductsResponse>({
  queryKey: ["flash-deals"],
  queryFn: () => PublicAPI.getFlashDeals(),
  staleTime: 1000 * 60 * 5,
});

const flashProducts = data?.items ?? [];

if (!isLoading && flashProducts.length < 4) {
  return null;
}

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

  if (isLoading) {
    return (
      
      <section className="min-h-[340px] w-full max-w-6xl mx-auto rounded-xl border border-gray-100 bg-[#8A9A7E] px-4 py-5 dark:border-gray-800  md:px-6 md:py-6">

        
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium italic leading-none tracking-tight">
            <span className="text-xl font-bold text-[#4A2E1F] dark:text-white">
              Super
            </span>
            <span className="text-2xl font-bold text-[#df6a0a]">
              Deals
            </span>
            <span className="mb-4 block h-[3px] w-20 bg-[#C8956C]" />
          </h2>

          <span className="text-xs text-gray-600">Loading...</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[260px] rounded-xl bg-white/60 dark:bg-gray-800/40"
            />
          ))}
        </div>
      </section>
    );
  }

const visibleFlashProducts = flashProducts.slice(0, 12);

  return (


    <div className="flex justify-center">
    {/* <section className="min-h-[340px] w-[95%] max-w-8xl rounded-xl border border-gray-100 bg-[#E7ECE0] px-4 py-5 dark:border-gray-800 dark:bg-[#bfb4b2] md:px-6 md:py-6"> */}

    <section className="relative min-h-[340px] w-[95%] max-w-8xl  mx-auto rounded-xl  bg-[#E7ECE0] dark:bg-[#2B2F24] px-4 py-5 md:px-6 md:py-6">
      <div className="mb-4 flex items-center justify-between">
       <div className="text-left">
  {/* small label */}
  <p className="text-xs tracking-[0.2em] uppercase font-semibold text-[#c24b2b] dark:text-[#CA966B] mb-1">
    LIMITED TIME
  </p>

  {/* title */}
  <h2 className="text-3xl font-serif font-semibold leading-none text-[#2b1b12] dark:text-white">
    <span className="text-black dark:text-white">Super </span>

    <span className="text-[#df6a0a] dark:text-[#CA966B]">Deals</span>
  </h2>

  {/* curved underline */}
  <svg
    className="mt-1"
    width="140"
    height="14"
    viewBox="0 0 140 14"
    fill="none"
  >
    <path
      d="M2 10 C40 2, 100 18, 138 8"
      stroke="#6b7a5a"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
</div>

       
<Link
  href="/products/flash-deals"
  className="inline-flex flex-col text-[15px] text-[#c24b2b] dark:text-[#CA966B] hover:text-[#9f3b1e] transition"
>
  <span>Save big now →</span>

  {/* underline */}
  <span className="mt-1 h-[1px] w-full bg-[#c24b2b] dark:bg-[#CA966B]"></span>
</Link>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Previous flash deals"
          onClick={scrollLeft}
          className="absolute left-[-14px] top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-gray-300 text-2xl text-black shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white md:flex"
        >
          ‹
        </button>

        <button
          type="button"
          aria-label="Next flash deals"
          onClick={scrollRight}
          className="absolute right-[-14px] top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-gray-300 text-2xl text-black shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white md:flex"
        >
          ›
        </button>



 <div
      ref={sliderRef}
      className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >

        {visibleFlashProducts.map((product) => (
            <div
              key={product.id}
              className="shrink-0 w-[48%] md:w-[31.5%] lg:w-[18.8%] xl:w-[15.7%]"
            >
              <ProductCard product={product} isAboveFold={false} />
            </div>
          ))}
        </div>

      </div>
    </section>

    </div>
  );
}