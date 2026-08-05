// "use client";

// import {
 
  
//   CodPaymentResponse,

//   PaymentStatusResponse,
 
// } from "@/types/payment";
// import { apiFetch } from "./baseApi";

// export const PaymentAPI = {
//   // COD
//   codPayment: (orderId: string) =>
//     apiFetch<CodPaymentResponse>(`/payments/cod/${orderId}`, {
//       method: "POST",
//       auth: true,
//     }),

//   // bKash mock OTP
//   sendBkashOtp: (orderId: string, phone: string) =>
//     apiFetch<BkashSendOtpResponse>(`/payments/bkash/send-otp`, {
//       method: "POST",
//       body: { orderId, phone },
//       auth: true,
//     }),

//   resendBkashOtp: (paymentId: string) =>
//     apiFetch<BkashSendOtpResponse>(`/payments/bkash/resend-otp`, {
//       method: "POST",
//       body: { paymentId },
//       auth: true,
//     }),

//   // IMPORTANT: paymentId লাগবে, orderId না
//   verifyBkashOtp: (paymentId: string, otp: string) =>
//     apiFetch<BkashVerifyOtpResponse>(`/payments/bkash/verify`, {
//       method: "POST",
//       body: { paymentId, otp },
//       auth: true,
//     }),

//   checkPaymentStatus: (paymentId: string) =>
//     apiFetch<PaymentStatusResponse>(`/payments/${paymentId}/status`, {
//       auth: true,
//     }),

//   // Manual bKash admin
//   getPendingManualBkashPayments: () =>
//     apiFetch<PendingManualBkashPayment[]>(
//       `/payments/admin/manual-bkash/pending`,
//       {
//         auth: true,
//       }
//     ),

//   reviewManualBkashPayment: (
//     paymentId: string,
//     action: "approve" | "reject",
//     note?: string
//   ) =>
//     apiFetch<ManualBkashReviewResponse>(`/payments/admin/manual-bkash/review`, {
//       method: "POST",
//       body: { paymentId, action, note },
//       auth: true,
//     }),
// };



"use client";

import {
  CodPaymentResponse,
  PaymentStatusResponse,
} from "@/types/payment";

import { apiFetch } from "./baseApi";

export const PaymentAPI = {

  // =========================
  // COD PAYMENT
  // =========================
  codPayment: (orderId: string) =>
    apiFetch<CodPaymentResponse>(
      `/payments/cod/${orderId}`,
      {
        method: "POST",
        auth: true,
      }
    ),


  // =========================
  // STRIPE CHECKOUT
  // =========================
  createStripeCheckoutSession: (orderId: string) =>
    apiFetch<{
      paymentId: string;
      provider: string;
      status: string;
      checkoutSessionId: string;
      checkoutUrl: string | null;
      mock: boolean;
    }>(
      `/payments/stripe/checkout-session/${orderId}`,
      {
        method: "POST",
        auth: true,
      }
    ),


  // =========================
  // STRIPE MOCK (development)
  // =========================
completeStripeMockPayment: (paymentId: string) =>
  apiFetch(
    `/payments/stripe/mock/complete/${paymentId}`,
    {
      method: "POST",
      auth: true,
    }
  ),


expireStripeMockPayment: (paymentId: string) =>
  apiFetch(
    `/payments/stripe/mock/expire/${paymentId}`,
    {
      method: "POST",
      auth: true,
    }
  ),


  // =========================
  // PAYMENT STATUS
  // =========================
  checkPaymentStatus: (paymentId: string) =>
    apiFetch<PaymentStatusResponse>(
      `/payments/${paymentId}/status`,
      {
        auth: true,
      }
    ),

};