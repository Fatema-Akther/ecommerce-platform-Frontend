"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";

export type CategoryOption = {
  id: string;
  name: string;
};

type AddCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  onCreated: (category: CategoryOption) => void | Promise<void>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function unwrap<T>(res: any): T {
  return (res?.data ?? res) as T;
}

export default function AddCategoryModal({
  open,
  onClose,
  categories,
  onCreated,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setParentId("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name required");
      return;
    }

    const finalSlug = slugify(slug || name);
    if (!finalSlug) {
      toast.error("Valid slug required");
      return;
    }

    try {
      setSubmitting(true);

      const payload: Record<string, any> = {
        name: name.trim(),
        slug: finalSlug,
      };

      if (parentId) {
        payload.parentId = parentId;
      }

      // যদি তোমার backend route আলাদা হয়, শুধু এই line change করবে
      const res = await BaseAPI.post("/categories", payload);

      const created = unwrap<any>(res);

      const createdCategory: CategoryOption = {
        id: String(created.id),
        name: String(created.name),
      };

      await onCreated(createdCategory);
      toast.success("Category created");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Category create failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Category</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                if (!slug.trim()) {
                  setSlug(slugify(v));
                }
              }}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              placeholder="Category name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              placeholder="category-slug"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Parent Category
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
            >
              <option value="">No Parent</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}