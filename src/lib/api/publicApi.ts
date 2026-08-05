


"use client";

import { Category } from "@/types/category";
import { apiFetch } from "./client";
import { Product, ProductsResponse } from "@/types/product";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

type ProductFilters = {
  categoryId?: string;
  categorySlug?: string;
  condition?: string;
  flash?: string;
  q?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  page?: string | number;
  limit?: string | number;
};

export type FlashDealProduct = Product;

export const PublicAPI = {
  getCategories: () => apiFetch<Category[]>(`${BASE_URL}/categories/tree`),

  getProducts: (filters?: ProductFilters) => {
    const sp = new URLSearchParams();

    if (filters?.categoryId) sp.append("categoryId", String(filters.categoryId));
    if (filters?.categorySlug) sp.append("categorySlug", String(filters.categorySlug));
    if (filters?.condition) sp.append("condition", String(filters.condition));
    if (filters?.flash) sp.append("flash", String(filters.flash));
    if (filters?.q) sp.append("q", String(filters.q));

    if (filters?.minPrice !== undefined) {
      sp.append("minPrice", String(filters.minPrice));
    }

    if (filters?.maxPrice !== undefined) {
      sp.append("maxPrice", String(filters.maxPrice));
    }

    if (filters?.page !== undefined) sp.append("page", String(filters.page));
    if (filters?.limit !== undefined) sp.append("limit", String(filters.limit));

    const query = sp.toString();
    const url = query ? `${BASE_URL}/products?${query}` : `${BASE_URL}/products`;

    return apiFetch<ProductsResponse>(url, { method: "GET" });
  },

  getProductBySlug: (slug: string) =>
    apiFetch<Product>(`${BASE_URL}/products/${slug}`),

getFlashDeals: (page = 1, limit = 12) =>
  apiFetch<ProductsResponse>(
    `${BASE_URL}/flash-deals?page=${page}&limit=${limit}`,
    { method: "GET" }
  ),
};