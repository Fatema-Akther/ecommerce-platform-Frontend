"use client";

import { useSessionStore } from "@/stores/session";

// Function to try parsing the JSON response
async function tryParseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

// Define refreshAccessToken function
async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) return null;

  const data = await tryParseJson(res);
  const token =
    data?.accessToken ??
    data?.data?.accessToken ??
    data?.token ??
    null;

  return typeof token === "string" ? token : null;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean } = {}
): Promise<T> {
  const { accessToken, setAccessToken } = useSessionStore.getState();

  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  if (opts.auth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const doRequest = async () =>
    fetch(path, {
      ...init,
      headers,
      credentials: "include",
    });

  let res = await doRequest();

  // Auto refresh on 401 once
  if (res.status === 401 && path !== "/auth/refresh-token") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAccessToken(newToken);
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await doRequest();
    }
  }

  if (!res.ok) {
    const errBody = await tryParseJson(res);
    const msg =
      (typeof errBody === "string" && errBody) ||
      errBody?.message ||
      errBody?.error ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return (await tryParseJson(res)) as T;
}