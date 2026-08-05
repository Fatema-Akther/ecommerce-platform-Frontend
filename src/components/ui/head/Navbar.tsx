


"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AiOutlineSearch } from "react-icons/ai";
import { AnimatePresence, motion } from "framer-motion";


import { useSidebar } from "@/hooks/useSidebar";
import {  ProductsResponse } from "@/types/product";



import { SidebarToggler } from "./sidebartoggoler";
import Logo from "../logo";
import { navbarRef } from "@/lib/refs";
import MobileSidebar from "./sidebar";
import { useSessionStore } from "@/stores/session";
import { PublicAPI } from "@/lib/api/publicApi";
import { useQuery } from "@tanstack/react-query";
import { CartSheet } from "@/components/cart/CartSheet";
import { DEFAULT_IMAGE, generateSlug, getBestDidYouMean, getPopularScore, getProductCategorySlug, getProductId, getProductImage, normalizeText, scoreProduct, SearchableProduct } from "@/lib/search/productSearch";

import { RiAccountCircleLine } from "react-icons/ri";



interface NavbarProps {
   className?: string;
  businessData?: any;
}

interface SearchResultItem {
  id: string;
  name: string;
  url: string;
  image?: string;
  score: number;
}



export const Navbar = ({ className,businessData, }: NavbarProps) => {
  useSidebar();

 const { data: productsData } = useQuery<ProductsResponse, Error>({
  queryKey: ["navbar-products"],
  queryFn: () =>
    PublicAPI.getProducts({
      page: 1,
      limit: 100,
    }),
});

const products = productsData?.items ?? [];

  const router = useRouter();
  const accessToken = useSessionStore((s) => s.accessToken);

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const typedProducts = (products || []) as SearchableProduct[];

  // Accessing accessToken and user from the Zustand store correctly
  
  const user = useSessionStore((state) => state.user); // Correctly access the user

  const handleAuthClick = () => {
    if (accessToken && user) {
      // If logged in, direct to the correct account page based on role
      if (user.role === "admin") {
        router.push("/admin/account"); // Redirect to admin account page
      } else {
        router.push("/my-account"); // Redirect to customer account page
      }
    } else {
      // If not logged in, redirect to login page
      router.push("/login");
    }
  };

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);




  const suggestions = useMemo<SearchResultItem[]>(() => {
    const query = normalizeText(searchTerm);
    if (!query) return [];

    return typedProducts
      .map((product) => {
        const score = scoreProduct(product, query);
        return {
          product,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return normalizeText(a.product.name || "").localeCompare(
          normalizeText(b.product.name || "")
        );
      })
      .slice(0, 10)
      .map(({ product, score }) => {
        const productId = getProductId(product);

        const categorySlug = getProductCategorySlug(product);

return {
  id: productId,
  name: product.name || "Unnamed Product",
//  url: categorySlug
//   ? `/products?categorySlug=${categorySlug}&highlight=${productId}`
//   : `/products?search=${encodeURIComponent(product.name || "")}`,

// url: `/products?search=${encodeURIComponent(product.name || "")}`,
url: `/products/${generateSlug(product.name || "")}?id=${productId}`,


  image: getProductImage(product),
  score,
};
      });
  }, [searchTerm, typedProducts]);



  const fallbackPopular = useMemo(() => {
    return [...typedProducts]
      .sort((a, b) => getPopularScore(b) - getPopularScore(a))
      .slice(0, 5)
      .map((product) => ({
        id: getProductId(product),
        name: product.name || "Unnamed Product",
        url: `/product/${generateSlug(product.name || "product")}?id=${getProductId(product)}`,
        image: getProductImage(product),
      }));
  }, [typedProducts]);

  const didYouMean = useMemo(() => {
    if (!searchTerm.trim() || suggestions.length > 0) return "";
    return getBestDidYouMean(searchTerm, typedProducts);
  }, [searchTerm, suggestions.length, typedProducts]);

  return (
    <div
      ref={navbarRef}
      className={`w-full z-50 transition-all duration-300 md:px-2 ${
        isScrolled
          ? "bg-primary dark:bg-[#1C1A17]"
          : "bg-primary dark:bg-[#1C1A17]"
      } ${className || ""}`}
    >

   
      

      {/* Mobile Top Bar */}
<div className="md:hidden flex justify-between items-center px-1 sm:px-2 py-2 gap-2">
  {/* Left: Logo */}
  
    <div className="flex items-center flex-1">
    {/* <Link href="/"> */}
      <Link href="/" className="shrink-0">
      <Logo
        logo={businessData?.logo}
        className="w-[120px] h-[60px]"
      />
    </Link>


  {/* Center: Search */}
  <div className="flex-1 relative" ref={searchRef}>
    <input
      type="text"
      value={searchTerm}
      onFocus={() => setShowSuggestions(true)}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setShowSuggestions(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
      placeholder="Search product..."
      className="w-full border-2 border-primary rounded-sm pl-3 pr-16 py-2 text-xs bg-white dark:bg-gray-500 dark:text-white dark:border-gray-700 transition-all dark:placeholder-gray-200"
    />

    <button
      type="button"
      onClick={handleSearch}
      className="absolute top-1/2 right-7 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      <AiOutlineSearch className="w-5 h-5" />
    </button>

    {searchTerm && (
      <button
        type="button"
        onClick={() => {
          setSearchTerm("");
          setShowSuggestions(false);
        }}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
      >
        ✕
      </button>
    )}

    <AnimatePresence>
      {showSuggestions && searchTerm.trim() && (
        <motion.div
          key="mobile-suggestions"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "tween", duration: 0.2 }}
          className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-auto text-black dark:text-white"
        >
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
                    onClick={() => {
                      setSearchTerm("");
                      setShowSuggestions(false);
                    }}
                  >
                    <Image
                      src={item.image || DEFAULT_IMAGE}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="object-cover rounded"
                      unoptimized
                    />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto text-gray-500">Product</span>
                  </Link>
                </li>
              ))}

              <li className="border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium"
                >
                  Show all results for "{searchTerm}"
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-4">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                No exact result found
              </p>

              {didYouMean ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm(didYouMean);
                    setShowSuggestions(true);
                  }}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Did you mean: {didYouMean} ?
                </button>
              ) : null}

              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Popular products
                </p>

                <ul className="mt-2">
                  {fallbackPopular.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
                        onClick={() => {
                          setSearchTerm("");
                          setShowSuggestions(false);
                        }}
                      >
                        <Image
                          src={item.image || DEFAULT_IMAGE}
                          alt={item.name}
                          width={28}
                          height={28}
                          className="object-cover rounded"
                          unoptimized
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
    </div>

  {/* Right: Sidebar toggler + Account + Cart */}
  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 shrink-0">
    {/* <div className="block md:hidden">
      <SidebarToggler />
      <MobileSidebar />
    </div> */}

    <button
      type="button"
      onClick={handleAuthClick}
      className="inline-flex items-center justify-center rounded-md h-10 w-10 text-gray-700 dark:text-gray-200 transition hover:text-gray-500"
    >
      <RiAccountCircleLine className="w-6 h-6" />
    </button>

    <CartSheet />
  </div>
</div>

      {/* Desktop Header */}
      <div className="hidden md:grid items-center h-16 md:h-18 relative grid-cols-[auto_1fr_auto]">
        {/* Left */}
     <div className="flex items-center pl-32 md:pl-0">
         <Link href="/">
  <Logo
    logo={businessData?.logo}
    className="w-[220px] h-[70px]"
  />
</Link>
        </div>

        {/* Center Search */}
        <div className="justify-self-center w-full max-w-[730px] px-2">
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search product..."
              className="w-full border-2 border-primary rounded-sm pl-4 pr-20 py-2 text-xs bg-white dark:bg-gray-500 dark:text-white dark:border-gray-700 transition-all dark:placeholder-gray-200"
            />

            <button
              type="button"
              onClick={handleSearch}
              className="absolute top-1/2 right-10 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <AiOutlineSearch className="w-6 h-6" />
            </button>

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setShowSuggestions(false);
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}

            <AnimatePresence>
              {showSuggestions && searchTerm.trim() && (
                <motion.div
                  key="desktop-suggestions"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-auto text-black dark:text-white"
                >
                  {suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.url}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
                            onClick={() => {
                              setSearchTerm("");
                              setShowSuggestions(false);
                            }}
                          >
                            <Image
                              src={item.image || DEFAULT_IMAGE}
                              alt={item.name}
                              width={32}
                              height={32}
                              className="object-cover rounded"
                              unoptimized
                            />
                            <span className="truncate">{item.name}</span>
                            <span className="ml-auto text-gray-500">Product</span>
                          </Link>
                        </li>
                      ))}

                      <li className="border-t dark:border-gray-700">
                        <button
                          type="button"
                          onClick={handleSearch}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium"
                        >
                          Show all results for "{searchTerm}"
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        No exact result found
                      </p>

                      {didYouMean ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm(didYouMean);
                            setShowSuggestions(true);
                          }}
                          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Did you mean: {didYouMean} ?
                        </button>
                      ) : null}

                      <div className="mt-4">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Popular products
                        </p>

                        <ul className="mt-2">
                          {fallbackPopular.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={item.url}
                                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
                                onClick={() => {
                                  setSearchTerm("");
                                  setShowSuggestions(false);
                                }}
                              >
                                <Image
                                  src={item.image || DEFAULT_IMAGE}
                                  alt={item.name}
                                  width={28}
                                  height={28}
                                  className="object-cover rounded"
                                  unoptimized
                                />
                                <span className="truncate">{item.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right */}
       <div className="justify-self-end mr-16 flex items-center space-x-4 text-gray-600 dark:text-gray-300">

  <button
    onClick={handleAuthClick}
    title={accessToken ? "My Account" : "Sign In"}
    className="inline-flex items-center justify-center rounded-md  h-10 w-10  text-gray-700 dark:text-gray-200 transition hover:text-gray-500"
  >
    <RiAccountCircleLine className="w-6 h-6 " />
  </button>

  <div className="inline-flex items-center justify-center">
    <CartSheet />
  </div>

</div>
      </div>
    </div>
  );
};

export default Navbar;
