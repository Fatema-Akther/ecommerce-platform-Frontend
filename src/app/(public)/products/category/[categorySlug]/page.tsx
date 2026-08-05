// "use client";

// import React from "react";
// import { useParams } from "next/navigation";
// import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
// import { PublicAPI } from "@/lib/api/publicApi";

// import { Product, ProductsResponse } from "@/types/product";
// import { Category } from "@/types/category";
// import ProductCard from "@/components/products/ProductCard";

// const LIMIT = 20;

// const findCategoryName = (
//   cats: Category[],
//   categorySlug: string
// ): string | null => {
//   for (const cat of cats) {
//     if (cat.slug === categorySlug) return cat.name;
//     if (cat.children?.length) {
//       const found = findCategoryName(cat.children, categorySlug);
//       if (found) return found;
//     }
//   }
//   return null;
// };

// const CategoryPage = () => {
//   const params = useParams<{ categorySlug: string }>();
//   const categorySlug = params?.categorySlug;

//   const {
//     data: categories = [],
//     isLoading: isCategoryLoading,
//   } = useQuery<Category[]>({
//     queryKey: ["categories"],
//     queryFn: () => PublicAPI.getCategories(),
//     enabled: !!categorySlug,
//   });

//   const {
//     data,
//     isLoading: isProductsLoading,
//     isError,
//     error,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useInfiniteQuery<ProductsResponse, Error>({
//     queryKey: ["products", "category", categorySlug],
//     queryFn: ({ pageParam = 1 }) =>
//       PublicAPI.getProducts({
//         categorySlug,
//         page: Number(pageParam),
//         limit: LIMIT,
//       }),
//     initialPageParam: 1,
//     enabled: !!categorySlug,
//     getNextPageParam: (lastPage) =>
//       lastPage.hasMore ? lastPage.page + 1 : undefined,
//   });

//   const products: Product[] = data?.pages.flatMap((page) => page.items) ?? [];
//   const total = data?.pages?.[0]?.total ?? 0;
//   const categoryName = categorySlug
//     ? findCategoryName(categories, categorySlug) || categorySlug
//     : "";

//   if (isProductsLoading || isCategoryLoading) {
//     return (
//       <div className="container mx-auto p-4">
//         <p>Loading products...</p>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="container mx-auto p-4">
//         <p>Error fetching products: {error?.message}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-semibold mb-2">
//         Products in Category: {categoryName}
//       </h1>

//       <p className="text-sm text-gray-500 mb-4">
//         Showing {products.length} of {total} products
//       </p>

//       {products.length === 0 ? (
//         <p>No products found for this category.</p>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {products.map((product) => (
//               <ProductCard key={product.id} product={product} />
//             ))}
//           </div>

//           {hasNextPage && (
//             <div className="mt-8 flex justify-center">
//               <button
//                 onClick={() => fetchNextPage()}
//                 disabled={isFetchingNextPage}
//                 className="px-6 py-3 rounded-md bg-black text-white disabled:opacity-50"
//               >
//                 {isFetchingNextPage ? "Loading more..." : "Load More"}
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default CategoryPage;








"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { PublicAPI } from "@/lib/api/publicApi";

import { Product, ProductsResponse } from "@/types/product";
import { Category } from "@/types/category";
import ProductCard from "@/components/products/ProductCard";

const LIMIT = 20;

const findCategoryName = (
  cats: Category[],
  categorySlug: string
): string | null => {
  for (const cat of cats) {
    if (cat.slug === categorySlug) return cat.name;
    if (cat.children?.length) {
      const found = findCategoryName(cat.children, categorySlug);
      if (found) return found;
    }
  }
  return null;
};

const CategoryPage = () => {
  const params = useParams<{ categorySlug: string }>();
  const categorySlug = params?.categorySlug;

  const {
    data: categories = [],
    isLoading: isCategoryLoading,
  } = useQuery<Category[]>({
    queryKey: ["categories", "tree"],
    queryFn: () => PublicAPI.getCategories(),
    enabled: !!categorySlug,
  });

  const {
    data,
    isLoading: isProductsLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ProductsResponse, Error>({
    queryKey: ["products", "category", categorySlug, { limit: LIMIT }],
    queryFn: ({ pageParam = 1 }) =>
      PublicAPI.getProducts({
        categorySlug,
        page: Number(pageParam),
        limit: LIMIT,
      }),
    initialPageParam: 1,
    enabled: !!categorySlug,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.page + 1 : undefined,
  });

  const products: Product[] =
    data?.pages?.flatMap((page) => page?.items ?? []) ?? [];

  const total = data?.pages?.[0]?.total ?? 0;
  const categoryName = categorySlug
    ? findCategoryName(categories, categorySlug) || categorySlug
    : "";

  if (isProductsLoading || isCategoryLoading) {
    return (
      // <div className="container mx-auto p-4">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
        <p>Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <p>Error fetching products: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-semibold mb-2">
        Products in Category: {categoryName}
      </h1> */}
{/* 
      <p className="text-sm text-gray-500 mb-4">
        Showing {products.length} of {total} products
      </p> */}

      {products.length === 0 ? (
        <p>No products found for this category.</p>
      ) : (
        <>
          {/* <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"> */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                 className="rounded-sm bg-[#d9b7b7] px-6 py-1 text-gray-700 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? "Loading more..." : "Load More"}
                  </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryPage;