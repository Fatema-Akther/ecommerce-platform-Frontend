// "use client";

// import { useState, useEffect, useMemo } from "react";
// import Image from "next/image";
// import { BiX } from "react-icons/bi";
// import { createPortal } from "react-dom";
// import type { Variant } from "@/types/product";

// interface Props {
//   isOpen: boolean;
//   variants: Variant[];
//   selectedId?: string;
//   onSelect: (variant: Variant) => void;
//   onClose: () => void;
//   isDesktop?: boolean;
// }

// function resolveImageSrc(image: any): string {
//   const raw =
//     image?.alterImage?.optimizeUrl ||
//     image?.alterImage?.secure_url ||
//     image?.optimizeUrl ||
//     image?.secure_url ||
//     "";

//   if (!raw) return "/placeholder.png";
//   if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
//   return `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${raw}`;
// }

// function getVariantSizeLabel(v: Variant): string {
//   if (Array.isArray(v.variants_values)) {
//     return v.variants_values.filter(Boolean).join(" / ") || v.name || "Variant";
//   }

//   if (typeof v.variants_values === "string" && v.variants_values.trim()) {
//     return v.variants_values;
//   }

//   return v.name || "Variant";
// }

// function getVariantPriceInfo(v: Variant) {
//   const sell = Number(v.selling_price ?? 0);
//   const offer = Number(v.offer_price ?? sell);

//   const now = Date.now();
//   const start = v.discount_start_date
//     ? new Date(v.discount_start_date).getTime()
//     : 0;
//   const end = v.discount_end_date
//     ? new Date(v.discount_end_date).getTime()
//     : 0;

//   const isWithinOffer = Boolean(
//     offer > 0 &&
//       offer < sell &&
//       now >= start &&
//       (end === 0 || now <= end)
//   );

//   const display = isWithinOffer ? offer : sell;
//   const discountPercent =
//     isWithinOffer && sell > 0
//       ? Math.round(((sell - offer) / sell) * 100)
//       : 0;

//   return {
//     sell,
//     offer,
//     display,
//     isWithinOffer,
//     discountPercent,
//   };
// }

// export default function VariantSelectModal({
//   isOpen,
//   variants,
//   selectedId,
//   onSelect,
//   onClose,
//   isDesktop = false,
// }: Props) {
//   const [currentId, setCurrentId] = useState<string | undefined>(selectedId);

//   useEffect(() => {
//     setCurrentId(selectedId);
//   }, [selectedId]);

//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   const handleClose = () => {
//     setCurrentId(undefined);
//     onClose();
//   };

//   const handlePick = (v: Variant) => {
//     setCurrentId(v._id);
//     onSelect(v);
//   };

//   const selectedVariant = useMemo(
//     () => variants.find((v) => v._id === currentId) || variants[0],
//     [variants, currentId]
//   );

//   if (!isOpen) return null;

//   const selectedPrice = selectedVariant
//     ? getVariantPriceInfo(selectedVariant)
//     : null;

//   const selectedImageSrc = selectedVariant
//     ? resolveImageSrc(selectedVariant.image)
//     : "/placeholder.png";

//   const selectedSize = selectedVariant
//     ? getVariantSizeLabel(selectedVariant)
//     : "Variant";

//   return createPortal(
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4">
//       <div
//         className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-lg transition-all duration-500 ease-out"
//         onClick={handleClose}
//         aria-hidden="true"
//       />

//       <div
//         className={`
//           relative z-50 w-full h-full md:h-auto
//           md:max-w-6xl md:max-h-[90vh]
//           md:rounded-3xl
//           bg-gradient-to-br from-white via-gray-50/95 to-white
//           dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800/95 dark:to-gray-900
//           shadow-2xl shadow-black/25 md:shadow-black/20
//           ring-1 ring-gray-200/60 dark:ring-gray-700/60
//           transform transition-all duration-700 ease-out
//           ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-full md:translate-y-0 md:scale-95 opacity-0"}
//           before:content-[''] before:absolute before:top-3 before:left-1/2 before:-translate-x-1/2
//           before:w-12 before:h-1.5 before:bg-gray-300 dark:before:bg-gray-600 before:rounded-full
//           before:md:hidden before:z-10
//           md:grid md:grid-cols-5 md:gap-0
//           flex flex-col
//         `}
//       >
//         <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-l-3xl relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

//           {selectedVariant && selectedPrice && (
//             <div className="relative w-full h-full min-h-[600px] p-8 flex flex-col justify-center items-center">
//               <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden ring-1 ring-white/20 shadow-2xl">
//                 <Image
//                   src={selectedImageSrc}
//                   alt={selectedSize}
//                   fill
//                   className="object-cover"
//                   sizes="400px"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
//               </div>

//               <div className="mt-8 text-center space-y-4">
//                 <div className="space-y-2">
//                   {selectedPrice.isWithinOffer ? (
//                     <div className="space-y-2">
//                       <div className="flex items-center justify-center gap-3">
//                         <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                           ৳{selectedPrice.offer.toFixed(2)}
//                         </span>
//                         <span className="text-lg line-through text-gray-400">
//                           ৳{selectedPrice.sell.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-bold">
//                         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//                         {selectedPrice.discountPercent}% ছাড়
//                       </div>
//                     </div>
//                   ) : (
//                     <span className="text-3xl font-bold text-gray-800 dark:text-white">
//                       ৳{selectedPrice.sell.toFixed(2)}
//                     </span>
//                   )}
//                 </div>

//                 <div className="flex items-center justify-center gap-2">
//                   {selectedVariant.variants_stock <= 0 ? (
//                     <>
//                       <div className="w-3 h-3 bg-red-500 rounded-full" />
//                       <span className="text-red-500 font-semibold">স্টক নেই</span>
//                     </>
//                   ) : (
//                     <>
//                       <div className="w-3 h-3 bg-green-500 rounded-full" />
//                       <span className="text-gray-600 dark:text-gray-400">
//                         স্টক: {selectedVariant.variants_stock} টি
//                       </span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="md:col-span-3 flex flex-col h-full">
//           <div
//             className="
//             sticky top-0 z-10
//             bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
//             border-b border-gray-200/50 dark:border-gray-700/50
//             px-4 md:px-8 pt-8 md:pt-6 pb-4 md:pb-6
//             md:rounded-tr-3xl
//           "
//           >
//             <div className="flex items-center justify-between">
//               <div className="space-y-1">
//                 <h2
//                   className="
//                   text-xl md:text-3xl font-bold
//                   bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent
//                   dark:from-white dark:via-gray-200 dark:to-white
//                 "
//                 >
//                   পছন্দ নির্বাচন করুন
//                 </h2>
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
//                   <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
//                     {variants.length} টি অপশন উপলব্ধ
//                   </p>
//                 </div>
//               </div>

//               <button
//                 className="
//                   group relative p-2 md:p-3
//                   bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80
//                   rounded-2xl transition-all duration-300 ease-out
//                   ring-1 ring-gray-200/50 dark:ring-gray-700/50
//                   hover:ring-gray-300/70 dark:hover:ring-gray-600/70
//                   hover:scale-105 active:scale-95
//                   shadow-lg hover:shadow-xl
//                 "
//                 onClick={handleClose}
//                 aria-label="Close modal"
//               >
//                 <BiX className="w-5 h-5 md:w-6 md:h-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
//                 <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
//               </button>
//             </div>
//           </div>

//           <div
//             className="
//             flex-1 px-4 md:px-8 py-4 md:py-6
//             max-h-[60vh] md:max-h-[60vh] overflow-y-auto
//             custom-scrollbar
//           "
//           >
//             <div
//               className="
//               grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2
//               gap-3 md:gap-4
//             "
//             >
//               {variants.map((v) => {
//                 const isDisabled = v.variants_stock <= 0;
//                 const size = getVariantSizeLabel(v);
//                 const isSelected = currentId === v._id;
//                 const imgSrc = resolveImageSrc(v.image);
//                 const price = getVariantPriceInfo(v);

//                 return (
//                   <div
//                     key={v._id}
//                     className={`
//         group relative overflow-hidden
//         bg-gradient-to-br from-white to-gray-50/50
//         dark:from-gray-800/50 dark:to-gray-900/50
//         rounded-2xl md:rounded-3xl
//         border border-gray-200/60 dark:border-gray-700/60
//         cursor-pointer transition-all duration-500 ease-out
//         hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
//         transform hover:-translate-y-1 hover:scale-[1.02]
//         ring-1 ring-transparent
//         ${
//           isDisabled
//             ? "opacity-50 cursor-not-allowed grayscale"
//             : isSelected
//             ? "ring-2 ring-primary/60 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary/10 to-primary/5"
//             : "hover:ring-1 hover:ring-primary/40"
//         }
//       `}
//                     onClick={() => {
//                       if (isDisabled) return;
//                       handlePick(v);
//                     }}
//                   >
//                     <div className="p-3 md:p-4">
//                       <div className="relative mb-3">
//                         <Image
//                           src={imgSrc}
//                           alt={size}
//                           width={150}
//                           height={150}
//                           className="object-cover transition-transform duration-500 group-hover:scale-110"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <div className="space-y-1">
//                           <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
//                             {size}
//                           </h3>

//                           {isDisabled ? (
//                             <div className="flex items-center gap-1">
//                               <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
//                               <span className="text-xs text-red-500 font-medium">
//                                 স্টক নেই
//                               </span>
//                             </div>
//                           ) : (
//                             <div className="flex items-center gap-1">
//                               <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
//                               <span className="text-xs text-gray-500 dark:text-gray-400">
//                                 স্টক: {v.variants_stock} টি
//                               </span>
//                             </div>
//                           )}
//                         </div>

//                         <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50">
//                           {price.isWithinOffer ? (
//                             <div className="flex flex-wrap items-center gap-2">
//                               <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
//                                 ৳{price.offer.toFixed(2)}
//                               </span>
//                               <span className="text-xs text-gray-400 line-through">
//                                 ৳{price.sell.toFixed(2)}
//                               </span>
//                             </div>
//                           ) : (
//                             <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
//                               ৳{price.sell.toFixed(2)}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div
//             className="
//             sticky bottom-0 z-10
//             bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
//             border-t border-gray-200/50 dark:border-gray-700/50
//             px-4 md:px-8 py-4 md:py-6
//             md:rounded-br-3xl
//           "
//           >
//             <button
//               className="
//                 group relative w-full py-3 md:py-4 px-6 md:px-8
//                 bg-gradient-to-r from-secondary via-primary to-secondary bg-[length:200%_100%]
//                 hover:bg-[position:right_center]
//                 text-white font-semibold text-base md:text-lg
//                 rounded-2xl md:rounded-3xl
//                 transition-all duration-700 ease-out
//                 transform hover:scale-[1.02] active:scale-[0.98]
//                 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40
//                 ring-1 ring-primary/20 hover:ring-primary/30
//                 overflow-hidden
//               "
//               onClick={handleClose}
//             >
//               <span className="relative z-10 flex items-center justify-center gap-2">
//                 <span>সম্পন্ন</span>
//                 <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
//               </span>
//               <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// }