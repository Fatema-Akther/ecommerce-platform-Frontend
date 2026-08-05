"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaAngleDown,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/config/routes.config";
import { FiGrid } from "react-icons/fi";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types/category";

const indentCls = ["pl-4", "pl-8", "pl-12", "pl-16", "pl-20"];

const NavCategoriesMenu = () => {
  const { data: CATEGORIES = [] } = useCategories();
  const [showCategories, setShowCategories] = useState(false);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showCategories &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowCategories(false);
        setOpenIds(new Set());
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCategories]);

  const closeDropdown = () => {
    setShowCategories(false);
    setOpenIds(new Set());
  };

  const CategoryItem = ({
    cat,
    level = 0,
  }: {
    cat: Category;
    level?: number;
  }) => {
    const catId = String(cat.id);
    const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
    const isOpen = openIds.has(catId);

    const toggleOpen = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      setOpenIds((prev) => {
        const next = new Set(prev);
        if (next.has(catId)) {
          next.delete(catId);
        } else {
          next.add(catId);
        }
        return next;
      });
    };

   
  };

  return (
  
      <div className="  border-t  border-gray-200 pb-3 bg-primary dark:bg-[#1C1A17]">
   

        {/* CENTER */}
 
<div className="mx-auto flex w-full justify-center overflow-hidden px-3 py-2">
  {(() => {
    const visibleMenuItems = menuItems.filter(
      (item) => item.title.toLowerCase() !== "home"
    );

    const allItem = visibleMenuItems.find(
      (item) => item.title.toLowerCase() === "all"
    );

    return (
      <div className="flex max-w-[1120px]  items-center justify-center gap-5 overflow-hidden">
        {/* LEFT FIXED: All */}
        <div className="shrink-0">
          <Link
            href={allItem?.path ?? "/products"}
            className={`inline-flex items-center whitespace-nowrap font-medium transition-colors ${
              pathname === (allItem?.path ?? "/products")
                ? "text-[#cd4d11]"
                : "text-black dark:text-gray-200 hover:text-[#cd4d11]"
            }`}
          >
            {allItem?.title ?? "All"}
          </Link>
        </div>

        {/* CENTER SCROLLABLE: Categories only, with fade mask on right edge */}
        <div className="relative min-w-0 max-w-[calc(100vw-50px)] lg:max-w-[880px] xl:max-w-[980px]">
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex w-max items-center gap-5 whitespace-nowrap pr-6">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <li key={`cat-${cat.id}`} className="shrink-0">
                  <Link
                    href={`/products/category/${cat.slug}`}
                    className={`inline-block whitespace-nowrap font-medium transition-colors text-black dark:text-gray-200 hover:text-[#cd4d11] ${
                      pathname === `/products/category/${cat.slug}`
                        ? "border-b-2 border-[#cd4d11] text-[#cd4d11]"
                        : ""
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* fade gradient to visually separate cut-off text from Offer */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8  dark:from-gray-900" />
        </div>

        {/* RIGHT FIXED: Offer */}
        <div className="shrink-0">
         
             <Link

            href="/products/flash-deals"

            className={`inline-flex items-center whitespace-nowrap font-bold transition-colors ${

              pathname === "/products/flash-deals"

                ? "text-[#cd4d11]"

                : "text-[#cd4d11] hover:text-[#a83c0b]"

            }`}

          >

            Offer

          </Link>
        </div>
      </div>
    );
  })()}
</div>
       
      </div>
    
  );
};

export default NavCategoriesMenu;