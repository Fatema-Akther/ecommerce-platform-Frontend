"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PublicAPI } from "@/lib/api/publicApi";
import { Product } from "@/types/product";
import SingleProductDetails from "@/components/products/SingleProductDetails";
import RelatedProducts from "@/components/products/RelatedProducts";



const ProductDetailsPage = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery<Product, Error>({
    queryKey: ["product", slug],
    queryFn: () => PublicAPI.getProductBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading product...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto p-4">
        <p>Error: {error?.message || "Product not found"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#f5f5f5] dark:bg-gray-900">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/" className="text-[#3D2410] dark:text-[#F5F5F0] hover:text-[#cabdb3]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="text-[#3D2410] dark:text-[#F5F5F0] hover:text-[#cabdb3]">
          Products
        </Link>
        <span className="mx-2 ">/</span>
        <span className="text-[#5e544c] dark:text-[#c2c2be]">{product.name}</span>
      </div>

      <SingleProductDetails product={product} />
      <RelatedProducts product={product} />
    </div>
  );
};

export default ProductDetailsPage;