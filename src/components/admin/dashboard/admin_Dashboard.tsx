








"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FiBox,
  FiCreditCard,
  FiList,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUpload,
  FiUsers,
} from "react-icons/fi";


import { DashboardAPI, DashboardShipmentPeriod, DashboardSummary } from "@/lib/api/admin_dashboardApi";
import SalesOverviewCard from "./Category_SalesOverviewCard";
import SalesStatisticCard from "./SalesStatisticCard";
import TodayRecentOrdersCard from "./TodayRecentOrdersCard";
import ProductSalesOverviewCard from "./Product_SalesOverviewCard";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";

function formatMoney(value: number) {
 return formatCurrency(Number(value || 0));
}

function formatCount(value: number) {
  return Number(value || 0).toLocaleString();
}

// Mobile-only section label
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 sm:hidden">
      {children}
    </p>
  );
}

function StatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border shadow-sm ${className}`}>
      {/* Mobile: horizontal layout */}
      <div className="flex items-center gap-3 p-4 sm:hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium opacity-70 dark:text-gray-300">{title}</p>
          <p className="text-lg font-bold text-gray-950 dark:text-gray-300">{value}</p>
        </div>
      </div>

      {/* Desktop: original layout */}
      <div className="hidden p-5 sm:block">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
            <p className="mt-3 text-2xl font-bold text-gray-950 dark:text-gray-200">{value}</p>
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
  cardClassName = "border-gray-200 bg-white dark:bg-gray-800",
  iconBoxClassName = "bg-gray-100 text-gray-700",
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  cardClassName?: string;
  iconBoxClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border shadow-sm transition hover:shadow-md active:scale-[0.98] ${cardClassName}`}
    >
      {/* Mobile */}
      <div className="flex flex-col gap-2 p-4 sm:hidden">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${iconBoxClassName}`}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-gray-200">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden p-5 sm:block">
        <div className="flex items-start gap-4">
          <div className={`rounded-xl p-3 text-xl ${iconBoxClassName}`}>
            {icon}
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-950 dark:text-gray-200">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}


function ShipmentStatusCard({
  status,
  period,
  onPeriodChange,
}: {
  status: DashboardSummary["shipmentStatus"];
  period: DashboardShipmentPeriod;
  onPeriodChange: (period: DashboardShipmentPeriod) => void;
}) {
  const delivered = Number(status.delivered || 0);
  const onDelivery = Number(status.onDelivery || 0);
  const returned = Number(status.returned || 0);
  const cancelled = Number(status.cancelled || 0);

  const total = delivered + onDelivery + returned + cancelled;

  const deliveredPct = total > 0 ? (delivered / total) * 100 : 0;
  const onDeliveryPct = total > 0 ? (onDelivery / total) * 100 : 0;
  const returnedPct = total > 0 ? (returned / total) * 100 : 0;
  const cancelledPct = total > 0 ? (cancelled / total) * 100 : 0;

  const donutStyle =
    total > 0
      ? {
          background: `conic-gradient(
            #22c55e 0 ${deliveredPct}%,
            #06b6d4 ${deliveredPct}% ${deliveredPct + onDeliveryPct}%,
            #ef4444 ${deliveredPct + onDeliveryPct}% ${deliveredPct + onDeliveryPct + returnedPct}%,
            #eab308 ${deliveredPct + onDeliveryPct + returnedPct}% ${deliveredPct + onDeliveryPct + returnedPct + cancelledPct}%
          )`,
        }
      : { background: "#e5e7eb" };

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-950 dark:text-gray-200 sm:text-xl">
            Shipment Status
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm">
            Total shipments: {total.toLocaleString()}
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as DashboardShipmentPeriod)}
          className="rounded-lg border bg-white  px-2 py-1.5 text-xs text-gray-700 outline-none sm:px-3 sm:py-2 sm:text-sm"
        >
          <option value="today">Today</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {total === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-sm text-gray-500 sm:h-40">
          No shipment data found.
        </div>
      ) : (
        <div className="flex justify-center">
          <div
            className="relative h-32 w-32 rounded-full sm:h-40 sm:w-40"
            style={donutStyle}
          >
            <div className="absolute inset-6 rounded-full bg-white dark:bg-gray-800 sm:inset-8" />
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:mt-6 sm:gap-3 sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-sm bg-green-500" />
          <span>Delivered: {delivered}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-sm bg-cyan-500" />
          <span>On Delivery: {onDelivery}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-sm bg-red-500" />
          <span>Returned: {returned}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-sm bg-yellow-500" />
          <span>Cancelled: {cancelled}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [shipmentPeriod, setShipmentPeriod] = useState<DashboardShipmentPeriod>("month");

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState(null, "", window.location.href);
    const onBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onBack);
    return () => {
      window.removeEventListener("popstate", onBack);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await DashboardAPI.getSummary(shipmentPeriod);
        if (!cancelled) setSummary(data);
      } catch (error: any) {
        if (!cancelled) {
          setErrorMsg(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load dashboard"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => { cancelled = true; };
  }, [shipmentPeriod]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading dashboard...</div>;
  }

  if (errorMsg || !summary) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg || "Dashboard data not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-gray-900 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-950 dark:text-gray-200 sm:text-2xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sales, orders, shipment and payment review overview.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/settings/business")}
          className="w-fit rounded-full bg-[#C8956C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 sm:px-6 sm:py-3"
        >
         Store Setup
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <SectionLabel>Overview</SectionLabel>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={formatMoney(summary.totalSales)}
          icon={<FiTrendingUp />}
          className="border-purple-100 bg-purple-50 dark:bg-gray-800 text-purple-600"
        />
        <StatCard
          title="Total Customers"
          value={formatCount(summary.totalCustomers)}
          icon={<FiUsers />}
          className="border-blue-100 bg-blue-50 dark:bg-gray-800 text-blue-600"
        />
        <StatCard
          title="Total Products"
          value={formatCount(summary.totalProducts)}
          icon={<FiShoppingBag />}
          className="border-orange-100 bg-orange-50 dark:bg-gray-800 text-orange-600"
        />
        <StatCard
          title="Total Orders"
          value={formatCount(summary.totalOrders)}
          icon={<FiBox />}
          className="border-green-100 bg-green-50 dark:bg-gray-800 text-green-600"
        />
      </div>

      {/* ── Quick Links ── */}
      <SectionLabel>Quick Actions</SectionLabel>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 xl:grid-cols-4">
  <QuickLink
    href="/admin/orders"
    title="View All Orders"
    description="All customer orders and status actions"
    icon={<FiList />}
    cardClassName="border-blue-100 bg-blue-50 dark:border-gray-700 dark:bg-gray-800"
    iconBoxClassName="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
  />

  <QuickLink
    href="/admin/orders/pending-verification"
    title="Suspicious Orders"
    description="Rivew pending order"
    icon={<FiPackage />}
    cardClassName="border-red-100 bg-red-100 dark:border-gray-700 dark:bg-gray-800"
    iconBoxClassName="bg-red-50 text-red-500 dark:bg-red-900/40 dark:text-red-300"
  />

  <QuickLink
    href="/admin/products/upload"
    title="Upload Product"
    description="  add new product "
    icon={<FiUpload />}
    cardClassName="border-orange-100 bg-orange-50 dark:border-gray-700 dark:bg-gray-800"
    iconBoxClassName="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
  />

  <QuickLink
    href="/admin/products"
    title="Product List"
    description="Manage uploaded products"
    icon={<FiShoppingBag />}
    cardClassName="border-green-100 bg-green-50 dark:border-gray-700 dark:bg-gray-800"
    iconBoxClassName="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
  />
</div>

      {/* ── Sales Chart + Shipment ── */}
      <SectionLabel>Statistics</SectionLabel>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:mt-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <SalesStatisticCard data={summary.monthlySales || []} />
        <ShipmentStatusCard
          status={summary.shipmentStatus}
          period={shipmentPeriod}
          onPeriodChange={setShipmentPeriod}
        />
      </div>

      {/* ── Orders + Sales Overview ── */}
      <SectionLabel>Orders & Breakdown</SectionLabel>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <TodayRecentOrdersCard orders={summary.recentOrders || []} />
        <div className="space-y-4 sm:space-y-6">
          <SalesOverviewCard
            data={summary.categorySales || []}
            totalSales={summary.totalSales}
          />
          <ProductSalesOverviewCard
            data={summary.productSales || []}
            totalSales={summary.totalSales}
          />
        </div>
      </div>

      {/* ── bKash Review ── */}
      <SectionLabel>Manual bKash Review</SectionLabel>
      <div className="mt-3 rounded-2xl border bg-white dark:bg-gray-800 p-4 shadow-sm sm:mt-6 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-pink-50 p-2.5 text-pink-600 sm:p-3">
            <FiCreditCard />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-950 dark:text-gray-200 sm:text-xl">
              Manual bKash Review
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              Verify manual bKash payments from customers.
            </p>
          </div>
        </div>
       
      </div>

    </div>
  );
}