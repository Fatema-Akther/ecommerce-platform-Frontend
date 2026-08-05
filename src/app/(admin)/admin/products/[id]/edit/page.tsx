


"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";
import AdminGuard from "@/components/guards/AdminGuard";

type CategoryNode = {
  id: string;
  name: string;
  children?: CategoryNode[];
};

type CategoryOption = {
  id: string;
  name: string;
};

type ExistingImage = {
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

type ExistingVideo = {
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

type VariantOptionForm = {
  group: string;
  value: string;
};

type VariantForm = {
  id?: string;
  options: VariantOptionForm[];
  extraPrice: string;
  stock: string;
  
};

type ProductDetails = {
  id: string;
  _id?: string;
  name: string;
    weight?: number | string;
  slug?: string;
  sku?: string | null;
  short_description?: string;
  long_description?: string;
  selling_price?: number | string;
  total_stock?: number;
  product_stock?: number;
  isFlashDeal?: boolean;
  flashEndAt?: string | null;
  flashdeal?: {
    isFlashDeal: boolean;
    startAt: string | null;
    endAt: string | null;
    offerPrice: number;
    discountPercent: number;
  } | null;
  sub_category?: {
    _id: string;
    name: string;
  }[];
  images?: ExistingImage[];
  video?: ExistingVideo[];
  hasVariants?: boolean;
  variantsId?: Array<{
    id?: string;
    _id?: string;
    name?: string;
    sku?: string | null;
    options?: Record<string, string>;
    combinationKey?: string;
    selling_price?: string | number;
    offer_price?: string | number;
    variants_stock?: number;
    variants_values?: string[] | string | null;
  }>;
};

type ProductForm = {
  name: string;
 
  description: string;
  price: string;
  discountPrice: string;
 
  stock: string;
   weight: string;
  condition: "new" | "used" | "refurbished";
  categoryId: string;
  isFlashDeal: boolean;
  flashStartAt: string;
  flashEndAt: string;
};

const initialForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "0",
  weight: "0",
  condition: "new",
  categoryId: "",
  isFlashDeal: false,
  flashStartAt: "",
  flashEndAt: "",
};

const initialVariant: VariantForm = {
  options: [{ group: "", value: "" }],
  extraPrice: "0",
  stock: "0",
 
};


function flattenCategories(
  nodes: CategoryNode[],
  level = 0,
  acc: CategoryOption[] = []
): CategoryOption[] {
  for (const node of nodes) {
    acc.push({
      id: node.id,
      name: `${"— ".repeat(level)}${node.name}`,
    });

    if (node.children?.length) {
      flattenCategories(node.children, level + 1, acc);
    }
  }

  return acc;
}

function unwrap<T>(res: any): T {
  return (res?.data ?? res) as T;
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function getCleanOptionEntries(options: VariantOptionForm[]) {
  return options
    .map((item) => ({
      group: String(item.group || "").trim(),
      value: String(item.value || "").trim(),
    }))
    .filter((item) => item.group && item.value)
    .sort((a, b) => a.group.localeCompare(b.group));
}

function buildCombinationKeyFromOptions(options: VariantOptionForm[]) {
  const cleanEntries = getCleanOptionEntries(options);

  return cleanEntries
    .map((item) => `${item.group.toLowerCase()}:${item.value.toLowerCase()}`)
    .join("|");
}

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = String(params?.id || "");

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [existingVideo, setExistingVideo] = useState<ExistingVideo | null>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [replaceImages, setReplaceImages] = useState(false);
  const [replaceVideo, setReplaceVideo] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  const imagePreviews = useMemo(() => {
    return imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews]);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const res = await BaseAPI.get("/categories/tree");
      const tree = unwrap<CategoryNode[]>(res);
      const flat = flattenCategories(Array.isArray(tree) ? tree : []);
      setCategories(flat);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Category load failed");
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadProduct() {
    try {
      setLoading(true);

      const res = await BaseAPI.get(`/products/by-id/${productId}`);
      const product = unwrap<ProductDetails>(res);

      const productPrice = Number(product?.selling_price || 0);

      const discountPrice =
        product.flashdeal?.offerPrice != null &&
        Number(product.flashdeal.offerPrice) < productPrice
          ? String(product.flashdeal.offerPrice)
          : "";

  setForm({
  name: product.name || "",
  description: product.long_description || product.short_description || "",
  price: String(productPrice || 0),
  discountPrice,
  stock: String(product.product_stock ?? product.total_stock ?? 0),
  weight: String(product.weight ?? 0),
  condition: "new",
  categoryId: product.sub_category?.[0]?._id || "",
  isFlashDeal: !!product.flashdeal?.isFlashDeal,
  flashStartAt: toDatetimeLocal(product.flashdeal?.startAt),
  flashEndAt: toDatetimeLocal(product.flashdeal?.endAt),
});

      setExistingImages(product.images || []);
      setExistingVideo(product.video?.[0] || null);

      const apiVariants = product.variantsId ?? [];

      const realVariants =
        product.hasVariants && apiVariants.length
          ? apiVariants.map((variant) => {
              const rawOptions = variant.options ?? {};
              const optionEntries = Object.entries(rawOptions).map(
                ([group, value]) => ({
                  group: String(group || ""),
                  value: String(value || ""),
                })
              );

              const safeOptions = optionEntries.length
                ? optionEntries
                : [{ group: "", value: "" }];

              return {
                id: variant.id || variant._id,
                options: safeOptions,
                extraPrice: String(
                  Math.max(
                    0,
                    Number(variant.selling_price || 0) - Number(productPrice || 0)
                  )
                ),
                stock: String(variant.variants_stock ?? 0),
               
              };
            })
          : [];

      setVariants(realVariants);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Product load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!productId) return;
    loadCategories();
    loadProduct();
  }, [productId]);

  function updateForm<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

function onNameChange(value: string) {
  setForm((prev) => ({
    ...prev,
    name: value,
  }));
}

function onImageChange(e: ChangeEvent<HTMLInputElement>) {
  const newFiles = Array.from(e.target.files || []);
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  const invalid = newFiles.find((file) => !allowed.includes(file.type));
  if (invalid) {
    toast.error("শুধু JPG, PNG, WEBP image allowed");
    e.target.value = "";
    return;
  }

  const oversize = newFiles.find((file) => file.size > 5 * 1024 * 1024);
  if (oversize) {
    toast.error(`${oversize.name} 5MB-এর বেশি`);
    e.target.value = "";
    return;
  }

  const existingCount = replaceImages ? 0 : existingImages.length;

  setImageFiles((prev) => {
    const merged = [...prev];

    for (const file of newFiles) {
      const exists = merged.some(
        (item) =>
          item.name === file.name &&
          item.size === file.size &&
          item.lastModified === file.lastModified
      );

      if (!exists) {
        merged.push(file);
      }
    }

    if (existingCount + merged.length > 10) {
      toast.error(
        `সর্বোচ্চ 10টি image রাখা যাবে। Existing image: ${existingCount}টি`
      );
      return prev;
    }

    return merged;
  });

  e.target.value = "";
}

  function removeNewImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function onVideoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setVideoFile(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("শুধু video file allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("ভিডিও 50MB-এর বেশি হতে পারবে না");
      e.target.value = "";
      return;
    }

    setVideoFile(file);
  }

  function addVariant() {
    setVariants((prev) => [...prev, { ...initialVariant, options: [{ group: "", value: "" }] }]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function addOptionToVariant(variantIndex: number) {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              options: [...variant.options, { group: "", value: "" }],
            }
          : variant
      )
    );
  }

  function removeOptionFromVariant(variantIndex: number, optionIndex: number) {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        const nextOptions = variant.options.filter((_, idx) => idx !== optionIndex);

        return {
          ...variant,
          options: nextOptions.length ? nextOptions : [{ group: "", value: "" }],
        };
      })
    );
  }

  function updateVariantOption(
    variantIndex: number,
    optionIndex: number,
    key: keyof VariantOptionForm,
    value: string
  ) {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        return {
          ...variant,
          options: variant.options.map((option, idx) =>
            idx === optionIndex ? { ...option, [key]: value } : option
          ),
        };
      })
    );
  }

  function updateVariant(index: number, key: keyof Omit<VariantForm, "options" | "id">, value: string) {
    setVariants((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function validateForm() {
    if (!form.name.trim()) return "Product name required";
   
    if (!form.categoryId) return "Category required";
    if (form.price === "" || Number(form.price) < 0) return "Valid price required";
    if (form.stock === "" || Number(form.stock) < 0) return "Valid stock required";

    if (form.isFlashDeal) {
      if (!form.discountPrice || Number(form.discountPrice) <= 0) {
        return "Flash deal হলে discount price দিতে হবে";
      }
      if (Number(form.discountPrice) >= Number(form.price)) {
        return "Discount price regular price এর কম হতে হবে";
      }
    }

    const seenCombinations = new Set<string>();

    for (const variant of variants) {
      const cleanOptions = getCleanOptionEntries(variant.options);

      if (!cleanOptions.length) {
        return "প্রতি variant-এ অন্তত ১টি option দিতে হবে";
      }

      if (Number(variant.extraPrice) < 0) {
        return "Variant extra price valid হতে হবে";
      }

      if (variant.stock === "" || Number(variant.stock) < 0) {
        return "Variant stock valid হতে হবে";
      }

      const seenGroups = new Set<string>();
      for (const item of cleanOptions) {
        const groupKey = item.group.toLowerCase();
        if (seenGroups.has(groupKey)) {
          return `একই variant-এ duplicate group আছে: ${item.group}`;
        }
        seenGroups.add(groupKey);
      }

      const comboKey = buildCombinationKeyFromOptions(variant.options);
      if (!comboKey) {
        return "Variant options invalid";
      }

      if (seenCombinations.has(comboKey)) {
        return `Duplicate combination found: ${comboKey}`;
      }

      seenCombinations.add(comboKey);
    }

    return null;
  }

  async function deleteMedia(mediaId: string) {
    try {
      setDeletingMediaId(mediaId);

      await BaseAPI.delete(`/products/${productId}/media/${mediaId}`, undefined, true);

      setExistingImages((prev) => prev.filter((item) => item._id !== mediaId));

      if (existingVideo?._id === mediaId) {
        setExistingVideo(null);
      }

      toast.success("Media deleted");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Media delete failed");
    } finally {
      setDeletingMediaId(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSaving(true);

      const payload: Record<string, any> = {
        name: form.name.trim(),
        
        description: form.description.trim() || null,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      
        stock: Number(form.stock),
        weight: Number(form.weight || 0),
        condition: form.condition,
        categoryId: form.categoryId,
        isFlashDeal: form.isFlashDeal,
        flashStartAt: form.flashStartAt
          ? new Date(form.flashStartAt).toISOString()
          : null,
        flashEndAt: form.flashEndAt
          ? new Date(form.flashEndAt).toISOString()
          : null,
        replaceImages,
        replaceVideo,
        variants: variants
          .map((variant) => {
            const cleanOptions = getCleanOptionEntries(variant.options);
            if (!cleanOptions.length) return null;

            const optionsObject = Object.fromEntries(
              cleanOptions.map((item) => [item.group, item.value])
            );

            return {
              options: optionsObject,
              extraPrice: Number(variant.extraPrice || 0),
              stock: Number(variant.stock || 0),
              
            };
          })
          .filter(Boolean),
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));

     if (imageFiles.length) {
  imageFiles.forEach((file) => fd.append("images", file));
}

      if (replaceVideo && videoFile) {
        fd.append("video", videoFile);
      }

      await BaseAPI.patch(`/products/${productId}/full-update`, fd, true);

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-6">
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">
            Loading product...
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
               Update product information, images, videos, and variants
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                </div>

               

               
                <div>
                  <label className="mb-2 block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => updateForm("stock", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                   If variants have their own stock, you can set product stock to 0.
                  </p>
                </div>



                <div>
  <label className="mb-2 block text-sm font-medium">
    Weight
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={form.weight}
    onChange={(e) =>
      updateForm("weight", e.target.value)
    }
    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
    placeholder="Weight (kg)"
  />
</div>

                {/* <div>
                  <label className="mb-2 block text-sm font-medium">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) =>
                      updateForm(
                        "condition",
                        e.target.value as "new" | "used" | "refurbished"
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div> */}

                <div>
                  <label className="mb-2 block text-sm font-medium">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => updateForm("categoryId", e.target.value)}
                    disabled={loadingCategories}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    className="min-h-[140px] w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Variants</h2>
                  <p className="mt-1 text-xs text-gray-500">
                   You can edit both single-option variants and combination variants.
                  </p>
                </div>


                <button
                  type="button"
                  onClick={addVariant}
                  className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  + Add Variant
                </button>

                
              </div>

              {!variants.length ? (
                <p className="text-sm text-gray-500">No variants added</p>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="rounded-2xl border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-medium">Variant {variantIndex + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeVariant(variantIndex)}
                          className="text-sm text-red-600"
                        >
                          Remove Variant
                        </button>
                      </div>

                      



                      <div className="space-y-3">
                        {variant.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
                          >
                            <input
                              type="text"
                              value={option.group}
                              onChange={(e) =>
                                updateVariantOption(
                                  variantIndex,
                                  optionIndex,
                                  "group",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                              placeholder={
  optionIndex === 0
    ? "Main attribute name, e.g. Color or Size"
    : "Additional attribute name, e.g. Color or Size"
}
                            />

                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) =>
                                updateVariantOption(
                                  variantIndex,
                                  optionIndex,
                                  "value",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                              placeholder="value (Red / M / Cotton)"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeOptionFromVariant(variantIndex, optionIndex)
                              }
                              className="rounded-xl border border-red-200 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => addOptionToVariant(variantIndex)}
                          className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                        >
                          + Add More Attribute
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.extraPrice}
                          onChange={(e) =>
                            updateVariant(variantIndex, "extraPrice", e.target.value)
                          }
                          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                          placeholder="Extra price"
                        />

                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(variantIndex, "stock", e.target.value)
                          }
                          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                          placeholder="Stock"
                        />

                       
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Existing Media</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium">Existing Images</h3>

                  {!existingImages.length ? (
                    <p className="text-sm text-gray-500">No images</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {existingImages.map((img) => {
                        const src =
                          img.image?.secure_url || img.alterImage?.secure_url || "";

                        return (
                          <div key={img._id} className="rounded-xl border p-2">
                            <img
                              src={src}
                              alt="product"
                              className="h-28 w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => deleteMedia(img._id)}
                              disabled={deletingMediaId === img._id}
                              className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              {deletingMediaId === img._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Replace Media</h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-3 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={replaceImages}
                      onChange={(e) => setReplaceImages(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Replace Existing Images</span>
                  </label>

                <input
  type="file"
  multiple
  accept=".jpg,.jpeg,.png,.webp"
  onChange={onImageChange}
  className="block w-full rounded-xl border px-4 py-3"
/>

                  {!!imagePreviews.length && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {imagePreviews.map((item, index) => (
                        <div key={index} className="relative">
                          <img
                            src={item.url}
                            alt={`preview-${index}`}
                            className="h-24 w-full rounded-lg border object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

             
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Flash Deal</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isFlashDeal}
                    onChange={(e) => updateForm("isFlashDeal", e.target.checked)}
                  />
                  <span className="text-sm font-medium">Enable Flash Deal</span>
                </label>

                <div>
                  <label className="mb-2 block text-sm font-medium">Discount Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountPrice}
                    onChange={(e) => updateForm("discountPrice", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Flash Start</label>
                  <input
                    type="datetime-local"
                    value={form.flashStartAt}
                    onChange={(e) => updateForm("flashStartAt", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Flash End</label>
                  <input
                    type="datetime-local"
                    value={form.flashEndAt}
                    onChange={(e) => updateForm("flashEndAt", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}

