


"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import NavCategoriesMenu from "../ui/head/navcategory";
import HeroSection from "../home/HeroSlider";
import RandomProductsSlider from "../products/productslider";
import { PublicAPI } from "@/lib/api/publicApi";
import { ProductsResponse } from "@/types/product";
import { SearchableProduct } from "@/lib/search/productSearch";
import { useSessionStore } from "@/stores/session";
import FlashDealsSection from "../home/FlashDealSection";
import AllProductsPreview from "../home/AllProductsPreview";
import Footer from "../Footer";

type Props = {
  children?: React.ReactNode;
};

export default function HomeLayout({ children }: Props) {
  const hydrated = useSessionStore((s) => s.hydrated);

  const {
    data: allProducts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", "home-slider", { page: 1, limit: 30 }],
    queryFn: () => PublicAPI.getProducts({ page: 1, limit: 30 }),
    enabled: hydrated,
    select: (response: ProductsResponse): SearchableProduct[] =>
      response?.items ?? [],
  });


  if (isLoading) return <div className="flex min-h-screen flex-col items-center justify-center bg-[#07111d] text-white">
  <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400/30 border-t-cyan-400"></div>

  <p className="mt-6 text-sm text-slate-300">
    Starting the application...
  </p>
       
  <p className="mt-2 text-xs text-slate-500">
    This may take a few seconds on the first visit.
  </p>
</div>
  if (isError) return <div>Error fetching products: {error.message}</div>;


  return (
    <div className="w-full bg-[#FAF7F2] dark:bg-[#1C1A17]">

      <div className="hidden  md1:block">
      <NavCategoriesMenu />

      </div>
      <HeroSection />

        <div className="block md1:hidden">
    <NavCategoriesMenu />
  </div>
      <RandomProductsSlider products={allProducts} />

        <FlashDealsSection />
      <AllProductsPreview
  products={allProducts.slice(0, 30)}
/>


  
      {children}
    </div>
  );
}