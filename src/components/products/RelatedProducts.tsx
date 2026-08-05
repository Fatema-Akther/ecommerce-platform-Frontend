"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PublicAPI } from "@/lib/api/publicApi";
import { Product, ProductsResponse } from "@/types/product";
import ProductCard from "./ProductCard";


type RelatedProductsProps = {
  product: Product;
};

const LIMIT = 11;

const RelatedProducts: React.FC<RelatedProductsProps> = ({ product }) => {
  const relatedCategoryId =
    product.sub_category?.[0]?._id || product.category_group?.[0]?._id;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ProductsResponse, Error>({
    queryKey: ["related-products", relatedCategoryId],
    queryFn: ({ pageParam = 1 }) =>
      PublicAPI.getProducts({
        categoryId: relatedCategoryId,
        page: Number(pageParam),
        limit: LIMIT,
      }),
    enabled: !!relatedCategoryId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  const relatedProducts =
    data?.pages
      .flatMap((page) => page.items)
      .filter((item) => item.id !== product.id) ?? [];

  if (!relatedCategoryId || isLoading || isError || relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-5">
       <h2 className="text-2xl font-bold text-secondary dark:text-gray-200 mb-6 text-center">You may also like</h2>
        
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {relatedProducts.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 rounded-md bg-black text-white disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;