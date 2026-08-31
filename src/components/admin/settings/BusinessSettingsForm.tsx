"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useBusiness } from "@/hooks/useBusiness";

function getLogoUrl(
  logo:
    | string
    | {
        url?: string;
        secure_url?: string;
      }
    | null
    | undefined
) {
  if (typeof logo === "string") return logo;
  return logo?.secure_url || logo?.url || "";
}

export default function BusinessSettingsForm() {
  const { businessData, loading, refetch } = useBusiness();

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const [existingBanners, setExistingBanners] = useState<string[]>([]);
const [heroFiles, setHeroFiles] = useState<File[]>([]);

const [heroPreviews, setHeroPreviews] = useState<string[]>([]);


useEffect(() => {
  if (!businessData) return;

  setExistingBanners(businessData.heroBanners ?? []);
}, [businessData]);


  useEffect(() => {
    if (!businessData) return;

    setBusinessName(businessData.businessName || "");
    setEmail(businessData.email || "");
    setPhone(businessData.phone || "");
    setAddress(businessData.address || "");
    setFacebookUrl(businessData.facebookUrl || "");
    setInstagramUrl(businessData.instagramUrl || "");
    setTiktokUrl(businessData.tiktokUrl || "");
    setLogoPreview(getLogoUrl(businessData.logo));
  }, [businessData]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, JPEG, or WEBP logo is allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo size must be less than 2MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const total = existingBanners.length + heroFiles.length;

  if (total > 5) {
    alert("Maximum 5 banners allowed in total");
    return;
  }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("businessName", businessName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("facebookUrl", facebookUrl);
      formData.append("instagramUrl", instagramUrl);
      formData.append("tiktokUrl", tiktokUrl);

      // ✅ LOGO
if (logoFile) {
  formData.append("logo", logoFile);
}

// ✅ HERO BANNERS (IMPORTANT FIX)
heroFiles.forEach((file) => {
  formData.append("heroBanners", file);
});



formData.append(
  "existingHeroBanners",
  JSON.stringify(existingBanners)
);

     const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/business-settings`,
  {
    method: "PATCH",
    body: formData,
    credentials: "include",
  }
);

      const resultText = await response.text();

let result: any = null;

try {
  result = resultText ? JSON.parse(resultText) : null;
} catch {
  result = null;
}

if (!response.ok) {
  console.error("Business settings update failed:", {
    status: response.status,
    response: result || resultText,
  });

  throw new Error(
    result?.message ||
      resultText ||
      "Failed to update business settings"
  );
}
      await refetch();
      setLogoFile(null);

      setHeroFiles([]);

heroPreviews.forEach((url) => URL.revokeObjectURL(url));
setHeroPreviews([]);

      alert("Business settings updated successfully.");
    } catch (error) {
  console.error(error);

  alert(
    error instanceof Error
      ? error.message
      : "Failed to update business settings."
  );
} finally {
  setSubmitting(false);
}
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading business settings...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Business Settings
      </h2>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Business Logo
        </label>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-24 w-56 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Business logo preview"
                width={180}
                height={60}
                className="h-auto max-h-16 w-auto object-contain"
              />
            ) : (
              <span className="text-sm text-gray-500">No logo uploaded</span>
            )}
          </div>

          <div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleLogoChange}
              className="block text-sm text-gray-700 dark:text-gray-200"
            />

            <p className="mt-2 text-xs text-gray-500">
              Recommended size: 220×70px. Max file size: 2MB.
            </p>
          </div>
        </div>
      </div>

     <div className="mb-6">

  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
    Hero Banners
    Allowed formats PNG, JPG, JPEG, WEBP
  </label>

  {/* 👇 ADD THIS BLOCK HERE (EXISTING BANNERS PREVIEW) */}
  <div className="grid grid-cols-3 gap-3 mb-4">
    {existingBanners.map((img, index) => (
      <div key={index} className="relative">
        <img
          src={img}
          className="h-24 w-full object-cover rounded-md border"
        />

        <button
          type="button"
          onClick={() => {
            setExistingBanners((prev) =>
              prev.filter((_, i) => i !== index)
            );
          }}
          className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 rounded"
        >
          X
        </button>
      </div>
    ))}
  </div>

  {/* 👇 THEN KEEP YOUR INPUT BELOW */}
<input
  type="file"
  multiple
  accept="image/png,image/jpeg,image/jpg,image/webp"
  onChange={(e) => {
    const files = Array.from(e.target.files || []);

    // existing saved + already selected + newly selected
    const total =
      existingBanners.length +
      heroFiles.length +
      files.length;

    if (total > 5) {
      alert("Maximum 5 banners allowed");
      e.target.value = "";
      return;
    }

    const newPreviews = files.map((file) =>
      URL.createObjectURL(file)
    );

    // ✅ আগের files রেখে নতুনগুলো add হবে
    setHeroFiles((prev) => [
      ...prev,
      ...files,
    ]);

    // ✅ আগের previews রেখে নতুনগুলো add হবে
    setHeroPreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    // একই input থেকে পরে আবার file select করতে সুবিধা হবে
    e.target.value = "";
  }}
  className="block text-sm text-gray-700 dark:text-gray-200"
/>



{heroPreviews.length > 0 && (
  <div className="mt-4">
    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
      Selected Banners ({heroPreviews.length})
    </p>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {heroPreviews.map((preview, index) => (
        <div
          key={preview}
          className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          <img
            src={preview}
            alt={`Selected banner ${index + 1}`}
            className="h-28 w-full object-cover"
          />

          {/* DELETE BUTTON */}
          <button
            type="button"
            onClick={() => {
              // preview URL cleanup
              URL.revokeObjectURL(preview);

              // remove preview
              setHeroPreviews((prev) =>
                prev.filter((_, i) => i !== index)
              );

              // remove corresponding file
              setHeroFiles((prev) =>
                prev.filter((_, i) => i !== index)
              );
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow hover:bg-red-700"
            aria-label="Remove banner"
          >
            ×
          </button>

          <div className="truncate px-2 py-2 text-xs text-gray-600 dark:text-gray-300">
            {heroFiles[index]?.name}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

  <p className="mt-2 text-xs text-gray-500">
    You can upload multiple banners (max 5)
    Max file size 2MB per image
  </p>

</div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Business Name
          </label>
          <input
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Business name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email
          </label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="support@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Phone
          </label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="+880..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Facebook URL
          </label>
          <input
            value={facebookUrl}
            onChange={(event) => setFacebookUrl(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="https://facebook.com/your-page"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Instagram URL
          </label>
          <input
            value={instagramUrl}
            onChange={(event) => setInstagramUrl(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="https://instagram.com/your-page"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            TikTok URL
          </label>
          <input
            value={tiktokUrl}
            onChange={(event) => setTiktokUrl(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="https://tiktok.com/@your-page"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Address
        </label>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Business address"
        />
      </div>

      <div className="mt-6">
        <button
  type="submit"
  disabled={submitting}
  className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
>
  {submitting ? (
    <>
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Saving...
    </>
  ) : (
    "Save Settings"
  )}
</button>
      </div>
    </form>
  );
}