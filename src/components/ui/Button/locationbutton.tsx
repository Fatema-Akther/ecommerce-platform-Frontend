// components/LocationButton.tsx
import { FaMapMarkerAlt, FaAngleDown } from "react-icons/fa";
import Link from "next/link";
import React from "react";
import { MdStorefront } from "react-icons/md";

interface LocationButtonProps {
  location?: string;
  onClick?: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ location = "Our Location",  onClick }) => {
  return (
    <Link
      href="/ourstory"
      onClick={onClick} // now allowed
      className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
    <MdStorefront  className="w-3 h-3 sm:w-4 sm:h-4 text-gray-800 flex-shrink-0" />
      <span className="truncate text-[#2eb8b8] font-normal text-xs">{location}</span>
    
    </Link>
  );
};


export default LocationButton;
