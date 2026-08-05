

"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicAPI } from "@/lib/api/publicApi";
import type { Product, ProductsResponse } from "@/types/product";

type ProductFilters = {
  categoryId?: string;
  categorySlug?: string;
  condition?: string;
  flash?: string;
  q?: string;
  page?: string;
  limit?: string;
};

const extractProducts = (data: ProductsResponse | Product[] | null | undefined): Product[] => {
  if (!data) return [];

  if (Array.isArray(data)) return data;

  if ("products" in data && Array.isArray(data.products)) return data.products;
  if ("data" in data && Array.isArray(data.data)) return data.data;
  if ("items" in data && Array.isArray(data.items)) return data.items;

  return [];
};

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await PublicAPI.getProducts(filters);
      setProducts(extractProducts(data));
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};