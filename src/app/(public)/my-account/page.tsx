

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiBox, FiLogOut, FiMapPin, FiUser } from "react-icons/fi";
import { BaseAPI } from "@/lib/api/baseApi";
import { useSessionStore } from "@/stores/session";
import CustomerGuard from "@/components/guards/CustomerGuard";
import CustomerOrdersTab from "@/components/Customer_account/CustomerOrdersTab";


type TabType = "account" | "orders" | "addresses";

function MyAccountPageContent() {
  const router = useRouter();
  const accessToken = useSessionStore((s) => s.accessToken);
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
const logout = useSessionStore((s) => s.logout);

  
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();


  // Function to fetch user orders
  const tab = searchParams.get("tab");
const activeTab: TabType =
  tab === "orders" || tab === "addresses" || tab === "account"
    ? tab
    : "account";



  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (!user) {
      const loadProfile = async () => {
        try {
          setLoading(true);
          const me = await BaseAPI.me();
          setUser(me);
        } catch {
       logout();
          router.replace("/login");
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }
  }, [accessToken, user, router, setUser, logout]);

const handleLogout = async () => {
  await BaseAPI.logout();
  useSessionStore.getState().logout();
};

  const menuItems = [
    { key: "account", label: "Profile", icon: <FiUser className="h-5 w-5" /> },
    { key: "orders", label: "Order", icon: <FiBox className="h-5 w-5" /> },
    { key: "addresses", label: "Address", icon: <FiMapPin className="h-5 w-5" /> },
  ];


return (
  <CustomerGuard>
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-gray-900 px-3 py-4 md:px-8 md:py-8 lg:px-16">
      <div className="mx-auto max-w-6xl">

      
       {/* Mobile top bar */}
<div className="mb-3 flex items-center gap-3 justify-center rounded-[20px] border border-gray-200 bg-white px-2 py-2 shadow-sm md:hidden">
  
  {/* Scrollable tabs — শুধু menu items */}
  <div className="flex gap-3 overflow-x-auto scrollbar-hide">
    {menuItems.map((item) => {
      const isActive = activeTab === item.key;
      return (
        <button
          key={item.key}
          type="button"
          onClick={() => router.push(`/my-account?tab=${item.key}`)}
          className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-1 py-2 text-sm font-medium transition ${
            isActive
              ? "bg-orange-50 text-orange-500"
              : "text-gray-600 dark:text-gray-200 hover:bg-gray-50"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      );
    })}
  </div>

  {/* Log Out — সবসময় visible, scroll এর বাইরে */}
  <div className="shrink-0 border-l border-gray-300">
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1 whitespace-nowrap px-1 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
    >
      <FiLogOut className="h-4 w-4" />
      <span>Log Out</span>
    </button>
  </div>

</div>







        {/* Grid layout */}
        <div className="gap-6 md:grid md:grid-cols-[200px_500px] lg:grid-cols-[280px_580px] xl:grid-cols-[320px_1fr]">

          {/* Left side menu — শুধু md+ এ দেখাবে */}
          <div className="hidden rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm md:block">
            <div className="space-y-3">
              {menuItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      router.push(`/my-account?tab=${item.key}`);
                    }}
                    className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[16px] font-medium transition ${
                      isActive
                        ? "bg-orange-50 text-orange-500"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[16px] font-medium text-gray-700 dark:text-gray-300 transition hover:bg-orange-50 hover:text-orange-500"
              >
                <FiLogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="rounded-[20px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm md:rounded-[24px] md:p-8">
            {loading && !user ? (
              <p className="text-sm text-gray-500">Loading account details...</p>
            ) : (
              <>
                {activeTab === "account" && (
                  <div>
                    <h1 className="mb-8 text-3xl font-semibold text-gray-700 dark:text-gray-300">Account Details</h1>
                    <div className="space-y-8">
                      <div className="border-b border-gray-200 dark:border-gray-300 pb-6">
                        <p className="mb-2 text-[15px] font-medium text-gray-700 dark:text-gray-300">Name</p>
                        <p className="text-[17px] text-gray-700 dark:text-gray-300">{user?.fullName || "N/A"}</p>
                      </div>
                      <div className="border-b border-gray-200 dark:border-gray-300 pb-6">
                        <p className="mb-2 text-[15px] font-medium text-gray-700 dark:text-gray-300">Email Address</p>
                        <p className="text-[17px] text-gray-700 dark:text-gray-300">{user?.email || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

               {activeTab === "orders" && <CustomerOrdersTab userId={user?.id} />}
                {activeTab === "addresses" && (
                  <div>
                    <h1 className="mb-6 text-3xl font-semibold text-gray-900">Addresses</h1>
                    <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-gray-500">
                      No address added yet.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  </CustomerGuard>


);
}

export default function MyAccountPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading account...</div>}>
      <MyAccountPageContent />
    </Suspense>
  );
}