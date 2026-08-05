



"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiShoppingCart } from "react-icons/fi";

import { Product, Variant } from "@/types/product";
import { toast } from "sonner";
import { useCart } from "@/features/cart/context/CartContext";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProductCardProps {
  product: Product;
  isAboveFold?: boolean;
}

const getVariantLabel = (v: Variant | null): string => {
  if (!v) return "";
  const values = v.variants_values ?? [];
  return values.length ? `${v.name}: ${values.join(" / ")}` : v.name;
};



const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAboveFold = false,
}) => {
  const { addItem: addCartItem, openCart } = useCart();
  const router = useRouter();

const {
  productLink,
  variant,
  priceData,
  hasRealVariants,
  isOutOfStock,
  img,
} = useMemo(() => {
  const link = product.slug ? `/products/${product.slug}` : "/products";

 

  const hasRealVariants = !!product.hasVariants;

  const variant =
    product.variantsId?.find((v) => v.variants_stock > 0) ??
    product.variantsId?.[0] ??
    null;

  
  // const regularPrice = Number(product.selling_price ?? product.price ?? 0); 

  
  // const offerPrice = product.flashdeal?.isFlashDeal && product.flashdeal.offerPrice
  //   ? Number(product.flashdeal.offerPrice)  
  //   : (variant ? Number(variant.offer_price) : regularPrice); 


  const regularPrice =
  Number(
    product.selling_price ??
    product.price ??
    0
  );

const offerPrice =
  Number(
    product.offerPrice ??
    product.flashdeal?.offerPrice ??
    regularPrice
  );

  const displayPrice = offerPrice < regularPrice ? offerPrice : regularPrice;  // Show the lower of the offer or regular price

  // Check if it's an active offer (flash deal)
  const isOffer = offerPrice < regularPrice;

  const pct =
    offerPrice && regularPrice > 0
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

 



// const outOfStock =
//   variant
//     ? variant.variants_stock <= 0
//     : (product.stock ?? product.total_stock ?? 0) <= 0;

const outOfStock = hasRealVariants
  ? !(product.variantsId ?? []).some(
      (v) => Number(v.variants_stock ?? 0) > 0
    )
  : Number(product.stock ?? product.total_stock ?? 0) <= 0;


const img =
  product.image ||
  product.images?.[0]?.image?.optimizeUrl ||
  product.images?.[0]?.image?.secure_url ||
  "";

  return {
    productLink: link,
    variant,
    priceData: {
      sell: regularPrice, 
      offer: offerPrice, 
      display: displayPrice, 
      pct, 
      isOffer,  // Correctly set the offer flag
    },
    hasRealVariants,
    isOutOfStock: outOfStock,
    img,
  };
}, [product]);


  
const FALLBACK_IMG = "/assets/placeholder.png";

const resolvedSrc =
  img && img.trim().length > 0
    ? img.startsWith("http") || img.startsWith("/")
      ? img
      : `/${img}`
    : FALLBACK_IMG;

  const getVariantValues = (v: Variant | null): string[] => {
    return v?.variants_values ?? [];
  };

const addToCart = async (v?: Variant | null) => {
  try {
    const activeVariant = hasRealVariants ? v ?? null : null;

    const finalPrice = activeVariant
      ? Number(activeVariant.offer_price) < Number(activeVariant.selling_price)
        ? Number(activeVariant.offer_price)
        : Number(activeVariant.selling_price)
      // : Number(product.selling_price ?? product.price ?? 0);
      : Number(
    product.offerPrice ??
    product.price ??
    0
  );

const imageForCart = img.trim()
  ? img
  : product.images?.[0]?.image?.secure_url || FALLBACK_IMG;

    await addCartItem({
      productId: product.id,
      variantId: activeVariant?._id || activeVariant?.id,
      name: product.name,
      price: finalPrice,
      image: imageForCart,
      quantity: 1,
      // maxStock: activeVariant?.variants_stock || product.total_stock || 0,


      maxStock:
  activeVariant?.variants_stock ||
  product.stock ||
  product.total_stock ||
  0,


      variantValues: activeVariant ? getVariantValues(activeVariant) : [],
      variantLabel: activeVariant ? getVariantLabel(activeVariant) : undefined,
    });

    openCart();
    toast.success("Product added to cart!");
  } catch (error: any) {
    toast.error(error?.message || "Could not add product to cart");
  }
};








const handleAddToCart = async (
  e: React.MouseEvent<HTMLButtonElement>
) => {
  e.preventDefault();
  e.stopPropagation();

  if (isOutOfStock) {
    toast.error("Out of stock");
    return;
  }

  if (hasRealVariants) {
    router.push(productLink);
    return;
  }

  await addToCart(null);
};


console.log(product.name);
console.log(product);
  return (
    <div className="product-card bg-white dark:bg-[#262320] rounded-lg   group border border-gray-300 hover:border-gray-600 dark:border-gray-700 hover:dark:border-gray-300 transition-all duration-300 hover:-translate-y-1">
  {/* <div className="relative flex flex-col bg-white dark:bg-gray-800 overflow-hidden w-full h-full group border border-gray-300 hover:border-gray-600 dark:border-gray-800" style={{borderRadius: '4px'}}>
     */}

     <div
  className="relative flex flex-col bg-white dark:bg-[#262320] overflow-hidden w-full h-full rounded-lg "
>
    {/* Image Area */}
    <Link href={productLink}>
      <div className="relative w-full bg-primary  dark:bg-gray-800 overflow-hidden" style={{aspectRatio: '3/4'}}>
      <div className="relative w-full aspect-[3/4] overflow-hidden  bg-gray-100">
  <Image
  src={resolvedSrc}
  alt={product.name || "Product image"}
  fill
  priority={isAboveFold}
  loading={isAboveFold ? undefined : "lazy"}
  fetchPriority={isAboveFold ? "high" : "auto"}
  quality={isAboveFold ? 75 : 65}
  sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1280px) 20vw, 240px"
  className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
    isOutOfStock ? "grayscale-[0.3]" : ""
  }`}
/>
</div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <span className="text-[10px] tracking-widest text-gray-700 bg-white px-3 py-1 border border-gray-300">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* New In Badge */}
        {!isOutOfStock && priceData.isOffer === false && (
        <div className="absolute top-2 left-2 bg-[#6F7F5E] text-white text-[10px] font-bold px-2 pr-5 py-1.5 tracking-widest"
  style={{ clipPath: 'polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)' }}>
  NEW IN
</div>
        )}

        {/* Sale Badge */}
        {priceData.isOffer && (
          <div className="absolute top-2 left-2 bg-[#9A4A2E] text-white text-[10px] font-bold px-2 pr-5 py-1.5 tracking-widest"
  style={{ clipPath: 'polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)' }}>
            SALE
          </div>
        )}
      </div>
    </Link>

   

    {/* Quick Add — নিচে ডানে (out of stock হলে লুকানো) */}
    {!isOutOfStock && (
      <button
        type="button"
        onClick={handleAddToCart}
        className="absolute bottom-[68px] right-2 bg-white dark:bg-black rounded-full w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-gray-700 z-10 dark:hover:bg-gray-700 hover:bg-gray-50 transition"
      >
        <FiShoppingCart className="w-4 h-4 text-gray-900 dark:text-gray-200" />
      </button>
    )}

    {/* Text Info — নিচে */}
    <div className="px-2.5 py-2">
      <Link href={productLink}>
        <p className="text-[16px]  text-base font-semibold text-gray-800 dark:text-[#F2EDE6] uppercase tracking-widest mb-0.5 truncate">
          {product.name.length > 28 ? product.name.slice(0, 28) + '…' : product.name}
        </p>
  <div className="flex items-center gap-2">
  <span className="text-[15px] font-semibold text-[#9A4A2E] dark:text-[#E8966B]">
    {formatCurrency(priceData.display)}
  </span>

  {priceData.isOffer && (
    <>
      <span className="text-[13px] line-through text-gray-500">
      {formatCurrency(priceData.sell)}
      </span>

      <span className=" bg-[#F5E3DA] dark:bg-[#3D2A20] rounded-sm px-2 text-[13px] font-semibold text-[#9A4A2E] dark:text-[#E8966B]">
        -{priceData.pct}% 
      </span>
    </>
  )}
</div>
      </Link>
    </div>

  </div>
</div>
  );
};

export default ProductCard;



