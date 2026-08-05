// export type Payment = {
//   id: string;
//   status: string;
//   provider: string;
//   amount?: number;
//   currency?: string;
//   phone?: string;
//   providerTrxId?: string;
//   createdAt?: string;
//   updatedAt?: string;
// };

// export type PaymentStatusResponse = {
//   paymentId: string;
//   provider: string;
//   status: string;
//   expiresAt?: string | null;
//   resendAt?: string | null;
//   lockedUntil?: string | null;
//   attempts?: number;
//   maskedPhone?: string;
// };

// export type CodPaymentResponse = {
//   paymentId: string;
//   provider: string;
//   status: string;
// };

// export type BkashSendOtpResponse = {
//   paymentId: string;
//   provider: string;
//   status: string;
//   maskedPhone?: string;
//   expiresAt?: string;
//   resendAt?: string;
// };

// export type BkashVerifyOtpResponse = {
//   success: boolean;
//   orderId: string;
//   trxId: string;
// };

// export type PendingManualBkashPayment = {
//   paymentId: string;
//   provider: "bkash_manual";
//   status: "initiated" | "success" | "failed" | "cancelled" | "otp_sent";
//   amount: number;
//   currency: string;
//   senderPhone?: string;
//   trxId?: string;
//   createdAt: string;
//   order: {
//     id: string;
//     status: string;
//     total: number;
//     paymentMethod: string;
//     paymentProvider?: string | null;
//     customer: {
//       id?: string;
//       email?: string;
//       fullName?: string;
//       phone?: string;
//       city?: string;
//       area?: string;
//       address?: string;
//     };
//   };
//   meta?: any;
// };

// export type ManualBkashReviewResponse = {
//   success: boolean;
//   paymentId: string;
//   action: "approve" | "reject";
//   paymentStatus: string;
//   orderId: string;
//   orderStatus: string;
//   trxId?: string | null;
//   adminNote?: string | null;
// };



export type Payment = {
  id: string;
  status: string;
  provider: string;
  amount?: number;
  currency?: string;
  providerTrxId?: string;
  createdAt?: string;
  updatedAt?: string;
};



export type PaymentStatusResponse = {
  paymentId: string;
  provider: string;
  status: string;
};



export type CodPaymentResponse = {
  paymentId: string;
  provider: string;
  status: string;
};



export type StripeCheckoutResponse = {
  paymentId: string;
  provider: "stripe";
  status: string;
  checkoutSessionId: string;
  checkoutUrl?: string | null;
  mock?: boolean;
};



export type StripeMockResponse = {
  received?: boolean;
  success?: boolean;
  paymentId?: string;
  orderId?: string;
  transactionId?: string;
  trxId?: string;
  orderStatus?: string;
};