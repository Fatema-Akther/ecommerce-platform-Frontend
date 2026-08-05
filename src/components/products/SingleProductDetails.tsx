


"use client";

import { useEffect, useMemo, useState, JSX } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaShippingFast,
  FaMoneyBillAlt,
  FaUndoAlt,
} from "react-icons/fa";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { useSessionStore } from "@/stores/session";
import { useCart } from "@/features/cart/context/CartContext";
import { formatCurrency } from "@/utils/formatCurrency";

type VariantOptionMap = Record<string, string>;

type ProductVariantCombo = {
  id?: string;
  _id?: string;
  name?: string;
  sku?: string;
  colorCode?: string | null;
  selling_price?: string | number;
  offer_price?: string | number;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  variants_stock?: number | string;
  variants_values?: string[] | null;
  options?: VariantOptionMap;
  combinationKey?: string;
};

type GroupValueItem = {
  value: string;
  stock: number;
  colorCode?: string | null;
};

const normalizeOptions = (
  options?: Record<string, unknown> | null
): VariantOptionMap => {
  if (!options || typeof options !== "object") return {};

  const entries = Object.entries(options)
    .map(([key, value]) => [String(key).trim(), String(value).trim()] as const)
    .filter(([key, value]) => key && value)
    .sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(entries);
};



const parseDisplayOptions = (
  options?: Record<string, unknown> | null
): VariantOptionMap => {
  const normalized = normalizeOptions(options);
  const parsed: VariantOptionMap = {};

  for (const [key, value] of Object.entries(normalized)) {
    const optionKey = key.trim();
    const optionValue = String(value).trim();

    // example: "red size=M", "sky size=L"
    const sizeMatch = optionValue.match(/\bsize\s*=\s*([^\s,|;/]+)/i);

    if (isColorGroup(optionKey) && sizeMatch) {
      const colorValue = optionValue
        .replace(/\bsize\s*=\s*([^\s,|;/]+)/i, "")
        .trim();

      parsed[optionKey] = colorValue || optionValue;
      parsed.size = sizeMatch[1].trim();
      continue;
    }

    parsed[optionKey] = optionValue;
  }

  return parsed;
};

const getVariantId = (variant: ProductVariantCombo | null | undefined) =>
  variant?._id || variant?.id || undefined;

const getVariantStock = (variant: ProductVariantCombo | null | undefined) =>
  Number(variant?.variants_stock ?? 0);

const getVariantRegularPrice = (
  variant: ProductVariantCombo | null | undefined,
  fallback: number
) => Number(variant?.selling_price ?? fallback);

const getVariantOfferPrice = (
  variant: ProductVariantCombo | null | undefined,
  fallback: number
) => Number(variant?.offer_price ?? fallback);

const isVariantOfferActive = (
  variant: ProductVariantCombo | null | undefined,
  fallbackSell: number
) => {
  if (!variant) return false;

  const sell = getVariantRegularPrice(variant, fallbackSell);
  const offer = getVariantOfferPrice(variant, sell);

  const now = Date.now();
  const start = variant.discount_start_date
    ? new Date(variant.discount_start_date).getTime()
    : 0;
  const end = variant.discount_end_date
    ? new Date(variant.discount_end_date).getTime()
    : 0;

  return offer < sell && (!start || now >= start) && (!end || now <= end);
};

const formatOptionsLabel = (options?: VariantOptionMap) => {
  const normalized = normalizeOptions(options);
  return Object.entries(normalized)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");
};

const DEFAULT_COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",

  red: "#ef4444",
  maroon: "#7f1d1d",
  crimson: "#dc2626",
  wine: "#7f1d1d",
  cherry: "#dc2626",

  blue: "#3b82f6",
  navy: "#1e3a8a",
  royal: "#2563eb",
  "royal blue": "#2563eb",

  sky: "#38bdf8",
  skyblue: "#38bdf8",
  "sky blue": "#38bdf8",
  cyan: "#06b6d4",
  aqua: "#22d3ee",
  turquoise: "#2dd4bf",

  green: "#22c55e",
  olive: "#65a30d",
  mint: "#86efac",
  lime: "#84cc16",

  yellow: "#eab308",
  mustard: "#ca8a04",
  gold: "#f59e0b",
  golden: "#f59e0b",

  orange: "#f97316",
  peach: "#fb923c",

  purple: "#a855f7",
  violet: "#8b5cf6",
  lavender: "#c084fc",

  pink: "#ec4899",
  rose: "#f43f5e",
  magenta: "#d946ef",

  gray: "#6b7280",
  grey: "#6b7280",
  ash: "#9ca3af",
  silver: "#d1d5db",

  brown: "#92400e",
  chocolate: "#78350f",
  coffee: "#78350f",

  beige: "#d6b98c",
  cream: "#fff7ed",
};



const getClosestColorKey = (colorName: string) => {
  const value = colorName
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (DEFAULT_COLOR_MAP[value]) return value;

  const colorAliases: Record<string, string> = {
    "light blue": "sky",
    "deep blue": "navy",
    "dark blue": "navy",
    "baby blue": "sky",
    "sea blue": "cyan",

    "light red": "red",
    "dark red": "maroon",
    "deep red": "maroon",

    "light green": "mint",
    "dark green": "green",

    "light pink": "pink",
    "dark pink": "rose",

    "light purple": "lavender",
    "dark purple": "purple",

    "light gray": "silver",
    "light grey": "silver",
    "dark gray": "gray",
    "dark grey": "gray",

    "off white": "cream",
    "off-white": "cream",
    "ivory": "cream",

    "khaki": "beige",
    "skin": "beige",
    "nude": "beige",
  };

  if (colorAliases[value]) return colorAliases[value];

  for (const key of Object.keys(DEFAULT_COLOR_MAP)) {
    if (value.includes(key) || key.includes(value)) {
      return key;
    }
  }

  return "gray";
};

const isColorGroup = (groupName: string) => {
  const normalized = groupName.trim().toLowerCase();
  return normalized === "color" || normalized === "colour";
};

const getColorSwatch = (value: string, colorCode?: string | null) => {
  const code = colorCode?.trim();

  if (code && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(code)) {
    return code;
  }

  const optionValue = value.trim();

  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(optionValue)) {
    return optionValue;
  }

  const closestColorKey = getClosestColorKey(optionValue);

  return DEFAULT_COLOR_MAP[closestColorKey] || "#d1d5db";
};


const SingleProductDetails = ({ product }: { product: Product }) => {
  const { addItem: addCartItem, openCart } = useCart();
  const router = useRouter();

  const accessToken = useSessionStore((s) => s.accessToken);
  const user = useSessionStore((s) => s.user);

  const [quantity, setQuantity] = useState(1);

  const images = useMemo(() => {
    const list =
      product.images?.map((img) => img.image?.secure_url).filter(Boolean) ?? [];
    return list.length ? list : ["/assets/placeholder.png"];
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(images[0]);

  useEffect(() => {
    setSelectedImage(images[0]);
  }, [images]);

const allVariants = useMemo<ProductVariantCombo[]>(() => {
  const raw = ((product as any).variantsId ?? []) as ProductVariantCombo[];

  return raw.filter((variant) => {
    const options = parseDisplayOptions(variant.options);
    const stock = getVariantStock(variant);

    return Object.keys(options).length > 0 && stock > 0;
  });
}, [product]);

  const hasRealVariants = !!product.hasVariants && allVariants.length > 0;

const groupNames = useMemo(() => {
  const set = new Set<string>();

  for (const variant of allVariants) {
    const options = parseDisplayOptions(variant.options);

    for (const key of Object.keys(options)) {
      set.add(key);
    }
  }

  return Array.from(set);
}, [allVariants]);

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    setSelectedValues({});
    setQuantity(1);
  }, [product.id]);

const optionGroups = useMemo(() => {
  return groupNames.map((groupName) => {
    const allValuesSet = new Set<string>();

    for (const variant of allVariants) {
      const options = parseDisplayOptions(variant.options);
      const value = options[groupName];

      if (value) {
        allValuesSet.add(value);
      }
    }

    const values: GroupValueItem[] = Array.from(allValuesSet)
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      )
      .map((value) => {
        let stock = 0;
        let colorCode: string | null = null;

        for (const variant of allVariants) {
          const options = parseDisplayOptions(variant.options);

          if (options[groupName] !== value) continue;

          const matchesOtherSelectedGroups = groupNames.every((group) => {
            if (group === groupName) return true;

            const selected = selectedValues[group];
            if (!selected) return true;

            return options[group] === selected;
          });

          if (!matchesOtherSelectedGroups) continue;

          stock += getVariantStock(variant);

          if (
            isColorGroup(groupName) &&
            !colorCode &&
            typeof variant.colorCode === "string" &&
            variant.colorCode.trim()
          ) {
            colorCode = variant.colorCode.trim();
          }
        }

        return { value, stock, colorCode };
      });

    return {
      name: groupName,
      values,
    };
  });
}, [allVariants, groupNames, selectedValues]);

const visibleOptionGroups = useMemo(() => {
  return optionGroups
    .map((group) => ({
      ...group,
      values: group.values.filter((option) => Number(option.stock ?? 0) > 0),
    }))
    .filter((group) => group.values.length > 0);
}, [optionGroups]);


const selectedVariant = useMemo<ProductVariantCombo | null>(() => {
  if (!hasRealVariants) return null;

  return (
    allVariants.find((variant) => {
      const options = parseDisplayOptions(variant.options);
      const optionKeys = Object.keys(options);

      const selectedValuesMatchThisVariant = Object.entries(selectedValues).every(
        ([group, value]) => {
          if (!value) return true;
          return options[group] === value;
        }
      );

      if (!selectedValuesMatchThisVariant) return false;

      const thisVariantFullySelected = optionKeys.every(
        (group) => !!selectedValues[group]
      );

      return thisVariantFullySelected;
    }) ?? null
  );
}, [allVariants, hasRealVariants, selectedValues]);


const missingRequiredOptions = useMemo(() => {
  if (!hasRealVariants || selectedVariant) return [];

  const compatibleVariants = allVariants.filter((variant) => {
    const options = parseDisplayOptions(variant.options);

    return Object.entries(selectedValues).every(([group, value]) => {
      if (!value) return true;
      return options[group] === value;
    });
  });

  const targetVariants = compatibleVariants.length
    ? compatibleVariants
    : allVariants;

  const missingSet = new Set<string>();

  for (const variant of targetVariants) {
    const options = parseDisplayOptions(variant.options);

    for (const group of Object.keys(options)) {
      if (!selectedValues[group]) {
        missingSet.add(group);
      }
    }
  }

  return Array.from(missingSet);
}, [allVariants, hasRealVariants, selectedValues, selectedVariant]);

  const selectionLabel = useMemo(() => {
    return groupNames
      .map((group) =>
        selectedValues[group] ? `${group}: ${selectedValues[group]}` : null
      )
      .filter(Boolean)
      .join(" | ");
  }, [groupNames, selectedValues]);

  const baseSellPrice = Number(product.selling_price ?? 0);
  const baseOfferPrice = product.flashdeal?.offerPrice
    ? Number(product.flashdeal.offerPrice)
    : baseSellPrice;

  const sellPrice = selectedVariant
    ? getVariantRegularPrice(selectedVariant, baseSellPrice)
    : baseSellPrice;

  const variantOfferActive = selectedVariant
    ? isVariantOfferActive(selectedVariant, baseSellPrice)
    : false;

  const displayPrice = selectedVariant
    ? variantOfferActive
      ? getVariantOfferPrice(selectedVariant, sellPrice)
      : sellPrice
    : product.flashdeal?.isFlashDeal
    ? baseOfferPrice
    : baseSellPrice;

  const isOffer = selectedVariant
    ? variantOfferActive &&
      getVariantOfferPrice(selectedVariant, sellPrice) < sellPrice
    : !!product.flashdeal?.isFlashDeal && baseOfferPrice < baseSellPrice;

  const productBaseStock = Number(
    (product as any).product_stock ?? product.total_stock ?? 0
  );

  const effectiveStock = hasRealVariants
    ? selectedVariant
      ? getVariantStock(selectedVariant)
      : 0
    : productBaseStock;

  const isOutOfStock = hasRealVariants
    ? !!selectedVariant && effectiveStock <= 0
    : !product.isPublish || effectiveStock <= 0;

  useEffect(() => {
    setQuantity((prev) => {
      if (hasRealVariants && !selectedVariant) return 1;
      if (effectiveStock <= 0) return 1;
      return Math.min(prev, effectiveStock);
    });
  }, [effectiveStock, hasRealVariants, selectedVariant]);

 const handleSelectOption = (groupName: string, value: string, stock: number) => {
  if (stock <= 0) {
    toast.error("This option is out of stock");
    return;
  }

  setSelectedValues((prev) => {
    const next = {
      ...prev,
      [groupName]: value,
    };

    for (const otherGroup of groupNames) {
      if (otherGroup === groupName) continue;
      if (!next[otherGroup]) continue;

      const hasMatchingVariant = allVariants.some((variant) => {
        const options = parseDisplayOptions(variant.options);

        if (getVariantStock(variant) <= 0) return false;

        return groupNames.every((group) => {
          const selected = next[group];
          if (!selected) return true;
          return options[group] === selected;
        });
      });

      if (!hasMatchingVariant) {
        next[otherGroup] = "";
      }
    }

    return next;
  });

  setQuantity(1);
};
  const features: string[] = [
    "100% Original Product",
    "Express Shipping",
    "Cash on Delivery Available",
    "Easy return and exchange within 3 days",
  ];

  const featureIconMap: Record<string, JSX.Element> = {
    "100% Original Product": (
      <FaCheckCircle className="text-black dark:text-white mr-2 shrink-0" />
    ),
    "Express Shipping": (
      <FaShippingFast className="text-black dark:text-white mr-2 shrink-0" />
    ),
    "Cash on Delivery Available": (
      <FaMoneyBillAlt className="text-black dark:text-white mr-2 shrink-0" />
    ),
    "Easy return and exchange within 3 days": (
      <FaUndoAlt className="text-black dark:text-white mr-2 shrink-0" />
    ),
  };

  const longDescriptionItems = product.long_description
    ? product.long_description
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const cartPayload = {
    productId: product.id,
    variantId: getVariantId(selectedVariant),
    name: product.name,
    price: displayPrice,
    image: selectedImage || "/assets/placeholder.png",
    quantity,
    maxStock: effectiveStock,
    variantLabel:
      selectionLabel ||
      formatOptionsLabel(parseDisplayOptions(selectedVariant?.options))||
      undefined,
    slug: product.slug,
  };

  const directCheckoutPayload = {
    item: {
      productId: product.id,
      variantId: getVariantId(selectedVariant),
      variantLabel:
        selectionLabel ||
    formatOptionsLabel(parseDisplayOptions(selectedVariant?.options)) ||
        undefined,
      name: product.name,
      price: displayPrice,
      image: selectedImage || "/assets/placeholder.png",
      quantity,
      slug: product.slug,
    },
  };

  const handleAddToCart = async () => {
  if (hasRealVariants && !selectedVariant) {
    if (missingRequiredOptions.length > 0) {
      toast.error(
        `Please select ${missingRequiredOptions
          .map((item) => item.toLowerCase())
          .join(", ")}`
      );
      return;
    }

    toast.error("Please select a valid variant");
    return;
  }

  if (isOutOfStock) {
    toast.error("Out of stock");
    return;
  }

  try {
    await addCartItem(cartPayload as any);
    openCart();
    toast.success("Product added to cart!");
  } catch (error: any) {
    toast.error(error?.message || "Could not add product to cart");
  }
};

  const handleOrderNow = async () => {
   if (hasRealVariants && !selectedVariant) {
  if (missingRequiredOptions.length > 0) {
    toast.error(
      `Please select ${missingRequiredOptions
        .map((item) => item.toLowerCase())
        .join(", ")}`
    );
    return;
  }

  toast.error("Please select a valid variant");
  return;
}

    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "direct_checkout",
          JSON.stringify(directCheckoutPayload)
        );
      }

      if (!accessToken || !user) {
        toast.info("Please login to continue your order");

        setTimeout(() => {
          router.push(
            `/login?redirect=${encodeURIComponent("/checkout?mode=direct")}`
          );
        }, 700);

        return;
      }

      router.push("/checkout?mode=direct");
    } catch (error: any) {
      toast.error(error?.message || "Could not continue with this order");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 lg:gap-16 bg-[#f5f5f5] dark:bg-gray-900">
      <div className="flex flex-col md:flex-row w-full md:w-1/2 gap-4 md:h-[600px]">
        <div className="relative w-full md:w-[500px] lg:w-[600px] aspect-[3/4] rounded-lg overflow-hidden border bg-white order-1">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex md:flex-col flex-row gap-2 md:overflow-y-auto overflow-x-auto  scrollbar-hide md:max-h-[600px] md:w-[120px] w-full order-2">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative min-w-[90px] w-[90px] h-[90px] rounded-md overflow-hidden border-2 ${
                selectedImage === img ? "border-black" : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/2 md:h-[600px] overflow-y-auto pr-2 scrollbar-hide">
        <h1 className="text-xl font-semibold text-black dark:text-gray-100 mb-4">
          {product.name}
        </h1>

        <div className="mb-3">
          <div className="flex items-center gap-2">
          <p className="text-black dark:text-gray-100 text-xl font-semibold">
         {formatCurrency(displayPrice)}
          </p>

          {isOffer && (
            <p className="line-through text-gray-500">
             {formatCurrency(sellPrice)}
            </p>
          )}
</div>
          {!!selectionLabel && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Selected: {selectionLabel}
            </p>
          )}
        </div>

        {hasRealVariants && (
          <div className="mb-5 space-y-5">
           {visibleOptionGroups.map((group) => (
              <div key={group.name}>
                <h3 className="mb-2 text-sm   text-black dark:text-white">
                  select {group.name}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {group.values.map((option) => {
                    const isSelected = selectedValues[group.name] === option.value;
                    const isStockOut = Number(option.stock ?? 0) <= 0;

                    return (
                    <button
  key={`${group.name}-${option.value}`}
  type="button"
  onClick={() =>
    handleSelectOption(group.name, option.value, option.stock)
  }
  disabled={isStockOut}
  title={option.value}
  aria-label={`${group.name}: ${option.value}`}
  className={
    isColorGroup(group.name)
      ? `h-5 w-5 rounded-full border transition ${
          isSelected
            ? "border-white ring-2 ring-gray-400 ring-offset-1"
                            : "border-transparent"
        } ${
          isStockOut
            ? "opacity-40 cursor-not-allowed"
            : "hover:ring-1 hover:ring-gray-400 hover:ring-offset-1"
        }`
      : ` border px-4 py-0 text-sm text-left transition ${
          isSelected
            ? "border-black bg-gray-400 text-black"
            : "border-gray-400  text-black dark:text-white"
        } ${
          isStockOut
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-black"
        }`
  }
  style={
    isColorGroup(group.name)
      ? { backgroundColor: getColorSwatch(option.value, option.colorCode) }
      : undefined
  }
>
  {!isColorGroup(group.name) && (
    <>
      <div className="font-medium">{option.value}</div>
      <div
        className={`text-[11px] mt-1 ${
          isSelected ? "text-white/80" : "text-gray-500"
        }`}
      />
    </>
  )}
</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        

        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={(hasRealVariants && !selectedVariant) || effectiveStock <= 0}
            className="border px-3 py-1 text-black dark:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>

          <span className="border-t border-b px-4 py-1 text-black dark:text-primary">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => Math.min(effectiveStock || 1, prev + 1))
            }
            disabled={(hasRealVariants && !selectedVariant) || effectiveStock <= 0}
            className="border px-3 py-1 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 border border-black   text-gray-900 dark:text-gray-100 dark:hover:text-gray-800 py-3 rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? "Out of Stock" : "Add to cart"}
          </button>

          <button
            type="button"
            onClick={handleOrderNow}
            disabled={isOutOfStock}
            className="w-full bg-black  hover:bg-gray-700 dark:hover:bg-gray-400 text-white dark:text-white py-3 rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? "Out of Stock" : "Buy Now"}
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center text-gray-700 dark:text-primary text-sm"
            >
              {featureIconMap[feature]}
              {feature}
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mb-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Product Description
          </h3>

          <div className="space-y-3 text-sm leading-7 text-black dark:text-gray-400 break-all">
  {longDescriptionItems.length ? (
    longDescriptionItems.map((item, index) => (
      <p key={index}>{item}</p>
    ))
  ) : (
    <p>No long description available.</p>
  )}
</div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductDetails;

















