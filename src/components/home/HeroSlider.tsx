






"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { FiRefreshCw, FiShield, FiTruck } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/hooks/useBusiness";





export default function HeroSlider() {
  const router = useRouter();

  const { businessData } = useBusiness();

  // ✅ HERE
  const banners = businessData.heroBanners ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (index: number) => {
  setCurrentIndex(index);
};

 const currentBanner =
  banners.length > 0 ? banners[currentIndex] : "/banner/14.jpg";

  // ✅ stable navigation handlers
  const goProducts = useCallback(() => {
    router.push("/products");
  }, [router]);

  const goFlashDeals = useCallback(() => {
    router.push("/products/flash-deals");
  }, [router]);

  // ✅ optimized interval (no dependency issue)
useEffect(() => {
  if (banners.length <= 1) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, 4000);

  return () => clearInterval(interval);
}, [banners.length]);

  return (
    <>
      {/* Mobile Version */}
      <section className="block bg-[#faf8f5] pb-8 md:hidden dark:bg-[#0b0b0c]">
        <div className="relative h-[420px] overflow-hidden rounded-[2px] bg-[#111] dark:bg-[#0f1012]">

      <Image
  src={currentBanner}
  alt="Fashion collection banner"
  fill
  sizes="(max-width: 767px) 100vw, 1px"
  loading="lazy"
  fetchPriority="low"
  quality={72}
  className="object-cover object-top"
/>


{banners.length > 1 && (
  <div className="mt-4 flex items-center justify-center gap-2">
    {banners.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentIndex(index)}
        className={`h-2 w-2 rounded-full transition-all duration-300 ${
          index === currentIndex
            ? "w-6 bg-[#C44929]"
            : "bg-gray-400/60"
        }`}
      />
    ))}
  </div>
)}


          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-black/30">
           <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full rounded-full bg-[#C44929] opacity-75 animate-ping" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C44929]" />
  </span>
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white">
               New Collection 2026
            </span>
          </div>

         

         
        </div>
      </section>

      {/* Desktop Version */}
 <section
  className="hidden md:block relative w-full h-[720px] bg-cover bg-no-repeat"
  style={{
    backgroundImage: `url('${banners[currentIndex]}')`,
    backgroundPosition: 'center 15%',
  }}
>


<div className="relative flex min-h-[590px] items-end justify-center px-12">

    {/* 🔥 TOP LEFT BADGE */}
 
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-black/30">
           <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full rounded-full bg-[#C44929] opacity-75 animate-ping" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C44929]" />
  </span>
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white">
               New Collection 2026
            </span>
          </div>

    {/* 🔥 CENTER CONTENT */}
<div className="relative z-10 flex flex-col items-center text-center max-w-[480px] -mb-24">

  <div className="mb-9 flex flex-wrap items-center justify-center gap-[14px]">
    <button
      type="button"
      onClick={goProducts}
      className="rounded-full bg-[#181614] px-9 py-[15px] text-[14px] font-bold uppercase tracking-[2px] text-white shadow-lg"
    >
      Shop Now
    </button>

    <button
      type="button"
      onClick={goFlashDeals}
      className="rounded-full border-[1.5px] border-white/60 bg-white/15 backdrop-blur-md px-7 py-[14px] text-[14px] font-semibold text-white"
    >
      View Offer →
    </button>
  </div>



{banners.length > 1 && (
  <div className="mt-6 flex items-center justify-center gap-2">
    {banners.map((_, index) => (
      <button
        key={index}
        onClick={() => goToSlide(index)}
        className={`h-2 w-2 rounded-full transition-all duration-300 ${
          index === currentIndex
            ? "w-6 bg-white"
            : "bg-white/40 hover:bg-white/70"
        }`}
      />
    ))}
  </div>
)}
</div>

  </div>
</section>
    </>
  );
}

