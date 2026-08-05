"use client";

import Link from "next/link";
import { useState } from "react";
import { useProducts } from "@/hooks/useproduct";
import ProductCard from "@/components/products/ProductCard";

export default function FlashDealsPage() {
  const { products, loading, error } = useProducts({
    flash: "true",
  });

  const [visibleCount, setVisibleCount] = useState(20);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Flash Deal Products
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          All products with offers or flash deals are displayed here
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-300">
          Loading flash deal products...
        </div>
      ) : error ? (
        <div className="py-10 text-center text-red-500">{error}</div>
      ) : visibleProducts.length === 0 ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-300">
          No flash deal products found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id ?? product.slug ?? index}
                product={product}
                isAboveFold={false}
              />
            ))}
          </div>

          {/* LOAD MORE BUTTON */}
          {visibleCount < products.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

     
    </main>
  );
}