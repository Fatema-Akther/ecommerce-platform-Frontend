

import { BaseAPI } from "@/lib/api/baseApi";

export type DashboardShipmentPeriod = "today" | "month" | "all";

export type DashboardMonthlySale = {
  month: string;
  total: number;
};

export type DashboardRecentOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  itemCount: number;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  courierStatus: string;
  courierName?: string | null;
};

export type DashboardCategorySale = {
  name: string;
  amount: number;
  percent: number;
};


export type DashboardProductSale = {
  productId: string;
  name: string;
  quantitySold: number;
  amount: number;
  percent: number;
};

export type DashboardSummary = {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;

  shipmentPeriod: DashboardShipmentPeriod;

  shipmentStatus: {
    delivered: number;
    onDelivery: number;
    returned: number;
    cancelled: number;
    readyToShip: number;
    assigned: number;
  };

  monthlySales: DashboardMonthlySale[];
  recentOrders: DashboardRecentOrder[];
  categorySales: DashboardCategorySale[];
   productSales: DashboardProductSale[];
};

export const DashboardAPI = {
  getSummary(shipmentPeriod: DashboardShipmentPeriod = "month") {
    return BaseAPI.get(
      `/admin/dashboard/summary?shipmentPeriod=${shipmentPeriod}`,
      true
    ) as Promise<DashboardSummary>;
  },
};