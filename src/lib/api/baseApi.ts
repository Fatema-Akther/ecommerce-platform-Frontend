


"use client";

import { BACKEND_URL } from "@/lib/env";
import { SessionUser, useSessionStore } from "@/stores/session";

type RequestOptions = {
  auth?: boolean;
  headers?: HeadersInit;
};

type ApiFetchOptions = RequestOptions & {
  method?: string;
  body?: any;
};

function normalizeOptions(options?: boolean | RequestOptions): RequestOptions {
  if (typeof options === "boolean") {
    return { auth: options };
  }
  return options ?? {};
}

async function tryParseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await tryParseJson(res);
    return data?.accessToken ?? null;
  } catch {
    return null;
  }
}


export async function apiFetch<T>(
  path: string,
  { auth = false, method = "GET", body, headers: customHeaders }: ApiFetchOptions = {}
): Promise<T> {
  const sessionStore = useSessionStore.getState();
  let accessToken = sessionStore.accessToken;

  const headers = new Headers(customHeaders || {});
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isBodyDefined = body !== undefined && body !== null;

  if (!isFormData && isBodyDefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth && accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const buildBody = () => {
    if (!isBodyDefined) return undefined;
    if (isFormData) return body;
    if (typeof body === "string" || body instanceof Blob) return body;
    return JSON.stringify(body);  // Ensure body (with image) is correctly serialized
  };

  const doRequest = async () => {
    return fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: buildBody(),
      credentials: "include",
    });
  };

  let res = await doRequest();

  if (res.status === 401 && auth && path !== "/auth/refresh-token") {
    const newToken = await refreshAccessToken();

    if (newToken) {
      useSessionStore.getState().setAccessToken(newToken);
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await doRequest();
    } else {
      useSessionStore.getState().clearSession();
    }
  }

  // if (!res.ok) {
  //   const errBody = await tryParseJson(res);
  //   const msg =
  //     errBody?.message ||
  //     (res.status === 401 ? "Unauthorized" : `Request failed: ${res.status}`);

  //   if (res.status === 401 && auth) {
  //     useSessionStore.getState().clearSession();
  //   }

  //   throw new Error(Array.isArray(msg) ? msg[0] : msg);
  // }


if (!res.ok) {
  const errBody = await tryParseJson(res);

  if (res.status === 401 && auth) {
    useSessionStore.getState().clearSession();
  }

  const error = new Error(
    Array.isArray(errBody?.message)
      ? errBody.message[0]
      : errBody?.message ||
        `Request failed: ${res.status}`
  );

  (error as any).response = {
    data: errBody,
    status: res.status,
  };

  throw error;
}


  return (await tryParseJson(res)) as T;
}

export const BaseAPI = {
  get: <T>(path: string, options?: boolean | RequestOptions) =>
    apiFetch<T>(path, {
      method: "GET",
      ...normalizeOptions(options),
    }),

  post: <T>(path: string, body?: any, options?: boolean | RequestOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      body,
      ...normalizeOptions(options),
    }),

  put: <T>(path: string, body?: any, options?: boolean | RequestOptions) =>
    apiFetch<T>(path, {
      method: "PUT",
      body,
      ...normalizeOptions(options),
    }),

  patch: <T>(path: string, body?: any, options?: boolean | RequestOptions) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body,
      ...normalizeOptions(options),
    }),

  delete: <T>(path: string, body?: any, options?: boolean | RequestOptions) =>
    apiFetch<T>(path, {
      method: "DELETE",
      body,
      ...normalizeOptions(options),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; user: SessionUser }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (fullName: string, email: string, password: string) =>
    apiFetch<{ message: string; requiresOtp: boolean; email: string }>(
      "/auth/register",
      {
        method: "POST",
        body: { fullName, email, password },
      }
    ),

  verifyEmailOtp: (email: string, otp: string) =>
    apiFetch<{ accessToken: string; user: SessionUser }>(
      "/auth/verify-email-otp",
      {
        method: "POST",
        body: { email, otp },
      }
    ),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { email, otp, newPassword },
    }),

  me: (): Promise<SessionUser> => apiFetch("/auth/me", { auth: true }),

  logout: async (): Promise<void> => {
  try {
    await apiFetch("/auth/logout", { method: "POST", auth: true });
  } catch {}
},

  updateAdminEmailAndPassword: (
    userId: string,
    newEmail: string,
    newPassword: string
  ) =>
    apiFetch<{ message: string }>(
      `/auth/update-admin-email-password/${userId}`,
      {
        method: "PUT",
        body: { newEmail, newPassword },
      }
    ),
};




