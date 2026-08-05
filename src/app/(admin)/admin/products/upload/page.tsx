"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";
import AddCategoryModal, {
  CategoryOption,
} from "@/components/admin/products/AddCategoryModal";
import AdminGuard from "@/components/guards/AdminGuard";

type CategoryNode = {
  id: string;
  name: string;
  children?: CategoryNode[];
};

type UploadedImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
};

type UploadedVideo = {
  url: string;
  publicId: string;
  duration?: number;
  format?: string;
  bytes?: number;
};

type VariantForm = {
  optionsText: string;
  extraPrice: string;
  stock: string;
  
    colorCode: string;
};

type ProductForm = {
  name: string;
 
  description: string;
  price: string;
  discountPrice: string;


  weight:string;

length:string;
width:string;
height:string;

  stock: string;
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


   weight: "",
  length: "",
  width: "",
  height: "",
  condition: "new",
  categoryId: "",
  isFlashDeal: false,
  flashStartAt: "",
  flashEndAt: "",
};

const initialVariant: VariantForm = {
  optionsText: "",
  extraPrice: "0",
  stock: "0",
  
  colorCode: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

// function parseVariantOptionsText(input: string): Record<string, string> {
//   const parts = input
//     .split(",")
//     .map((part) => part.trim())
//     .filter(Boolean);

//   const options: Record<string, string> = {};

//   for (const part of parts) {
//     const eqIndex = part.indexOf("=");

//     if (eqIndex === -1) {
//       throw new Error(`Invalid format: "${part}". Use Group=Value`);
//     }

//     const rawKey = part.slice(0, eqIndex).trim();
//     const rawValue = part.slice(eqIndex + 1).trim();

//     if (!rawKey || !rawValue) {
//       throw new Error(`Invalid format: "${part}". Use Group=Value`);
//     }

//     if (options[rawKey]) {
//       throw new Error(`Duplicate option group: "${rawKey}"`);
//     }

//     options[rawKey] = rawValue;
//   }

//   if (!Object.keys(options).length) {
//     throw new Error("Variant options are required");
//   }

//   return options;
// }

function parseVariantOptionsText(input: string): Record<string, string> {
  const normalized = input
    .replace(/\s+(?=[A-Za-z]+\s*=)/g, ", ");

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const options: Record<string, string> = {};

  for (const part of parts) {
    const eqIndex = part.indexOf("=");

    if (eqIndex === -1) {
      throw new Error(`Invalid format: "${part}"`);
    }

    const key = part.slice(0, eqIndex).trim();
    const value = part.slice(eqIndex + 1).trim();

    options[key] = value;
  }

  return options;
}

function buildNormalizedCombinationKey(options: Record<string, string>) {
  return Object.entries(options)
    .map(([key, value]) => [key.trim().toLowerCase(), value.trim().toLowerCase()] as const)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}


function hasColorOption(options: Record<string, string>) {
  return Object.keys(options).some(
    (key) => key.trim().toLowerCase() === "color"
  );
}

function isValidHexColor(value: string) {
  if (!value.trim()) return true;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

export default function AdminProductUploadPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const res = await BaseAPI.get("/categories/tree");
      const tree = unwrap<CategoryNode[]>(res);
      const flat = flattenCategories(Array.isArray(tree) ? tree : []);
      setCategories(flat);
    } catch (error) {
      console.error(error);
      toast.error("Category load failed");
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

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
      toast.error("Only JPG, PNG, WEBP image allowed");
      e.target.value = "";
      return;
    }

    const oversize = newFiles.find((file) => file.size > 5 * 1024 * 1024);
    if (oversize) {
      toast.error(`${oversize.name} more than 5MB`);
      e.target.value = "";
      return;
    }

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

      if (merged.length > 10) {
        toast.error("A maximum of 10 images can be uploaded.");
        return prev;
      }

      return merged;
    });

    e.target.value = "";
  }

  function removeImage(index: number) {
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
    setVariants((prev) => [...prev, { ...initialVariant }]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, key: keyof VariantForm, value: string) {
    setVariants((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function validateForm() {
    if (!form.name.trim()) return "Product name required";


//     if (!form.weight || Number(form.weight)<=0)
// {
//  return "Product weight required";
// }


// if (
//  !form.length ||
//  !form.width ||
//  !form.height
// ){
//  return "Product dimension required";
// }

    if (!form.categoryId) return "Category required";
    if (form.price === "" || Number(form.price) < 0) return "Valid price required";
    if (form.stock === "" || Number(form.stock) < 0) return "Valid stock required";

    if (form.isFlashDeal) {
      if (!form.discountPrice || Number(form.discountPrice) <= 0) {
        return "Discount price is required when Flash Deal is enabled.";
      }

      if (Number(form.discountPrice) >= Number(form.price)) {
        return "The discount price must be lower than the regular price.";
      }
    }

    const seenCombinationKeys = new Set<string>();

    for (const v of variants) {
      if (!v.optionsText.trim()) {
        return "All variants must have options";
      }

      if (Number(v.extraPrice) < 0) {
        return "Variant extra price must be valid";
      }

      if (v.stock === "" || Number(v.stock) < 0) {
        return "Variant stock must be valid";
      }

      let parsedOptions: Record<string, string>;

      try {
        parsedOptions = parseVariantOptionsText(v.optionsText);

        if (v.colorCode.trim()) {
  if (!hasColorOption(parsedOptions)) {
    return "If you provide a color code, the options must include Color";
  }

  if (!isValidHexColor(v.colorCode)) {
    return "Color code must be a valid hex code. Example: #ff0000";
  }
}
      } catch (error: any) {
        return error?.message || "Variant options invalid";
      }

      const comboKey = buildNormalizedCombinationKey(parsedOptions);

      if (seenCombinationKeys.has(comboKey)) {
        return `Duplicate variant combination found: ${v.optionsText}`;
      }

      seenCombinationKeys.add(comboKey);
    }

    return null;
  }

  async function uploadImages() {
    if (!imageFiles.length) return [];

    const fd = new FormData();
    imageFiles.forEach((file) => fd.append("file", file));

    const res = await BaseAPI.post("/upload/product-images", fd, true);
    const uploaded = unwrap<UploadedImage[]>(res);

    return uploaded.map((item, index) => ({
      type: "image" as const,
      url: item.url,
      publicId: item.publicId,
      width: item.width,
      height: item.height,
      format: item.format,
      position: index,
    }));
  }

  async function uploadVideo() {
    if (!videoFile) return null;

    const fd = new FormData();
    fd.append("file", videoFile);

    const res = await BaseAPI.post("/upload/product-video", fd, true);
    const uploaded = unwrap<UploadedVideo>(res);

    return {
      type: "video" as const,
      url: uploaded.url,
      publicId: uploaded.publicId,
      format: uploaded.format,
      position: imageFiles.length,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSubmitting(true);

      const uploadedImages = await uploadImages();
      const uploadedVideo = await uploadVideo();

      const media = uploadedVideo ? [...uploadedImages, uploadedVideo] : uploadedImages;

      const payload = {
        name: form.name.trim(),
        
        description: form.description.trim() || undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      
        stock: Number(form.stock),

weight: form.weight ? Number(form.weight) : undefined,

length: form.length ? Number(form.length) : undefined,

width: form.width ? Number(form.width) : undefined,

height: form.height ? Number(form.height) : undefined,


        condition: form.condition,
        categoryId: form.categoryId,
        isFlashDeal: form.isFlashDeal,
        flashStartAt: form.flashStartAt
          ? new Date(form.flashStartAt).toISOString()
          : undefined,
        flashEndAt: form.flashEndAt
          ? new Date(form.flashEndAt).toISOString()
          : undefined,
        media,
        variants: variants.map((v) => {
          const parsedOptions = parseVariantOptionsText(v.optionsText);

          return {
            options: parsedOptions,
            extraPrice: Number(v.extraPrice || 0),
            stock: Number(v.stock || 0),
            
            colorCode: v.colorCode.trim() || undefined,
          };
        }),
      };

      await BaseAPI.post("/products", payload, true);

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Product upload failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCategoryCreated(category: CategoryOption) {
    await loadCategories();
    setForm((prev) => ({
      ...prev,
      categoryId: category.id,
    }));
  }

  return (
    <AdminGuard>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Upload Product</h1>
            <p className="text-sm text-gray-500">
              Add a new product from the admin panel
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
                    placeholder="Product name"
                  />
                </div>

               
<div>
<label className="mb-2 block text-sm font-medium">
Weight (kg)
</label>

<input
type="number"
step="0.001"
min="0"
value={form.weight}
placeholder="Default 0.4 kg"


onChange={(e)=>
 updateForm("weight",e.target.value)
}
className="w-full rounded-xl border px-4 py-3"
/>

</div>


<div className="grid grid-cols-3 gap-3">

<div>
<label>
Length (cm)
</label>

<input
type="number"
min="0"
value={form.length}
placeholder="Optional"
onChange={(e)=>
updateForm("length",e.target.value)
}
/>

</div>


<div>
<label>
Width (cm)
</label>

<input
type="number"
min="0"
value={form.width}
onChange={(e)=>
updateForm("width",e.target.value)
}
/>

</div>


<div>
<label>
Height (cm)
</label>

<input
type="number"
min="0"
value={form.height}
onChange={(e)=>
updateForm("height",e.target.value)
}
/>

</div>

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
                    placeholder="0"
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
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                If variants have their own stock, you can set product stock to 0.
                  </p>
                </div>

               

                <div>
                  <label className="mb-2 block text-sm font-medium">Category</label>

                  <div className="flex gap-2">
                    <select
                      value={form.categoryId}
                      onChange={(e) => updateForm("categoryId", e.target.value)}
                      disabled={loadingCategories}
                      className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-black"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    className="min-h-[140px] w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                    placeholder="Product description"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Variants</h2>
                  <p className="mt-1 text-xs text-gray-500">
                      Enter variant options in this format: <span className="font-medium"> Color=Red, Size=M, Material=Cotton</span>
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
                  {variants.map((variant, index) => (
                    <div key={index} className="rounded-2xl border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-medium">Variant {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-sm text-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Options
                          </label>
                          <input
                            type="text"
                            value={variant.optionsText}
                            onChange={(e) =>
                              updateVariant(index, "optionsText", e.target.value)
                            }
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                            placeholder="Color=Red, Size=M"
                          />
                        </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Extra Price
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.extraPrice}
                              onChange={(e) =>
                                updateVariant(index, "extraPrice", e.target.value)
                              }
                              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Stock
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(index, "stock", e.target.value)
                              }
                              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                              placeholder="0"
                            />
                          </div>

                        

<div>
  <label className="mb-2 block text-sm font-medium">
    Color Code
  </label>
  <div className="flex gap-2">
    <input
      type="text"
      value={variant.colorCode}
      onChange={(e) =>
        updateVariant(index, "colorCode", e.target.value)
      }
      className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
      placeholder="#ff0000"
    />

    <input
      type="color"
      value={
        /^#([0-9A-Fa-f]{6})$/.test(variant.colorCode)
          ? variant.colorCode
          : "#000000"
      }
      onChange={(e) =>
        updateVariant(index, "colorCode", e.target.value)
      }
      className="h-[50px] w-[58px] rounded-xl border bg-white p-1"
      title="Pick color"
    />
  </div>
  <p className="mt-1 text-xs text-gray-500">
    শুধু Color variant থাকলে optional
  </p>
</div>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Media</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Images (.jpg, .jpeg, .png, .webp)
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
                            onClick={() => removeImage(index)}
                            className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* <div>
                  <label className="mb-2 block text-sm font-medium">
                    Video (optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={onVideoChange}
                    className="block w-full rounded-xl border px-4 py-3"
                  />

                  {videoFile && (
                    <p className="mt-3 text-sm text-gray-600">{videoFile.name}</p>
                  )}
                </div> */}
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
                  <label className="mb-2 block text-sm font-medium">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountPrice}
                    onChange={(e) => updateForm("discountPrice", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Flash Start
                  </label>
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
                disabled={submitting}
                className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Create Product"}
              </button>
            </div>
          </div>
        </form>

        <AddCategoryModal
          open={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          categories={categories}
          onCreated={handleCategoryCreated}
        />
      </div>
    </AdminGuard>
  );
}