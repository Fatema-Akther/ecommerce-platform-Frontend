




"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import React, { useEffect, useMemo, useRef, useState } from "react";

type PriceRangeFilterProps = {
  minPriceBound: number;
  maxPriceBound: number;
  selectedMinPrice: number | null;
  selectedMaxPrice: number | null;
  onPriceChange: (min: number, max: number) => void;
  onPriceCommit: (min: number, max: number) => void;
  onClearPrice: () => void;
};
const formatPrice = (value: number) => formatCurrency(value);

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
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

  const [uiMin, setUiMin] = useState<number>(selectedMinPrice ?? safeMin);
  const [uiMax, setUiMax] = useState<number>(selectedMaxPrice ?? safeMax);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUiMin(selectedMinPrice ?? safeMin);
  }, [selectedMinPrice, safeMin]);

  useEffect(() => {
    setUiMax(selectedMaxPrice ?? safeMax);
  }, [selectedMaxPrice, safeMax]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const currentMin = useMemo(() => Math.min(uiMin, uiMax), [uiMin, uiMax]);
  const currentMax = useMemo(() => Math.max(uiMin, uiMax), [uiMin, uiMax]);

  const range = Math.max(safeMax - safeMin, 1);
  const leftPercent = ((currentMin - safeMin) / range) * 100;
  const widthPercent = ((currentMax - currentMin) / range) * 100;

  const hasActivePriceFilter = currentMin > safeMin || currentMax < safeMax;
  const minChanged = currentMin > safeMin;
  const maxChanged = currentMax < safeMax;

  const emitChange = (min: number, max: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onPriceChange(min, max);
    }, 10);
  };

 const handleMinChange = (value: number) => {
  const nextMin = Math.min(value, currentMax);
  setUiMin(nextMin);
  onPriceChange(nextMin, currentMax);
};

const handleMaxChange = (value: number) => {
  const nextMax = Math.max(value, currentMin);
  setUiMax(nextMax);
  onPriceChange(currentMin, nextMax);
};

const commitMinChange = (value: number) => {
  const nextMin = Math.min(value, currentMax);
  const finalMin = Math.min(nextMin, currentMax);
  const finalMax = Math.max(nextMin, currentMax);
  onPriceCommit(finalMin, finalMax);
};

const commitMaxChange = (value: number) => {
  const nextMax = Math.max(value, currentMin);
  const finalMin = Math.min(currentMin, nextMax);
  const finalMax = Math.max(currentMin, nextMax);
  onPriceCommit(finalMin, finalMax);
};
  return (
    <div className="border-t border-[#ededed] px-5 py-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200"> Price Range</h3>

        {hasActivePriceFilter && (
          <button
            onClick={onClearPrice}
            className="text-xs font-medium text-[#666] dark:text-gray-400 hover:text-black"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative h-10">
        <div className="absolute left-0 right-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#e7d4c5]" />

        <div
         className="absolute top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#C8956C] transition-all duration-200 ease-out"
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
          }}
        />

      <input
  type="range"
  min={safeMin}
  max={safeMax}
  step={1}
  value={currentMin}
  onInput={(e) => handleMinChange(Number((e.target as HTMLInputElement).value))}
  onMouseUp={(e) => commitMinChange(Number((e.target as HTMLInputElement).value))}
  onTouchEnd={(e) => commitMinChange(Number((e.target as HTMLInputElement).value))}
  disabled={safeMin === safeMax}
  aria-label="Minimum price"
  className="pointer-events-none absolute left-0 top-1/2 z-20 h-0 w-full -translate-y-1/2 appearance-none bg-transparent
    [&::-webkit-slider-thumb]:pointer-events-auto
    [&::-webkit-slider-thumb]:h-5
    [&::-webkit-slider-thumb]:w-5
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:border
    [&::-webkit-slider-thumb]:border-[#a8d8f5]
    [&::-webkit-slider-thumb]:bg-[#8a622a]
    [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.18)]
    [&::-moz-range-thumb]:pointer-events-auto
    [&::-moz-range-thumb]:h-5
    [&::-moz-range-thumb]:w-5
    [&::-moz-range-thumb]:cursor-pointer
    [&::-moz-range-thumb]:appearance-none
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:border
    [&::-moz-range-thumb]:border-[#a8d8f5]
    [&::-moz-range-thumb]:bg-[#8a622a]
    [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
/>

      <input
  type="range"
  min={safeMin}
  max={safeMax}
  step={1}
  value={currentMax}
  onInput={(e) => handleMaxChange(Number((e.target as HTMLInputElement).value))}
  onMouseUp={(e) => commitMaxChange(Number((e.target as HTMLInputElement).value))}
  onTouchEnd={(e) => commitMaxChange(Number((e.target as HTMLInputElement).value))}
  disabled={safeMin === safeMax}
  aria-label="Maximum price"
  className="pointer-events-none absolute left-0 top-1/2 z-30 h-0 w-full -translate-y-1/2 appearance-none bg-transparent
    [&::-webkit-slider-thumb]:pointer-events-auto
    [&::-webkit-slider-thumb]:h-5
    [&::-webkit-slider-thumb]:w-5
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:border
    [&::-webkit-slider-thumb]:border-[#a8f5d6]
    [&::-webkit-slider-thumb]:bg-[#8a622a]
    [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.18)]
    [&::-moz-range-thumb]:pointer-events-auto
    [&::-moz-range-thumb]:h-5
    [&::-moz-range-thumb]:w-5
    [&::-moz-range-thumb]:cursor-pointer
    [&::-moz-range-thumb]:appearance-none
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:border
    [&::-moz-range-thumb]:border-[#f5a8c6]
    [&::-moz-range-thumb]:bg-[#8a622a]
    [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
/>

      </div>

      <div className="mt-3 flex items-center justify-between text-[15px] font-medium">
        <span
          className={`transition ${
            minChanged ? "font-semibold text-gray-900 dark:text-gray-200" : "text-gray-900 dark:text-gray-200"
          }`}
        >
          {formatPrice(currentMin)}
        </span>

        <span
          className={`transition ${
            maxChanged ? "font-semibold text-gray-900 dark:text-gray-200" : "text-gray-900 dark:text-gray-200"
          }`}
        >
          {formatPrice(currentMax)}
        </span>
      </div>

      {hasActivePriceFilter && (
        <div className="mt-2 text-[12px] font-medium text-gray-900 dark:text-gray-200">
          Selected range: {formatPrice(currentMin)} — {formatPrice(currentMax)}
        </div>
      )}
    </div>
  );
};

export default React.memo(PriceRangeFilter);