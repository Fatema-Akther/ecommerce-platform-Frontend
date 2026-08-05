import { BaseAPI } from "@/lib/api/baseApi";
import {
  CourierProvider,
  CourierShipmentStatus,
  Order,
} from "@/components/admin/orders/types";

export type AssignShipmentPayload = {
  courierProviderId: string;
  trackingNumber?: string;
  consignmentId?: string;
  courierStatus?: CourierShipmentStatus;
  codAmount?: number;
  deliveryCharge?: number;
  note?: string;
    pickupAddress?: string;
};

export const CourierAPI = {
  getProviders() {
    return BaseAPI.get("/admin/couriers", true) as Promise<CourierProvider[]>;
  },

assignShipment(orderId: string, payload: AssignShipmentPayload) {
  return BaseAPI.post(
    `/admin/couriers/orders/${orderId}/assign`,
    payload,
    true
  ) as Promise<Order>;
},



createLabel(
  orderId: string,
  payload: {
    rateId: string;
  }
) {
  return BaseAPI.post(
    `/admin/couriers/orders/${orderId}/create-label`,
    payload,
    true
  ) as Promise<Order>;
},


updateShipmentRate(
  shipmentId: string,
  payload: {
    rateId: string;
    rate: Record<string, any>;
    reason?: string;
  }
) {

  return BaseAPI.patch(
    `/admin/couriers/shipments/${shipmentId}/rate`,
    payload,
    true
  ) as Promise<any>;

},

  retryShipment(shipmentId: string) {
  return BaseAPI.post(
    `/admin/couriers/shipments/${shipmentId}/retry`,
    {},
    true
  );
}
};