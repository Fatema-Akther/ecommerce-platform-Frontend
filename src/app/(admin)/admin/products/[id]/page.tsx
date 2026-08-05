"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";
import { MdEditSquare } from "react-icons/md";

type ProductImage = {
  _id: string;
  image?: {
    secure_url?: string;
    optimizeUrl?: string;
    public_id?: string;
  };
  alterImage?: {
    secure_url?: string;
    optimizeUrl?: string;
    public_id?: string;
  };
};

type ProductVideo = {
  _id: string;
  video?: {
    secure_url?: string;
    public_id?: string;
  };
  alterVideo?: {
    secure_url?: string;
    public_id?: string;
  };
};

type ProductVariant = {
  id?: string;
  _id?: string;
  productId?: string;
  name: string;
  sku?: string;
  selling_price?: string;
  condition?: string;
  discount_type?: string | null;
  discount_percent?: string;
  discount_amount?: string;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  offer_price?: string;
  variants_stock?: number;
  variants_values?: string[] | string | null;
  total_sold?: number;
  isPublish?: boolean;
  isPreOrder?: boolean;
};

type ProductDetails = {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  sku?: string;
  short_description?: string;
  long_description?: string;
  selling_price?: number;
  total_stock?: number;
  total_sold?: number;
  isFlashDeal?: boolean;
  flashEndAt?: string | null;
  flashdeal?: {
    isFlashDeal: boolean;
    startAt: string | null;
    endAt: string | null;
    offerPrice: number;
    discountPercent: number;
  } | null;
  category_group?: {
    _id: string;
    name: string;
  }[];
  sub_category?: {
    _id: string;
    name: string;
  }[];
  images?: ProductImage[];
  video?: ProductVideo[];
  hasVariants?: boolean;
  variantsId?: ProductVariant[];
  currency?: string;
  isPublish?: boolean;
};

function formatPrice(value?: string | number | null) {
  const num = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(num) ? num : 0);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function getImageSrc(img?: ProductImage) {
  return img?.image?.secure_url || img?.alterImage?.secure_url || "";
}

function getVideoSrc(video?: ProductVideo | null) {
  return video?.video?.secure_url || video?.alterVideo?.secure_url || "";
}

export default function AdminProductDetailsPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      try {
        setLoading(true);
        const res = await BaseAPI.get<ProductDetails>(`/products/by-id/${id}`);
        setProduct(res);
      } catch (error: any) {
        console.error(error);
        toast.error(error?.message || "Product load failed");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">
          Product not found
        </div>
      </div>
    );
  }

  const video = product.video?.[0] || null;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin view for full product information
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back
          </Link>

          <Link
          
            href={`/admin/products/${product.id}/edit`}
            
             className="inline-flex items-center gap-2  border rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
         <MdEditSquare className="h-4 w-4 text-neutral-300" />
            <span>
    Edit Product
  </span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Product ID</p>
                <p className="  font-medium text-gray-900 dark:text-gray-300">{product.id || "—"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Product Name</p>
                <p className="  font-medium text-gray-900 dark:text-gray-300">{product.name || "—"}</p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Slug</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">{product.slug || "—"}</p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">SKU</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">{product.sku || "—"}</p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Category</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">
                  {product.sub_category?.[0]?.name ||
                    product.category_group?.[0]?.name ||
                    "Uncategorized"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Regular Price</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">
                  {formatPrice(product.selling_price)}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Offer Price</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">
                  {product.flashdeal?.offerPrice != null
                    ? formatPrice(product.flashdeal.offerPrice)
                    : "—"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Total Stock</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">
                  {product.total_stock ?? 0}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Total Sold</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">
                  {product.total_sold ?? 0}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Publish Status</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">
                  {product.isPublish ? "Published" : "Draft"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Has Variants</p>
                <p className="font-medium text-gray-900 dark:text-gray-300">
                  {product.hasVariants ? "Yes" : "No"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Description</p>
                <div className="rounded-xl border bg-gray-50 dark:bg-gray-600 p-4 text-sm text-gray-800 dark:text-gray-200">
                  {product.long_description ||
                    product.short_description ||
                    "No description"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold ">Flash Deal Info</h2>

            {!product.flashdeal ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No active flash deal</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Status</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300">Active</p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Discount Percent</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300">
                    {product.flashdeal.discountPercent}%
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">Offer Price</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300">
                    {formatPrice(product.flashdeal.offerPrice)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Start</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300">
                    {formatDate(product.flashdeal.startAt)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">End</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300">
                    {formatDate(product.flashdeal.endAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Variants</h2>

            {!product.variantsId?.length ? (
              <p className="text-sm text-gray-500">No variants</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-600 dark:text-gray-300">
                      <th className="px-3 py-3 font-semibold">Variant Name</th>
                      <th className="px-3 py-3 font-semibold">Value</th>
                      <th className="px-3 py-3 font-semibold">SKU</th>
                      <th className="px-3 py-3 font-semibold">Regular Price</th>
                      <th className="px-3 py-3 font-semibold">Offer Price</th>
                      <th className="px-3 py-3 font-semibold">Stock</th>
                      <th className="px-3 py-3 font-semibold">Sold</th>
                 
                    </tr>
                  </thead>
                  <tbody>
                    {product.variantsId.map((variant, index) => {
                      const value = Array.isArray(variant.variants_values)
                        ? variant.variants_values.join(", ")
                        : variant.variants_values || "—";

                      return (
                        <tr key={variant.id || variant._id || index} className="border-b last:border-b-0">
                          <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-300">
                            {variant.name || "—"}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-300">
                            {value}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-300">
                            {variant.sku || "—"}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-300">
                            {formatPrice(variant.selling_price)}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-300 ">
                            {formatPrice(variant.offer_price)}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-300">
                            {variant.variants_stock ?? 0}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-300">
                            {variant.total_sold ?? 0}
                          </td>
                          
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Images</h2>

            {!product.images?.length ? (
              <p className="text-sm text-gray-500 dark:text-gray-300">No images</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {product.images.map((img) => {
                  const src = getImageSrc(img);
                  return (
                    <div key={img._id} className="overflow-hidden rounded-xl border bg-gray-50">
                      {src ? (
                        <img
                          src={src}
                          alt="product"
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center text-sm text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        
        </div>
      </div>
    </div>
  );
}