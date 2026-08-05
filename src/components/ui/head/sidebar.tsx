"use client";

import { menuItems } from "@/config/routes.config";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, motion as fm } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaFacebookF,
  FaHeadphones,
  FaInstagram,
  FaMapMarkerAlt,
  FaPinterestP,
  FaTwitter,
  FaUser,
  FaYoutube,
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { FiGrid } from "react-icons/fi";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import { RiArrowDownSLine } from "react-icons/ri";

import { useSidebar } from "@/hooks/useSidebar";
import { useBusiness } from "@/hooks/useBusiness";
import { useProducts } from "@/hooks/useproduct";
import { sidebarRef } from "@/lib/ref";
import Logo from "../logo";
import {
  DEFAULT_IMAGE,
  flattenCategories,
  generateSlug,
  getBestDidYouMean,
  getCategoryImage,
  getPopularScore,
  getProductCategorySlug,
  getProductId,
  getProductImage,
  normalizeText,
  scoreCategory,
  scoreProduct,
  SearchableCategory,
  SearchableProduct,
} from "@/lib/search/productSearch";
import { ProductsResponse } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { PublicAPI } from "@/lib/api/publicApi";
import { useSessionStore } from "@/stores/session";

/* ---------- styling helpers ---------- */
const itemBase =
  "flex items-center justify-between w-full rounded-md py-3 px-4 text-left text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-300";
const itemText = "truncate text-[15px] font-medium text-black dark:text-white";
const chevronCls = "shrink-0 w-4 h-4 text-gray-700";
const sectionCard =
  "rounded-xl border border-gray-200 bg-white dark:bg-gray-700 shadow-sm";

type SearchResultItem = {
  type: "product" | "category";
  id: string;
  name: string;
  url: string;
  image?: string;
  score: number;
};

type SearchBarProps = {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  suggestions: SearchResultItem[];
  fallbackPopular: SearchResultItem[];
  didYouMean: string;
  router: ReturnType<typeof useRouter>;
  isDesktop: boolean;
  close: () => void;
  searchRef:
    | React.MutableRefObject<HTMLDivElement | null>
    | React.RefObject<HTMLDivElement>;
};

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  suggestions,
  fallbackPopular,
  didYouMean,
  router,
  isDesktop,
  close,
  searchRef,
}: SearchBarProps) => {
  const onPick = (url: string) => {
    router.push(url);
    setSearchTerm("");
    if (!isDesktop) close();
  };

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    if (!isDesktop) close();
  };

  return (
    <div className={twMerge(sectionCard, "p-3 mb-3")} ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search product..."
          className="w-full h-11 rounded-lg bg-gray-100/80 dark:bg-gray-500 pl-10 pr-16 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:bg-white"
        />

        <AiOutlineSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

        <button
          type="button"
          onClick={handleSearch}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Search"
        >
          <AiOutlineSearch className="w-5 h-5" />
        </button>

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            aria-label="Clear"
          >
            ✕
          </button>
        )}

        <AnimatePresence>
          {searchTerm.trim() && (
            <fm.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "tween", duration: 0.18 }}
              className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] max-h-80 overflow-auto"
            >
              {suggestions.length > 0 ? (
                <ul className="py-1 text-sm">
                  {suggestions.map((item) => (
                    <li key={`${item.type}-${item.id}`}>
                      <button
                        onClick={() => onPick(item.url)}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
                      >
                        {item.type === "product" ? (
                          <Image
                            src={item.image || DEFAULT_IMAGE}
                            alt={item.name}
                            width={24}
                            height={24}
                            className="object-cover rounded"
                            unoptimized
                          />
                        ) : (
                          <FiGrid className="w-4 h-4 text-blue-500" />
                        )}

                        <span className="truncate">{item.name}</span>

                        <span className="ml-auto text-xs text-gray-500">
                          {item.type === "product" ? "Product" : "Category"}
                        </span>
                      </button>
                    </li>
                  ))}

                  <li className="border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="w-full text-left px-3 py-3 hover:bg-gray-100 text-xs font-medium"
                    >
                      Show all results for "{searchTerm}"
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-700">
                    No exact result found
                  </p>

                  {didYouMean ? (
                    <button
                      type="button"
                      onClick={() => setSearchTerm(didYouMean)}
                      className="mt-2 text-xs text-blue-600 hover:underline"
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
                        <li key={`${item.type}-${item.id}`}>
                          <button
                            onClick={() => onPick(item.url)}
                            className="w-full text-left flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 text-xs"
                          >
                            <Image
                              src={item.image || DEFAULT_IMAGE}
                              alt={item.name}
                              width={24}
                              height={24}
                              className="object-cover rounded"
                              unoptimized
                            />
                            <span className="truncate">{item.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </fm.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ---------- Contact info card ---------- */
type InfoCardProps = {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSignupClick: () => void;
};

const InfoCard = ({
  isLoggedIn,
  onLoginClick,
  onSignupClick,
}: InfoCardProps) => (
  <div className={twMerge(sectionCard, "p-4 space-y-3")}>
    <div className="flex items-start gap-3">
      <FaUser className="mt-0.5 text-emerald-600 w-4 h-4" />

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onLoginClick}
          className="text-left text-sm font-medium text-gray-700 transition hover:text-emerald-700 dark:text-white"
        >
          {isLoggedIn ? "My Account" : "Log In"}
        </button>

        <button
          type="button"
          onClick={onSignupClick}
          className="text-left text-sm text-gray-700 transition hover:text-emerald-700 dark:text-white"
        >
          Sign Up
        </button>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <FaHeadphones className="mt-0.5 text-emerald-600 w-4 h-4" />
      <span className="text-sm text-gray-700 dark:text-white">
        (+01) - 2345 - 6789
      </span>
    </div>
  </div>
);

/* ---------- Social row ---------- */
const SocialRow = () => (
  <div className="flex items-center gap-3 mt-3">
    {[FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube].map(
      (Icon, i) => (
        <a
          key={i}
          href="#"
          className="inline-flex w-10 h-10 rounded-full bg-black text-white items-center justify-center hover:bg-[#dacbbe]"
        >
          <Icon className="w-4 h-4" />
        </a>
      )
    )}
  </div>
);

const FooterNote = () => (
  <p className="text-[12px] text-gray-500 mt-6 dark:text-white">
    Copyright 2024 © Nest. All rights reserved. Powered by AliThemes.
  </p>
);

export default function Sidebar() {
  const { isOpen, isDesktop, closeSidebar } = useSidebar();
  const { businessData } = useBusiness();
  const pathname = usePathname();
  const router = useRouter();


 const accessToken = useSessionStore((state) => state.accessToken);
const user = useSessionStore((state) => state.user);
const hydrated = useSessionStore((state) => state.hydrated);

const isLoggedIn = hydrated && (!!accessToken || !!user);



 const { data: productsData } = useQuery<ProductsResponse, Error>({
  queryKey: ["navbar-products"],
  queryFn: () => PublicAPI.getProducts({ page: 1, limit: 100 }),
});

const products = productsData?.items ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => businessData?.categories ?? [], [businessData]);

  const typedProducts = useMemo(
    () => ((products || []) as SearchableProduct[]),
    [products]
  );

  const flatCategories = useMemo(
    () => flattenCategories(categories as SearchableCategory[]),
    [categories]
  );

  const suggestions = useMemo<SearchResultItem[]>(() => {
    const query = normalizeText(searchTerm);
    if (!query) return [];

    const categoryMatches = flatCategories
      .map((cat) => {
        const score = scoreCategory(cat, query);
        return { cat, score };
      })
      .filter((item) => item.score > 0)
      .map(({ cat, score }) => ({
        type: "category" as const,
        id: String(cat.id || cat._id || cat.name || ""),
        name: cat.name || "Unnamed Category",
        url: cat.slug
          ? `/products/category/${cat.slug}`
          : `/category/${cat.id || cat._id}`,
        image: getCategoryImage(cat),
        score,
      }));

    const productMatches = typedProducts
  .map((product) => {
    const score = scoreProduct(product, query);
    return { product, score };
  })
  .filter((item) => item.score > 0)
  .map(({ product, score }) => {
    const productId = getProductId(product);
    const categorySlug = getProductCategorySlug(product);

    return {
      type: "product" as const,
      id: productId,
      name: product.name || "Unnamed Product",
   url: categorySlug
  ? `/products?categorySlug=${categorySlug}&highlight=${productId}`
  : `/products?search=${encodeURIComponent(product.name || "")}`,
      image: getProductImage(product),
      score,
    };
  });

    return [...productMatches, ...categoryMatches]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return normalizeText(a.name).localeCompare(normalizeText(b.name));
      })
      .slice(0, 10);
  }, [searchTerm, typedProducts, flatCategories]);

  const fallbackPopular = useMemo<SearchResultItem[]>(() => {
    return [...typedProducts]
      .sort((a, b) => getPopularScore(b) - getPopularScore(a))
      .slice(0, 5)
      .map((product) => ({
        type: "product" as const,
        id: getProductId(product),
        name: product.name || "Unnamed Product",
        url: `/product/${generateSlug(product.name || "product")}?id=${getProductId(
          product
        )}`,
        image: getProductImage(product),
        score: getPopularScore(product),
      }));
  }, [typedProducts]);

  const didYouMean = useMemo(() => {
    if (!searchTerm.trim() || suggestions.length > 0) return "";
    return getBestDidYouMean(searchTerm, typedProducts);
  }, [searchTerm, suggestions.length, typedProducts]);

  /* accordion states */
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [openCatIds, setOpenCatIds] = useState<Set<string>>(new Set());

  /* helpers */
  const toggleMenu = (title: string) =>
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    );

  const toggleCat = (id: string) =>
    setOpenCatIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });


  const handleLoginClick = () => {
  if (!isLoggedIn) {
    router.push("/login");
    if (!isDesktop) closeSidebar();
    return;
  }

  const role = String(user?.role || "").toLowerCase();

  if (role === "admin") {
    router.push("/admin/account");
  } else {
    router.push("/my-account");
  }

  if (!isDesktop) closeSidebar();
};

const handleSignupClick = () => {
  router.push("/register");
  if (!isDesktop) closeSidebar();
};

  useEffect(() => {
    if (!categories.length || openCatIds.size) return;

    const gather = (cats: any[]): string[] =>
      cats.flatMap((c) => [
        String(c.id),
        ...(c.children ? gather(c.children) : []),
      ]);

    setOpenCatIds(new Set(gather(categories)));
  }, [categories, openCatIds.size]);

  const CategoryItem = ({ cat, level = 0 }: { cat: any; level?: number }) => {
    const catId = String(cat.id);
    const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
    const isCatOpen = openCatIds.has(catId);
    const isActive = pathname === `/category/${catId}`;

    const go = () => {
      router.push(`/products/category/${cat.slug}`);
      if (!isDesktop) closeSidebar();
    };

    const indent = Math.min(level, 3);
    const leftPad = ["pl-2", "pl-6", "pl-10", "pl-14"][indent];

    return (
      <li className="flex flex-col">
        <div
          className={twMerge(
            "flex items-center justify-between w-full rounded-md py-2.5 pr-3",
            leftPad,
            "text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-300",
            isActive && "bg-emerald-50"
          )}
        >
          <button
            type="button"
            onClick={go}
            className="flex-1 text-left truncate text-[14px]"
          >
            {cat.name}
          </button>

          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCat(catId)}
              className="ml-2 shrink-0 p-1"
              aria-label={isCatOpen ? "Collapse category" : "Expand category"}
            >
              {isCatOpen ? (
                <MdOutlineKeyboardArrowUp className="w-4 h-4 text-gray-600 dark:text-white" />
              ) : (
                <RiArrowDownSLine className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isCatOpen && (
          <ul className="flex flex-col">
            {cat.children.map((child: any, childIndex: number) => (
              <CategoryItem
                key={child.id ?? `${child.name}-${level}-${childIndex}`}
                cat={child}
                level={level + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  };

  const sidebarClasses = twMerge(
    "fixed top-0 left-0 h-full w-[70vw] sm:w-92 md:w-80 max-w-[340px] z-[50] flex flex-col",
    "bg-white dark:bg-black text-black dark:text-white shadow-2xl"
  );

  const SidebarOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black z-40"
      onClick={closeSidebar}
    />
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white dark:bg-gray-800">
        <Link href="/" onClick={!isDesktop ? closeSidebar : undefined}>
          <Logo />
        </Link>

        {!isDesktop && (
          <button
            onClick={closeSidebar}
            className="inline-flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <span className="text-2xl leading-none text-gray-700 dark:text-gray-100">
              &times;
            </span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          suggestions={suggestions}
          fallbackPopular={fallbackPopular}
          didYouMean={didYouMean}
          router={router}
          isDesktop={isDesktop}
          close={closeSidebar}
          searchRef={searchRef}
        />

        <nav className={twMerge(sectionCard, "divide-y divide-gray-200")}>
          <div className="">
            {menuItems.map((item, index) => {
              const hasSub = !!item.submenu;
              const isActive = item.path === pathname;
              const isGroupActive =
                hasSub && item.submenu!.some((sub) => sub.path === pathname);
              const isMenuOpen = openMenus.includes(item.title) || isGroupActive;

              if (hasSub) {
                return (
                  <div key={`${item.path ?? item.title}-${index}`}>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={twMerge(itemBase, isGroupActive && "bg-emerald-50")}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon && (
                          <item.icon
                            className={twMerge(
                              "w-5 h-5 text-emerald-600",
                              (isGroupActive || isActive) && "text-emerald-700"
                            )}
                          />
                        )}
                        <span className={itemText}>{item.title}</span>
                      </span>

                      {isMenuOpen ? (
                        <FaChevronDown className={chevronCls} />
                      ) : (
                        <FaChevronRight className={chevronCls} />
                      )}
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isMenuOpen ? "auto" : 0,
                        opacity: isMenuOpen ? 1 : 0,
                      }}
                      className="overflow-hidden"
                    >
                      <ul className="pl-12 pr-3 pb-2 space-y-2">
                        {item.submenu!.map((sub, subIndex) => (
                          <li key={`${sub.path}-${subIndex}`}>
                            <Link
                              href={sub.path}
                              onClick={!isDesktop ? closeSidebar : undefined}
                              className="flex items-center gap-2 text-[14px] text-gray-700 hover:text-emerald-700"
                            >
                              {sub.icon && (
                                <sub.icon className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="truncate">{sub.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                );
              }

              return (
                <Link
                  key={`${item.path ?? item.title}-${index}`}
                  href={item.path!}
                  onClick={!isDesktop ? closeSidebar : undefined}
                  className={twMerge(
                    itemBase,
                    isActive && "bg-[#dacbbe] dark:bg-gray-500"
                  )}
                >
                  <span className="flex items-center gap-3">
                    {item.icon && (
                      <item.icon className="w-5 h-5 text-emerald-600 dark:text-white" />
                    )}
                    <span className={itemText}>{item.title}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {categories.length > 0 && (
            <div className="py-1">
              <details open className="group">
                <summary className="list-none cursor-pointer">
                  <button className={itemBase}>
                    <span className={itemText}>All Categories</span>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      ({categories.length})
                    </span>
                  </button>
                </summary>

                <ul className="mt-1 mb-2 pl-2">
                  {categories.map((c: any, index: number) => (
                    <CategoryItem
                      key={c.id ?? `${c.name}-${index}`}
                      cat={c}
                    />
                  ))}
                </ul>
              </details>
            </div>
          )}
        </nav>

        <div className="mt-3">
          {/* <InfoCard
  isLoggedIn={isLoggedIn}
  onLoginClick={handleLoginClick}
  onSignupClick={handleSignupClick}
/> */}
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
              Follow Us
            </h4>
            <SocialRow />
          </div>
          <FooterNote />
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <aside ref={sidebarRef} className={sidebarClasses}>
        <SidebarContent />
      </aside>
    );
  }

  return (
    <>
      {isOpen && <SidebarOverlay />}

      <motion.aside
        ref={sidebarRef}
        className={sidebarClasses}
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.45 }}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}