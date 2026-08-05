"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session";

type Props = {
  children: ReactNode;
};

export default function AdminGuard({ children }: Props) {
  const router = useRouter();
  const { hydrated, user, accessToken, isLoading } = useSessionStore();

  useEffect(() => {
    if (!hydrated || isLoading) return;

    if (!accessToken || !user) {
      router.replace("/login");
      return;
    }

    if (String(user.role).toLowerCase() !== "admin") {
      router.replace("/my-account");
    }
  }, [hydrated, isLoading, accessToken, user, router]);

  if (!hydrated || isLoading) {
    return <div>Loading...</div>;
  }

  if (!accessToken || !user) {
    return null;
  }

  if (String(user.role).toLowerCase() !== "admin") {
    return null;
  }

  return <>{children}</>;
}