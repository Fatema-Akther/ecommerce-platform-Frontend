


// "use client";

// import React from "react";
// import { Category } from "@/types/category";
// import PriceRangeFilter from "./PriceRangeSlider";


// type CategoryNode = Category & {
//   children?: CategoryNode[];
// };

// type ProductFiltersProps = {
//   categoryTree: CategoryNode[];
//   selectedCategoryId: string;
//   setSelectedCategoryId: React.Dispatch<React.SetStateAction<string>>;
//   setSelectedCategorySlug: React.Dispatch<React.SetStateAction<string>>;
//   expandedParents: Record<string, boolean>;
//   toggleParent: (id: string) => void;
//   handleCategorySelect: (category: CategoryNode) => void;
//   isMobile?: boolean;
//   onCloseMobile?: () => void;

//   minPriceBound: number;
//   maxPriceBound: number;
//   selectedMinPrice: number | null;
//   selectedMaxPrice: number | null;
//   onPriceChange: (min: number, max: number) => void;
//    onPriceCommit: (min: number, max: number) => void;
//   onClearPrice: () => void;
 
// };

// const getCategoryId = (category: any) =>
//   category?.id || category?._id || "";

// const getCategoryName = (category: any) => category?.name || "";

// const ProductFilters: React.FC<ProductFiltersProps> = ({
//   categoryTree,
//   selectedCategoryId,
//   setSelectedCategoryId,
//   setSelectedCategorySlug,
//   expandedParents,
//   toggleParent,
//   handleCategorySelect,
//   isMobile = false,
//   onCloseMobile,

//   minPriceBound,
//   maxPriceBound,
//   selectedMinPrice,
//   selectedMaxPrice,
//   onPriceChange,
//    onPriceCommit,
//   onClearPrice,
 
// }) => {
//   const safeMin = Number.isFinite(minPriceBound) ? Math.floor(minPriceBound) : 0;
//   const safeMax = Number.isFinite(maxPriceBound) ? Math.ceil(maxPriceBound) : 0;

//   const currentMin = selectedMinPrice ?? safeMin;
//   const currentMax = selectedMaxPrice ?? safeMax;

//   const hasActivePriceFilter = currentMin > safeMin || currentMax < safeMax;




//   const clearFilters = () => {
//     setSelectedCategoryId("");
//     setSelectedCategorySlug("");
//     onClearPrice();
//     if (isMobile && onCloseMobile) onCloseMobile();
//   };

//   return (
//     <div className="border-t border-b border-[#e9e9e9] dark:border-gray-600 bg-white dark:bg-gray-800">
//       {isMobile && (
//         <div className="flex items-center justify-between border-b border-[#ededed] px-5 py-4 lg:hidden">
//           <h2 className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#111111]">
//             Filter
//           </h2>
//           <button
//             onClick={onCloseMobile}
//             className="text-sm font-medium text-[#666] hover:text-black"
//           >
//             Close
//           </button>
//         </div>
//       )}

//       <div>
//         <button
//           onClick={clearFilters}
//           className={`flex w-full items-center justify-between border-b border-b-[#ededed] dark:border-b-gray-600  px-5 py-4 text-left text-[14px] font-medium transition ${
//             !selectedCategoryId && !hasActivePriceFilter
//               ? "bg-[#dcd9d9] dark:bg-gray-600 text-black dark:text-gray-200 "
//               : "bg-white dark:bg-gray-700 text-[#222] dark:text-gray-200  hover:bg-[#fafafa] dark:hover:bg-gray-700 "
//           }`}
//         >
//           <span>All</span>
//           <span className="text-[16px] leading-none text-[#777]">›</span>
//         </button>

//         {categoryTree.map((parent) => {
//           const parentId = getCategoryId(parent);
//           const isExpanded = expandedParents[parentId] ?? false;
//           const isParentSelected = selectedCategoryId === parentId;
//           const children = parent.children ?? [];

//           return (
//             <div key={parentId} className="border-b border-[#ededed]">
//               <div className="flex items-center justify-between">
//                 <button
//                   onClick={() => handleCategorySelect(parent)}
//                   className={`flex-1 px-5 py-2 text-left text-[14px] font-medium transition ${
//                     isParentSelected
//                       ? "bg-[#dcd9d9] dark:bg-gray-600 text-black "
//                       : "bg-white dark:bg-gray-800  text-[#222] dark:text-gray-200 hover:bg-[#fafafa] dark:hover:bg-gray-700"
//                   }`}
//                 >
//                   {getCategoryName(parent)}
//                 </button>

//                 {children.length > 0 ? (
//                   <button
//                     onClick={() => toggleParent(parentId)}
//                     className="px-5 py-4 text-[16px] leading-none text-[#777] transition hover:text-black"
//                     aria-label={
//                       isExpanded ? "Collapse category" : "Expand category"
//                     }
//                   >
//                     {isExpanded ? "⌄" : "›"}
//                   </button>
//                 ) : (
//                   <span className="px-5 py-4 text-[16px] leading-none text-[#777]">
//                     +
//                   </span>
//                 )}
//               </div>

//               {isExpanded && children.length > 0 && (
//                 <div className="bg-[#fafafa]">
//                   {children.map((child) => {
//                     const childId = getCategoryId(child);
//                     const isChildSelected = selectedCategoryId === childId;

//                     return (
//                       <button
//                         key={childId}
//                         onClick={() => handleCategorySelect(child)}
//                         className={`block w-full border-t border-[#ededed] px-8 py-3 text-left text-[13px] font-medium transition ${
//                           isChildSelected
//                             ? "bg-[#dcd9d9] dark:bg-gray-600 text-black"
//                             : "text-[#555] hover:bg-white hover:text-black"
//                         }`}
//                       >
//                         {getCategoryName(child)}
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       <PriceRangeFilter
//   minPriceBound={minPriceBound}
//   maxPriceBound={maxPriceBound}
//   selectedMinPrice={selectedMinPrice}
//   selectedMaxPrice={selectedMaxPrice}
//   onPriceChange={onPriceChange}
//   onPriceCommit={onPriceCommit}
//   onClearPrice={onClearPrice}
// />
//     </div>
//   );
// };

// export default React.memo(ProductFilters);







"use client";

import React from "react";
import { Category } from "@/types/category";
import PriceRangeFilter from "./PriceRangeSlider";


type CategoryNode = Category & {
  children?: CategoryNode[];
};

type ProductFiltersProps = {
  categoryTree: CategoryNode[];
  selectedCategoryId: string;
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCategorySlug: React.Dispatch<React.SetStateAction<string>>;
  expandedParents: Record<string, boolean>;
  toggleParent: (id: string) => void;
  handleCategorySelect: (category: CategoryNode) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;

  minPriceBound: number;
  maxPriceBound: number;
  selectedMinPrice: number | null;
  selectedMaxPrice: number | null;
  onPriceChange: (min: number, max: number) => void;
   onPriceCommit: (min: number, max: number) => void;
  onClearPrice: () => void;
 
};

const getCategoryId = (category: any) =>
  category?.id || category?._id || "";

const getCategoryName = (category: any) => category?.name || "";

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categoryTree,
  selectedCategoryId,
  setSelectedCategoryId,
  setSelectedCategorySlug,
  expandedParents,
  toggleParent,
  handleCategorySelect,
  isMobile = false,
  onCloseMobile,

  minPriceBound,
  maxPriceBound,
  selectedMinPrice,
  selectedMaxPrice,
  onPriceChange,
   onPriceCommit,
  onClearPrice,
 
}) => {
  const safeMin = Number.isFinite(minPriceBound) ? Math.floor(minPriceBound) : 0;
  const safeMax = Number.isFinite(maxPriceBound) ? Math.ceil(maxPriceBound) : 0;

  const currentMin = selectedMinPrice ?? safeMin;
  const currentMax = selectedMaxPrice ?? safeMax;

  const hasActivePriceFilter = currentMin > safeMin || currentMax < safeMax;


const [showAllCategories, setShowAllCategories] = React.useState(false);

const visibleCategoryTree = showAllCategories
  ? categoryTree
  : categoryTree.slice(0, 5);

const remainingCategoryCount = Math.max(categoryTree.length - 5, 0);
  
  const clearFilters = () => {
    setSelectedCategoryId("");
    setSelectedCategorySlug("");
    onClearPrice();
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  return (
    <div className="border-t border-b border-[#e9e9e9] dark:border-gray-600 bg-white dark:bg-gray-800">
      {isMobile && (
        <div className="flex items-center justify-between border-b border-[#ededed] px-5 py-4 lg:hidden">
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#111111]">
            Filter
          </h2>
          <button
            onClick={onCloseMobile}
            className="text-sm font-medium text-[#666] hover:text-black"
          >
            Close
          </button>
        </div>
      )}

      <div>
        <button
          onClick={clearFilters}
          className={`flex w-full items-center justify-between border-b border-b-[#ededed] dark:border-b-gray-600  px-5 py-4 text-left text-[14px] font-medium transition ${
            !selectedCategoryId && !hasActivePriceFilter
              ? "bg-[#dcd9d9] dark:bg-gray-600 text-black dark:text-gray-200 "
              : "bg-white dark:bg-gray-700 text-[#222] dark:text-gray-200  hover:bg-[#fafafa] dark:hover:bg-gray-700 "
          }`}
        >
          <span>All</span>
          <span className="text-[16px] leading-none text-[#777]">›</span>
        </button>

      {visibleCategoryTree.map((parent) => {
          const parentId = getCategoryId(parent);
          const isExpanded = expandedParents[parentId] ?? false;
          const isParentSelected = selectedCategoryId === parentId;
          const children = parent.children ?? [];

          return (
            <div key={parentId} className="border-b border-[#ededed]">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleCategorySelect(parent)}
                  className={`flex-1 px-5 py-2 text-left text-[14px] font-medium transition ${
                    isParentSelected
                      ? "bg-[#dcd9d9] dark:bg-gray-600 text-black "
                      : "bg-white dark:bg-gray-800  text-[#222] dark:text-gray-200 hover:bg-[#fafafa] dark:hover:bg-gray-700"
                  }`}
                >
                  {getCategoryName(parent)}
                </button>

                {children.length > 0 ? (
                  <button
                    onClick={() => toggleParent(parentId)}
                    className="px-5 py-4 text-[16px] leading-none text-[#777] transition hover:text-black"
                    aria-label={
                      isExpanded ? "Collapse category" : "Expand category"
                    }
                  >
                    {isExpanded ? "⌄" : "›"}
                  </button>
                ) : (
                  <span className="px-5 py-4 text-[16px] leading-none text-[#777]">
                    +
                  </span>
                )}
              </div>

              {isExpanded && children.length > 0 && (
                <div className="bg-[#fafafa]">
                  {children.map((child) => {
                    const childId = getCategoryId(child);
                    const isChildSelected = selectedCategoryId === childId;

                    return (
                      <button
                        key={childId}
                        onClick={() => handleCategorySelect(child)}
                        className={`block w-full border-t border-[#ededed] px-8 py-3 text-left text-[13px] font-medium transition ${
                          isChildSelected
                            ? "bg-[#dcd9d9] dark:bg-gray-600 text-black"
                            : "text-[#555] hover:bg-white hover:text-black"
                        }`}
                      >
                        {getCategoryName(child)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}


        {categoryTree.length > 5 && (
  <button
    type="button"
    onClick={() => setShowAllCategories((prev) => !prev)}
    className="flex w-full items-center justify-between border-b border-[#ededed] bg-[#fafafa] px-5 py-3 text-left text-[13px] font-semibold text-[#666] transition hover:bg-[#f0f0f0] hover:text-black dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
  >
    <span>
      {showAllCategories
        ? "Show less"
        : `See more (${remainingCategoryCount})`}
    </span>

    <span className="text-base leading-none">
      {showAllCategories ? "⌃" : "⌄"}
    </span>
  </button>
)}
      </div>

      <PriceRangeFilter
  minPriceBound={minPriceBound}
  maxPriceBound={maxPriceBound}
  selectedMinPrice={selectedMinPrice}
  selectedMaxPrice={selectedMaxPrice}
  onPriceChange={onPriceChange}
  onPriceCommit={onPriceCommit}
  onClearPrice={onClearPrice}
/>
    </div>
  );
};

export default React.memo(ProductFilters);