



"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BaseAPI } from "@/lib/api/baseApi";
import { useSessionStore } from "@/stores/session";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button/LogButton";
import { useCart } from "@/features/cart/context/CartContext";


const LoginPage = () => {
  const router = useRouter();
  const redirectHandled = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hydrated = useSessionStore((s) => s.hydrated);
  const { mergeGuestCartToBackend } = useCart();

  useEffect(() => {
    if (!hydrated || redirectHandled.current) return;

    const { accessToken, user } = useSessionStore.getState();

    // already logged in user
    if (accessToken && user) {
      redirectHandled.current = true;

      const role = String(user?.role || "").toLowerCase();

      if (role === "admin") {
        router.replace("/admin/account");
      } else {
        router.replace("/my-account");
      }
      return;
    }

   
  }, [hydrated, router]);


useEffect(() => {
  const redirect = sessionStorage.getItem("afterLogoutRedirect");

  if (redirect) {
    sessionStorage.removeItem("afterLogoutRedirect");
    router.replace(redirect);
    return; // 🔥 STOP here
  }
}, [router]);

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 10000);

    return () => clearTimeout(timer);
  }, [errorMsg]);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMsg("");

   const trimmedEmail = email.trim().toLowerCase();
const rawPassword = password;

if (!trimmedEmail || !rawPassword) {
  setErrorMsg("Email and password are required.");
  return;
}
    try {
      setLoading(true);

      const { accessToken, user } = await BaseAPI.login(trimmedEmail, rawPassword );

      useSessionStore.getState().setAccessToken(accessToken);
      useSessionStore.getState().setUser(user);

      const role = String(user?.role || "").toLowerCase();

      if (role === "admin") {
       window.location.replace("/admin")
      } else {
        if (role === "user" || role === "customer") {
          await mergeGuestCartToBackend();
        }
        router.replace("/");
      }
    } catch (err: any) {
      const msg = String(err?.message || "").toLowerCase();

      if (
        msg.includes("only admins can access the dashboard") ||
        msg.includes("only admins") ||
        msg.includes("unauthorized") ||
        msg.includes("invalid") ||
        msg.includes("password") ||
        msg.includes("credentials") ||
        msg.includes("not found")
      ) {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Login</h1>

        {errorMsg && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm font-medium text-black dark:text-gray-200 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-[#c5c59d] dark:bg-[#d2d2c8] hover:bg-[#a7a797] text-black font-semibold">
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-sm text-gray-600 dark:text-gray-300 ">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-medium text-black dark:text-gray-200 hover:underline"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;




