"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session";

export default function RoleRedirectGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken, hydrated } = useSessionStore();

  useEffect(() => {
    if (!hydrated) return;

    if (!accessToken || !user) return;

    const role = String(user.role).toLowerCase();

    if (role === "admin") {
      router.replace("/admin");
    } else if (role === "customer" || role === "user") {
      router.replace("/my-account");
    }
  }, [accessToken, user, hydrated, router]);

  return <>{children}</>;
}