"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session";

type Props = {
  children: ReactNode;
};

export default function CustomerGuard({ children }: Props) {
  const router = useRouter();
  const { hydrated, user, accessToken, isLoading } = useSessionStore();

  useEffect(() => {
    if (!hydrated || isLoading) return;

    // login না থাকলে login page এ পাঠাও
    if (!accessToken || !user) {
      router.replace("/login");
      return;
    }

    // admin হলে customer page এ ঢুকতে দিও না
    if (user.role !== "user") {
      router.replace("/admin");
    }
  }, [hydrated, isLoading, accessToken, user, router]);

  if (!hydrated || isLoading) {
    return <div>Loading...</div>;
  }

  if (!accessToken || !user) {
    return null;
  }

  if (user.role !== "user") {
    return null;
  }

  return <>{children}</>;
}