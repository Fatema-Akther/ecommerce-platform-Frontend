


"use client";

import Link from "next/link";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useSessionStore } from "@/stores/session";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BaseAPI } from "@/lib/api/baseApi";

function getDisplayName(user: any) {
  if (!user) return "Admin";

  return (
    user.fullName ||
    user.name ||
    user.username ||
    user.email?.split("@")[0] ||
    "Admin"
  );
}

function getFirstName(name: string) {
  return name?.trim()?.split(" ")[0] || "Admin";
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function AdminNavbar() {
  const user = useSessionStore((state) => state.user);

  const displayName = getDisplayName(user);
  const firstName = getFirstName(displayName);
  const initials = getInitials(displayName);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // close dropdown (outside click + mobile)
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 dark:bg-black backdrop-blur">
  <div className="relative flex min-h-[72px] items-center justify-between px-3 sm:px-4 md:min-h-[84px] md:px-6">
    
    {/* LEFT */}
    <div className="z-10 flex min-w-0 items-center gap-3 md:gap-6">
      <Link href="/admin" className="flex items-center gap-3">
        <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-2xl bg-[#C8956C] text-base md:text-lg font-bold text-white shadow-sm">
          A
        </div>

        {/* Desktop only */}
        <div className="hidden md:block">
          <p className="text-lg font-bold text-gray-950 dark:text-gray-200">
            Admin Panel
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Management Dashboard
          </p>
        </div>
      </Link>
    </div>

    {/* CENTER HELLO */}
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[46vw] -translate-x-1/2 -translate-y-1/2 text-center sm:w-auto">
      <h2 className="truncate whitespace-nowrap text-lg font-semibold text-gray-950 dark:text-gray-200 sm:text-xl xl:text-2xl">
        Hello, {firstName} 👋
      </h2>
    </div>

    {/* RIGHT */}
    <div className="z-10 flex items-center gap-2 sm:gap-3">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-2xl border px-2.5 py-2 sm:gap-3 sm:px-3 hover:bg-gray-50 dark:hover:bg-gray-500"
        >
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#C8956C] font-semibold">
            {initials}
          </div>

          {/* Hide text on mobile, show from sm+ */}
          <div className="hidden text-left sm:block">
            <p className="max-w-[140px] truncate text-sm font-semibold text-gray-900 dark:text-gray-200">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>





          <FiChevronDown className="shrink-0 text-sm sm:text-base" />

        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border bg-white shadow-lg">
            <button
              onClick={async () => {
                setOpen(false);
                try {
                  await BaseAPI.logout();
                } finally {
                  useSessionStore.getState().logout();
                }
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
            >
              <FiLogOut />
              Logout
            </button>

             <button
          onClick={() => {
            setOpen(false);
            router.push("/admin/account");
          }}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-600 dark:hover:bg-gray-700"
        >
          <FiUser />
          Account
        </button>

           
          </div>
        )}
      </div>
    </div>
  </div>
</header>
  );
}