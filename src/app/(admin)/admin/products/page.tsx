


"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";
import type { Product, ProductsResponse } from "@/types/product";
import AdminGuard from "@/components/guards/AdminGuard";

type ConditionFilter = "" | "new" | "used" | "refurbished";
type FlashFilter = "" | "true";
type StatusFilter = "active" | "archived" | "all";


type CategoryTreeNode = {
  id?: string;
  _id?: string;
  name: string;
  children?: CategoryTreeNode[];
};

const getCategoryId = (category: CategoryTreeNode) => {
  return category.id || category._id || "";
};

type DeleteProductResponse = {
  success?: boolean;
  action?: "deleted" | "archived";
  message?: string;
};


type RestoreProductResponse = {
  success?: boolean;
  action?: "restored";
  message?: string;
};


type ArchiveProductResponse = {
  success?: boolean;
  action?: "archived";
  message?: string;
};







function getProductImage(product: Product) {
  return product.images?.[0]?.image?.secure_url || "";
}

function getCategoryName(product: Product) {
  return (
    product.sub_category?.[0]?.name ||
    product.category_group?.[0]?.name ||
    "Uncategorized"
  );
}

function getOfferPrice(product: Product) {
  if (product.flashdeal?.isFlashDeal && product.flashdeal.offerPrice != null) {
    return Number(product.flashdeal.offerPrice);
  }

  if (typeof product.selling_price === "number") {
    return Number(product.selling_price);
  }

  if (typeof (product as any).price === "number") {
    return Number((product as any).price);
  }

  return 0;
}

function getRegularPrice(product: Product) {
  if (typeof product.selling_price === "number") {
    return Number(product.selling_price);
  }

  if (typeof (product as any).price === "number") {
    return Number((product as any).price);
  }

  return 0;
}

function formatPrice(value: number | string) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<ConditionFilter>("");
  const [flash, setFlash] = useState<FlashFilter>("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [page, setPage] = useState(1);
  const [filtersReady, setFiltersReady] = useState(false);

 
  const limit = 30;

  const [meta, setMeta] = useState({
    total: 0,
    hasMore: false,
    limit,
    page: 1,
  });

  const totalLabel = useMemo(() => {
    if (status === "archived") return "Archived products";
    if (status === "all") return "All products";
    return "Active products";
  }, [status]);

  useEffect(() => {
  let cancelled = false;

  const loadCategories = async () => {
    try {
      const res = await BaseAPI.get<any>("/categories/tree", true);

      const categoryTree = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];

      if (!cancelled) {
        setCategories(categoryTree);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);

      if (!cancelled) {
        setCategories([]);
      }
    }
  };

  loadCategories();

  return () => {
    cancelled = true;
  };
}, []);




  useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  const urlStatus = params.get("status");
  const urlFlash = params.get("flash");
  const urlCondition = params.get("condition");
  const urlSearch = params.get("q") || "";
  const urlPage = Number(params.get("page") || 1);

  const urlCategoryId = params.get("categoryId") || "";

  setSearchInput(urlSearch);
  setSearch(urlSearch);

  setStatus(
    urlStatus === "archived" || urlStatus === "all"
      ? urlStatus
      : "active"
  );

  setFlash(urlFlash === "true" ? "true" : "");

  setCondition(
    urlCondition === "new" ||
      urlCondition === "used" ||
      urlCondition === "refurbished"
      ? urlCondition
      : ""
  );

  setSelectedCategoryId(urlCategoryId);

  setPage(Number.isFinite(urlPage) && urlPage > 0 ? urlPage : 1);

  setFiltersReady(true);
}, []);


  const queryString = useMemo(() => {
    const sp = new URLSearchParams();

    if (search.trim()) sp.set("q", search.trim());
    if (condition) sp.set("condition", condition);
    if (flash) sp.set("flash", flash);
    if (selectedCategoryId) {
  sp.set("categoryId", selectedCategoryId);
}
    sp.set("status", status);
    sp.set("page", String(page));
    sp.set("limit", String(limit));

    return sp.toString();
 }, [search, condition, flash, status, selectedCategoryId, page]);



  useEffect(() => {
  if (!filtersReady || typeof window === "undefined") return;

  const url = `/admin/products?${queryString}`;

  window.history.replaceState(null, "", url);
}, [filtersReady, queryString]);



  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await BaseAPI.get<ProductsResponse>(
  `/admin/products?${queryString}`,
  true
);
      const data = res;

      setItems(Array.isArray(data?.items) ? data.items : []);
      setMeta({
        total: Number(data?.total || 0),
        hasMore: Boolean(data?.hasMore),
        limit: Number(data?.limit || limit),
        page: Number(data?.page || page),
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Products load failed");
      setItems([]);
      setMeta({
        total: 0,
        hasMore: false,
        limit,
        page,
      });
    } finally {
      setLoading(false);
    }
  }, [limit, page, queryString]);

 useEffect(() => {
  if (!filtersReady) return;

  loadProducts();
}, [filtersReady, loadProducts]);

 function applySearch() {
  setPage(1);
  setSearch(searchInput.trim());
}

function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  applySearch();
}

 function handleResetFilters() {
  setSearchInput("");
  setSearch("");
  setCondition("");
  setFlash("");
  setStatus("active");
  setSelectedCategoryId("");
  setPage(1);
}

 async function handleDelete(product: Product) {
  const productId = product.id;
  const productName = product.name;

  const hasOrderHistory =
    Number((product as any).orderCount || 0) > 0 ||
    Number((product as any).orders_count || 0) > 0 ||
    Number((product as any).totalOrders || 0) > 0;

  const confirmMessage = hasOrderHistory
    ? `Do you want to remove the product "${productName}"?\n\nNote: If this product has any order history, it will not be permanently deleted. Instead, it will be archived/unpublished.`
    : `Do you want to permanently delete the product "${productName}"?`;

  const ok = window.confirm(confirmMessage);

  if (!ok) return;

  try {
    setDeletingId(productId);

    const res = (await BaseAPI.delete(
      `/products/${productId}`,
      undefined,
      true
    )) as DeleteProductResponse;

    toast.success(res.message || "Action completed successfully");

    if (items.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
    } else {
      await loadProducts();
    }
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message || "Delete failed");
  } finally {
    setDeletingId(null);
  }
}


  async function handleRestore(productId: string, productName: string) {
  const ok = window.confirm(
    `Do you want to restore the product "${productName}" and publish it again?`
  );

  if (!ok) return;

  try {
    setRestoringId(productId);

    const res = (await BaseAPI.patch(
      `/admin/products/${productId}/restore`,
      {},
      true
    )) as RestoreProductResponse;

    toast.success(res.message || "Product restored successfully");
    await loadProducts();
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message || "Restore failed");
  } finally {
    setRestoringId(null);
  }
}

async function handleArchive(productId: string, productName: string) {
  const ok = window.confirm(
    `Do you want to archive the product "${productName}"?`
  );

  if (!ok) return;

  try {
    setArchivingId(productId);

    const res = (await BaseAPI.patch(
      `/admin/products/${productId}/archive`,
      {},
      true
    )) as ArchiveProductResponse;

    toast.success(res.message || "Product archived successfully");
    await loadProducts();
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message || "Archive failed");
  } finally {
    setArchivingId(null);
  }
}


  return (
    <AdminGuard>
      <div className="p-4 md:p-6">
       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
  <div>
    <h1 className="text-2xl font-bold">Products</h1>
    <p className="text-sm text-gray-500 dark:text-gray-300">
      {totalLabel}:{" "}
      <span className="font-medium text-gray-800 dark:text-gray-300">{meta.total}</span>
    </p>
  </div>
<div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end lg:gap-3">
  <Link
    href="/admin/products/upload"
    className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
  >
    + Upload Product
  </Link>

  <button
    type="button"
    onClick={handleResetFilters}
    className="rounded-xl border border-gray-800 px-3 py-2 text-sm font-medium bg-white text-black hover:bg-gray-50 md:hidden"
  >
    Clear Filter
  </button>
</div>
</div>

       
  <form onSubmit={handleSearchSubmit}>
    {/* Mobile Layout */}
    <div className="space-y-3 md:hidden">
      <div>
        <input
  type="text"
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applySearch();
    }
  }}
  placeholder="Search by product name or slug"
  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
/>
      </div>

      <div className="grid grid-cols-3 gap-2">
        

        <div className="min-w-0">
          <select
            value={flash}
            onChange={(e) => {
              setFlash(e.target.value as FlashFilter);
              setPage(1);
            }}
            className="w-full min-w-0 rounded-xl border px-2 py-3 text-xs outline-none focus:border-black"
          >
            <option value="">All Products</option>
            <option value="true">Flash Deal Only</option>
          </select>
        </div>

        <div className="min-w-0">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="w-full min-w-0 rounded-xl border px-2 py-3 text-xs outline-none focus:border-black"
          >
            <option value="active">Active Products</option>
            <option value="archived">Archived Products</option>
            <option value="all">All Products</option>
          </select>
        </div>


        <div className="min-w-0">
  <select
    value={selectedCategoryId}
    onChange={(e) => {
      setSelectedCategoryId(e.target.value);
      setPage(1);
    }}
    className="w-full min-w-0 rounded-xl border px-2 py-3 text-xs outline-none focus:border-black"
  >
    <option value="">All Categories</option>

    {categories.map((parent) => {
      const parentId = getCategoryId(parent);
      const children = Array.isArray(parent.children)
        ? parent.children
        : [];

      if (!parentId) return null;

      return (
        <optgroup key={parentId} label={parent.name}>
          <option value={parentId}>
            All {parent.name}
          </option>

          {children.map((child) => {
            const childId = getCategoryId(child);

            if (!childId) return null;

            return (
              <option key={childId} value={childId}>
                — {child.name}
              </option>
            );
          })}
        </optgroup>
      );
    })}
  </select>
</div>
      </div>

      <div>
        
      </div>
    </div>

    {/* Desktop Layout - Unchanged */}
    <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-6 pb-4">
  <div className="xl:col-span-2">
    <input
  type="text"
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applySearch();
    }
  }}
  placeholder="Search by product name or slug"
  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
/>
  </div>

  <div>
    <select
      value={flash}
      onChange={(e) => {
        setFlash(e.target.value as FlashFilter);
        setPage(1);
      }}
      className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
    >
      <option value="">All Products</option>
      <option value="true">Flash Deal Only</option>
    </select>
  </div>

  <div>
    <select
      value={status}
      onChange={(e) => {
        setStatus(e.target.value as StatusFilter);
        setPage(1);
      }}
      className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
    >
      <option value="active">Active Products</option>
      <option value="archived">Archived Products</option>
      <option value="all">All Products</option>
    </select>
  </div>

  <div>
  <select
    value={selectedCategoryId}
    onChange={(e) => {
      setSelectedCategoryId(e.target.value);
      setPage(1);
    }}
    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
  >
    <option value="">All Categories</option>

    {categories.map((parent) => {
      const parentId = getCategoryId(parent);
      const children = Array.isArray(parent.children)
        ? parent.children
        : [];

      if (!parentId) return null;

      return (
        <optgroup key={parentId} label={parent.name}>
          <option value={parentId}>
            All {parent.name}
          </option>

          {children.map((child) => {
            const childId = getCategoryId(child);

            if (!childId) return null;

            return (
              <option key={childId} value={childId}>
                — {child.name}
              </option>
            );
          })}
        </optgroup>
      );
    })}
  </select>
</div>

<div className="flex justify-end">
    <button
      type="button"
      onClick={handleResetFilters}
      className="rounded-xl border  px-4 py-3 text-sm font-medium bg-white text-black hover:bg-gray-50"
    >
      Clear Filter
    </button>
  </div>
</div>
  </form>


        <div className="rounded-2xl border bg-white dark:bg-gray-800">
  {/* Mobile View */}
  <div className="block md:hidden">
    {loading ? (
      <div className="px-4 py-10 text-center text-sm text-gray-500">
        Loading products...
      </div>
    ) : !items.length ? (
      <div className="px-4 py-10 text-center text-sm text-gray-500">
        No products found
      </div>
    ) : (
      <div className="divide-y">
        {items.map((product) => {
          const imageUrl = getProductImage(product);
          const regularPrice = getRegularPrice(product);
          const offerPrice = getOfferPrice(product);
          const hasDiscount =
            offerPrice > 0 && offerPrice < regularPrice;

          return (
            <div key={product.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-gray-50">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
    <p className="line-clamp-2 min-w-0 flex-1 font-semibold text-gray-900 dark:text-gray-300">
      {product.name}
    </p>

    <div className="shrink-0 text-right">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-300">
        {formatPrice(offerPrice || regularPrice)}
      </div>

      {hasDiscount ? (
        <div className="text-[11px] text-gray-500 line-through">
          {formatPrice(regularPrice)}
        </div>
      ) : null}
    </div>
  </div>

                  <p className="mt-1 break-all text-xs text-gray-500">
                    /{product.slug || ""}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.hasVariants ? (
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                        Variant Product
                      </span>
                    ) : null}

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        product.isPublish
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.isPublish ? "Published" : "Archived"}
                    </span>

                    {product.flashdeal?.isFlashDeal ? (
                      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700">
                        Flash Deal
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

            

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="rounded-lg border px-3 py-2 text-center text-xs font-medium hover:bg-gray-50"
                >
                  Edit
                </Link>

                <Link
                  href={`/admin/products/${product.id}`}
                
                  className="rounded-lg border px-3 py-2 text-center text-xs font-medium hover:bg-gray-50"
                >
                  View
                </Link>

                {product.isPublish ? (
                  <button
                    type="button"
                    onClick={() => handleArchive(product.id, product.name)}
                    disabled={
                      archivingId === product.id ||
                      deletingId === product.id ||
                      restoringId === product.id
                    }
                    className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                  >
                    {archivingId === product.id ? "Archiving..." : "Archive"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRestore(product.id, product.name)}
                    disabled={
                      restoringId === product.id ||
                      deletingId === product.id ||
                      archivingId === product.id
                    }
                    className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                  >
                    {restoringId === product.id ? "Restoring..." : "Restore"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  disabled={
                    deletingId === product.id ||
                    archivingId === product.id ||
                    restoringId === product.id
                  }
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === product.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>

  {/* Desktop View - Unchanged */}
  <div className="hidden md:block">
    <div className="overflow-x-auto">
      <table className="min-w-[1100px] w-full">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-gray-700 text-left text-sm text-gray-600 dark:text-gray-200">
            <th className="px-4 py-3 font-semibold">Product</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">SKU</th>
          
            <th className="px-4 py-3 font-semibold">Price</th>
            <th className="px-4 py-3 font-semibold">Stock</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-10 text-center text-sm text-gray-500"
              >
                Loading products...
              </td>
            </tr>
          ) : !items.length ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-10 text-center text-sm text-gray-500"
              >
                No products found
              </td>
            </tr>
          ) : (
            items.map((product) => {
              const imageUrl = getProductImage(product);
              const regularPrice = getRegularPrice(product);
              const offerPrice = getOfferPrice(product);
              const hasDiscount =
                offerPrice > 0 && offerPrice < regularPrice;

              return (
                <tr key={product.id} className="border-b last:border-b-0">
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-gray-50">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-2 font-semibold text-gray-900 dark:text-gray-300">
                          {product.name}
                        </p>
                        <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-300">
                          /{product.slug || ""}
                        </p>
                        {product.hasVariants ? (
                          <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ">
                            Variant Product
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-gray-700 dark:text-gray-300">
                    {getCategoryName(product)}
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-gray-700 dark:text-gray-300">
                    {product.sku || "—"}
                  </td>

                  

                  <td className="px-4 py-4 align-top text-sm text-gray-700 dark:text-gray-300">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-300">
                        {formatPrice(offerPrice || regularPrice)}
                      </div>

                      {hasDiscount ? (
                        <div className="text-xs text-gray-500 dark:text-gray-300 line-through">
                          {formatPrice(regularPrice)}
                        </div>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-gray-700 dark:text-gray-300">
                    {product.total_stock ?? (product as any).stock ?? 0}
                  </td>

                  <td className="px-4 py-4 align-top text-sm">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isPublish
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.isPublish ? "Published" : "Archived"}
                      </span>

                      {product.flashdeal?.isFlashDeal ? (
                        <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                          Flash Deal
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                      >
                        Edit
                      </Link>

                      {product.isPublish ? (
                        <button
                          type="button"
                          onClick={() => handleArchive(product.id, product.name)}
                          disabled={
                            archivingId === product.id ||
                            deletingId === product.id ||
                            restoringId === product.id
                          }
                          className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                        >
                          {archivingId === product.id ? "Archiving..." : "Archive"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestore(product.id, product.name)}
                          disabled={
                            restoringId === product.id ||
                            deletingId === product.id ||
                            archivingId === product.id
                          }
                          className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                        >
                          {restoringId === product.id ? "Restoring..." : "Restore"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={
                          deletingId === product.id ||
                          archivingId === product.id ||
                          restoringId === product.id
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>

                      <Link
                        href={`/admin/products/${product.id}`}
                       
                        className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>

  <div className="flex flex-col gap-3 border-t px-4 py-4 md:flex-row md:items-center md:justify-between">
    <p className="text-sm text-gray-500">
      Page <span className="font-medium text-gray-800">{meta.page}</span> •
      Showing{" "}
      <span className="font-medium text-gray-800">{items.length}</span> of{" "}
      <span className="font-medium text-gray-800">{meta.total}</span>
    </p>

    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        disabled={page === 1 || loading}
        className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 md:flex-none"
      >
        Previous
      </button>

      <button
        type="button"
       onClick={() => setPage((prev) => prev + 1)}
        disabled={!meta.hasMore || loading}
        className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 md:flex-none"
      >
        Next
      </button>
    </div>
  </div>
</div>



</div>

        
     
    </AdminGuard>
  );
}