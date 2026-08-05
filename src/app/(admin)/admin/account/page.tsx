"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session";
import { BaseAPI } from "@/lib/api/baseApi";
import AdminGuard from "@/components/guards/AdminGuard";
import { DashboardAPI } from "@/lib/api/admin_dashboardApi";

const AdminAccountPage = () => {
  const router = useRouter();
  const { user } = useSessionStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await DashboardAPI.getSummary();
        setTotalUsers(summary.totalCustomers ?? 0);
        setTotalOrders(summary.totalOrders ?? 0);
        setTotalProducts(summary.totalProducts ?? 0);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      }
    };
    fetchSummary();
  }, []);

  const handleLogout = async () => {
    await BaseAPI.logout();
    useSessionStore.getState().logout();
    router.replace("/");
  };

  if (!user) return null;

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#f5f5f0] dark:bg-gray-800 font-['Syne',sans-serif]">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 flex h-full w-[240px] shrink-0 flex-col border-r border-[#e8e8e3] bg-white dark:bg-gray-700 py-6 transition-transform duration-300 md:relative md:translate-x-0 md:h-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="mb-4 border-b border-[#e8e8e3] px-5 pb-5">
            <div className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e0e0d8] bg-[#fafaf8] px-3.5 py-1.5">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#888]"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="text-[13px] font-medium text-[#555]">admin</span>
            </div>
          </div>

          <p className="mb-1.5 px-5 text-[10px] uppercase tracking-[0.1em] text-[#aaa] dark:text-gray-300">
            Menu
          </p>

       {[
  {
    label: "Dashboard",
    active: true,
    action: () => router.push("/admin"),
  },
  
  {
    label: "Settings",
    active: false,
    action: () => router.push("/admin/settings/business"),
  },
  
  {
    label: "Logout",
    active: false,
    action: handleLogout,
    isLogout: true,
  },
].map(({ label, active, action, isLogout }) => (
  <button
    key={label}
    onClick={() => {
      action();
      setSidebarOpen(false);
    }}
    className={`flex w-full items-center gap-3 border-l-[3px] px-5 py-2.5 text-left text-sm transition-colors ${
      active
        ? "border-[#3B6D11] bg-[#f2f5ee] font-semibold text-[#111] "
        : "border-transparent bg-transparent font-normal hover:bg-[#f7f7f2] dark:hover:bg-gray-400"
   } ${
  label === "Settings" || isLogout ? "text-[#555] dark:text-gray-200" : "text-[#555]"
}`}
  >
    {isLogout && (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
    )}
    {label}
  </button>
))}

       
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 py-6 md:px-9 md:py-10">

          {/* Top bar */}
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Hamburger — mobile only */}
              <button
                className="flex items-center justify-center rounded-[8px] border border-[#e0e0d8] bg-white p-2 md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#111] dark:text-white md:text-[26px]">
                Welcome, Admin
              </h1>
            </div>

            <div className="flex items-center gap-2.5 rounded-full border border-[#e8e8e3] bg-white py-1 pr-3.5 pl-1">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#d8ecc8] text-xs font-semibold text-[#3B6D11]">
                AD
              </div>
              <span className="hidden text-sm font-medium text-[#111] sm:inline">
                Admin
              </span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              {
                label: "Total users",
                value: totalUsers.toLocaleString(),
                sub: "Real users",
              },
              {
                label: "Total orders",
                value: totalOrders.toLocaleString(),
                sub: "All orders",
              },
              {
                label: "Total products",
                value: totalProducts.toLocaleString(),
                sub: "All products",
                fullWidth: true,
              },
            ].map(({ label, value, sub, fullWidth }) => (
              <div
                key={label}
                className={`rounded-[14px] border border-[#e8e8e3] bg-white dark:bg-gray-500 p-5 ${
                  fullWidth ? "col-span-2 md:col-span-1" : ""
                }`}
              >
                <p className="mb-2 text-xs text-[#999] dark:text-gray-200">{label}</p>
                <p className="mb-1 text-[22px] font-bold tracking-[-0.04em] text-[#111] dark:text-gray-100 md:text-[28px]">
                  {value}
                </p>
                <p className="text-xs text-[#aaa] dark:text-gray-200">{sub}</p>
              </div>
            ))}
          </div>

          {/* Activity card */}
          <div className="rounded-[14px] border border-[#e8e8e3] bg-white dark:bg-gray-500 px-4 py-5 md:px-6">
            <p className="mb-4 text-[13px] font-medium text-[#777] dark:text-gray-100">
              Recent activity
            </p>

            {[
              {
                dot: "#639922",
                text: "New user registered",
                time: "2m ago",
              },
              {
                dot: "#BA7517",
                text: "Config updated",
                time: "18m ago",
              },
              {
                dot: "#bbb",
                text: "Backup completed",
                time: "1h ago",
              },
            ].map(({ dot, text, time }) => (
              <div
                key={text}
                className="flex items-center gap-3 border-b border-[#f0f0ec] py-2.5 last:border-b-0"
              >
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: dot }}
                />
                <span className="flex-1 text-[13.5px] text-[#222] dark:text-gray-100">{text}</span>
                <span className="font-mono text-xs text-[#bbb]">{time}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminAccountPage;