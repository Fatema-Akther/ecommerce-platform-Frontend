export type ReviewAction = "approve" | "reject";

export type OrderStatus =
  | "pending"
  | "pending_verification"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "refunded"
  | "failed"
  | "cancelled";

export type PaymentMethod =
  | "cod"

  | "stripe";

export type CourierMode = "manual" | "api";

export type CourierShipmentStatus =
  | "not_assigned"
  | "ready_to_ship"
  | "assigned_to_courier"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "returned"
  | "cancelled";


export type RiskLevel = "low" | "medium" | "high";

export type RiskFactor = {
  title: string;
  description: string;
  points: number;
  level: RiskLevel;
};

export type RiskSignals = {
  recentOrdersFromIp?: number;
  recentOrdersFromPhone?: number;
  previousCancelledOrdersByPhone?: number;
  accountAgeHours?: number;
  suspiciousKeywords?: string[];
  highValueCod?: boolean;
  missingAreaOrCity?: boolean;
  firstTimeCustomer?: boolean;

  riskLevel?: RiskLevel;
  riskFactors?: RiskFactor[];
};





export type CourierProvider = {
  id: string;
  name: string;
  code: string;
  mode: CourierMode;
  phone?: string | null;
  websiteUrl?: string | null;
  trackingUrlPattern?: string | null;
  isActive: boolean;
  isApiEnabled: boolean;
  sortOrder?: number;
};




export type ShippoRate = {
    id: string;
  object_id: string;
  provider: string;
  amount: string;
  currency: string;
  servicelevel?: {
    name?: string;
  };
  estimated_days?: number;
};


export type OrderShipment = {
  id: string;
  orderId: string;
  courierProviderId: string;

  trackingNumber?: string | null;
  consignmentId?: string | null;

  courierStatus: CourierShipmentStatus;

  processingStatus?: 'idle' | 'queued' | 'processing' | 'failed';

  errorMessage?: string | null;

  codAmount?: number | string | null;
  deliveryCharge?: number | string | null;

  note?: string | null;

  trackingUrl?: string | null;

  sentAt?: string | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;

  courierProvider?: CourierProvider;

  pickupAddress?: string | null;


  // ✅ ADD THIS
  availableRates?: ShippoRate[];

  responsePayload?: any;

  selectedRateId?: string | null;
    adminSelectedRateId?: string | null;

  adminSelectedRate?: {
    provider?: string;
    service?: string;
    amount?: string | number;
    currency?: string;
    [key:string]: any;
  } | null;


  rateOverrideReason?: string | null;


};

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  lineTotal: number;
  variantId?: string;
  variantLabel?: string;
  imageSnapshot?: string;
  nameSnapshot?: string;
  product?: {
    id: string;
    name: string;
    slug?: string;
    image?: string;
    media?: {
      id?: string;
      url: string;
      type: string;
      position?: number;
    }[];
  };
};



export type Payment = {
  id: string;
  provider: string;
  status: string;
  amount: number;
  phone?: string;
  providerTrxId?: string;
  createdAt?: string;
};


export type Order = {
  id: string;
  status: OrderStatus;
  reviewStatus?: string;
  fraudFlag?: boolean;
  riskScore?: number;

  total: number;
  subtotal?: number;
  deliveryCharge?: number;

   shippingRateId?: string | null;
  shippingMethod?: string | null;
  shippingCost?: number | string | null;

  paymentMethod: PaymentMethod;
  paymentProvider?: string;

  createdAt: string;
  adminReviewNote?: string | null;

  delivery: {
    fullName: string;
    phone: string;
    address: string;
   
      state?: string;
    city?: string;
      postalCode?: string;
        country?: string;
        
    
    note?: string;
  };

riskSignals?: RiskSignals | null;

  user?: {
    id: string;
    email?: string;
    fullName?: string;
    role?: string;
  };

  items?: OrderItem[];
  shipments?: OrderShipment[];

  payments?: Payment[]; // ✅ ADD THIS
};