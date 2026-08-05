"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PublicAPI } from "@/lib/api/publicApi";
import { useCategories } from "@/hooks/useCategories";

import { Product, ProductsResponse } from "@/types/product";
import { Category } from "@/types/category";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";

const LIMIT = 20;

type SearchableProduct = Product & {
  short_description?: string;
};

type CategoryNode = Category & {
  children?: CategoryNode[];
};

const getCategoryId = (category: any) => category?.id || category?._id || "";
const getCategorySlug = (category: any) => category?.slug || "";
const getParentId = (category: any) =>
  category?.parentId || category?.parent_id || category?.parent?.id || null;

const buildCategoryTree = (categories: Category[] = []): CategoryNode[] => {
  const map = new Map<string, CategoryNode>();

  categories.forEach((cat: any) => {
    const id = getCategoryId(cat);
    if (!id) return;
    map.set(id, { ...cat, children: [] });
  });

  const roots: CategoryNode[] = [];

  map.forEach((node) => {
    const parentId = getParentId(node);
    if (parentId && map.has(parentId)) {
      map.get(parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const findCategoryPathIds = (
  nodes: CategoryNode[],
  targetId: string
): string[] => {
  for (const node of nodes) {
    const nodeId = getCategoryId(node);

    if (nodeId === targetId) {
      return [nodeId];
    }

    const childPath = findCategoryPathIds(node.children || [], targetId);
    if (childPath.length) {
      return [nodeId, ...childPath];
    }
  }

  return [];
};

const ProductsPageContent: React.FC = () => {
 const searchParams = useSearchParams();

const search = searchParams?.get("search") ?? "";


// const categorySlug = useMemo(
//   () => searchParams?.get("categorySlug") || "",
//   [searchParams?.toString()]
// );

const categorySlugFromUrl = useMemo(
  () => searchParams?.get("categorySlug") || "",
  [searchParams?.toString()]
);

  const { data: rawCategories = [] } = useCategories();

 
  // const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");
  // const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
  categorySlugFromUrl
);

const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");


  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(
    {}
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [draftMinPrice, setDraftMinPrice] = useState<number | null>(null);
  const [draftMaxPrice, setDraftMaxPrice] = useState<number | null>(null);
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(
    undefined
  );
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(
    undefined
  );

const categoryTree = useMemo(
  () => rawCategories as CategoryNode[],
  [rawCategories]
);




const requestFilters = useMemo(() => {
  const filters: {
    limit: number;
    q?: string;
    categoryId?: string;
    categorySlug?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {
    limit: LIMIT,
  };

  if (search.trim()) {
    filters.q = search.trim();
  }

  if (selectedCategoryId) {
    filters.categoryId = selectedCategoryId;
  }

  if (selectedCategorySlug) {
    filters.categorySlug = selectedCategorySlug;
  }

  if (appliedMinPrice !== undefined) {
    filters.minPrice = appliedMinPrice;
  }

  if (appliedMaxPrice !== undefined) {
    filters.maxPrice = appliedMaxPrice;
  }

  return filters;
}, [
  search,
  selectedCategoryId,
  selectedCategorySlug,
  appliedMinPrice,
  appliedMaxPrice,
]);



  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery<ProductsResponse, Error>({
queryKey: [
  "products",
  search,
  selectedCategoryId,
  selectedCategorySlug,
  appliedMinPrice,
  appliedMaxPrice,
],
    queryFn: ({ pageParam = 1 }) =>
      PublicAPI.getProducts({
        ...requestFilters,
        page: Number(pageParam),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const allProducts: SearchableProduct[] =
    data?.pages?.flatMap((page) => page?.items ?? []) ?? [];

  const visibleProducts = useMemo(() => allProducts, [allProducts]);

  const serverPriceRange = data?.pages?.[0]?.priceRange;

  const minPriceBound = useMemo(
    () => Math.floor(serverPriceRange?.min ?? 0),
    [serverPriceRange?.min]
  );

  const maxPriceBound = useMemo(
    () => Math.ceil(serverPriceRange?.max ?? 0),
    [serverPriceRange?.max]
  );

  useEffect(() => {
    if (!serverPriceRange) return;

    const baseMin = Math.floor(serverPriceRange.min);
    const baseMax = Math.ceil(serverPriceRange.max);

    setDraftMinPrice((prev) => {
      if (prev == null) return baseMin;
      if (prev < baseMin || prev > baseMax) return baseMin;
      return prev;
    });

    setDraftMaxPrice((prev) => {
      if (prev == null) return baseMax;
      if (prev > baseMax || prev < baseMin) return baseMax;
      return prev;
    });
  }, [serverPriceRange]);

const handleCategorySelect = useCallback((category: CategoryNode) => {
  const nextId = getCategoryId(category);
  const nextSlug = getCategorySlug(category);

  setSelectedCategoryId(nextId);
  setSelectedCategorySlug(nextSlug);

  setDraftMinPrice(null);
  setDraftMaxPrice(null);
  setAppliedMinPrice(undefined);
  setAppliedMaxPrice(undefined);

  setIsMobileFilterOpen(false);
}, []);

const clearFilters = useCallback(() => {
  setSelectedCategoryId("");
  setSelectedCategorySlug("");

  setDraftMinPrice(null);
  setDraftMaxPrice(null);
  setAppliedMinPrice(undefined);
  setAppliedMaxPrice(undefined);

  setIsMobileFilterOpen(false);
}, []);

  const clearPriceFilter = useCallback(() => {
    setDraftMinPrice(minPriceBound);
    setDraftMaxPrice(maxPriceBound);
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);
  }, [minPriceBound, maxPriceBound]);

  const handlePriceChange = useCallback((min: number, max: number) => {
    setDraftMinPrice(min);
    setDraftMaxPrice(max);
  }, []);

const handlePriceCommit = useCallback(
  (min: number, max: number) => {
    const baseMin = Math.floor(serverPriceRange?.min ?? minPriceBound ?? 0);
    const baseMax = Math.ceil(serverPriceRange?.max ?? maxPriceBound ?? 0);

    const nextMin = Math.max(baseMin, Math.min(min, max));
    const nextMax = Math.min(baseMax, Math.max(min, max));

    setDraftMinPrice(nextMin);
    setDraftMaxPrice(nextMax);

    // 🔥 FORCE APPLY ALWAYS
    setAppliedMinPrice(nextMin);
    setAppliedMaxPrice(nextMax);
  },
  [serverPriceRange, minPriceBound, maxPriceBound]
);

  const toggleParent = useCallback((id: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const hasAnyFilter =
    !!selectedCategoryId ||
    appliedMinPrice !== undefined ||
    appliedMaxPrice !== undefined;

  const showLoadMoreButton = !!hasNextPage;

  if (isLoading && !data) {
    return (
      <div className="bg-[#f5f5f5] dark:bg-gray-900 px-4 py-6 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-[320px] animate-pulse rounded-lg bg-white dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#f5f5f5] dark:bg-gray-900 px-4 py-6 md:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-8 text-red-500 shadow-sm dark:bg-gray-800">
          Error fetching products: {error?.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] dark:bg-gray-900 px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="text-xl font-bold text-[#222] dark:text-gray-300"
        >
          Quick Filter
        </button>

        {hasAnyFilter && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-[#666] dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            Clear Filter
          </button>
        )}
      </div>

      {isFetching && !isFetchingNextPage && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Updating products...
          </p>
        </div>
      )}

      {isMobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[46%] max-w-[280px] overflow-y-auto bg-white shadow-xl dark:bg-gray-800 lg:hidden">
            <ProductFilters
              categoryTree={categoryTree}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              setSelectedCategorySlug={setSelectedCategorySlug}
              expandedParents={expandedParents}
              toggleParent={toggleParent}
              handleCategorySelect={handleCategorySelect}
              isMobile={true}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
              minPriceBound={minPriceBound}
              maxPriceBound={maxPriceBound}
              selectedMinPrice={draftMinPrice}
              selectedMaxPrice={draftMaxPrice}
              onPriceChange={handlePriceChange}
              onPriceCommit={handlePriceCommit}
              onClearPrice={clearPriceFilter}
            />
          </div>
        </>
      )}

      <h2 className="mb-4 hidden text-sm font-semibold text-gray-800 dark:text-gray-300 lg:block">
        Filter
      </h2>

      

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-none lg:block">
          <ProductFilters
            categoryTree={categoryTree}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            setSelectedCategorySlug={setSelectedCategorySlug}
            expandedParents={expandedParents}
            toggleParent={toggleParent}
            handleCategorySelect={handleCategorySelect}
            minPriceBound={minPriceBound}
            maxPriceBound={maxPriceBound}
            selectedMinPrice={draftMinPrice}
            selectedMaxPrice={draftMaxPrice}
            onPriceChange={handlePriceChange}
            onPriceCommit={handlePriceCommit}
            onClearPrice={clearPriceFilter}
          />
        </aside>

        <section>
          {visibleProducts.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
              No products found for{" "}
              <span className="font-medium">
                {search || selectedCategorySlug || "selected filter"}
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product.id ?? index}
                    product={product}
                   isAboveFold={false}
                  />
                ))}
              </div>

              {showLoadMoreButton && (
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
        </section>
      </div>
    </div>
  );
};



export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#f5f5f5] dark:bg-gray-900 px-4 py-6 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[320px] animate-pulse rounded-lg bg-white dark:bg-gray-800"
              />
            ))}
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}