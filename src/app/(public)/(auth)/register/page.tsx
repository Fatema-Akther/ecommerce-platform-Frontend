"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { BaseAPI } from "@/lib/api/baseApi";
import { useSessionStore } from "@/stores/session";

import Button from "@/components/ui/Button/LogButton";
import { useCart } from "@/features/cart/context/CartContext";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isValidEmail = (email: string) => {
  const value = normalizeEmail(email);

  if (!value || /\s/.test(value)) return false;

  const basicRegex =
    /^(?!.*\.\.)(?!\.)([a-z0-9](\.?[a-z0-9_+-])*)@([a-z0-9-]+\.[a-z]{2,})$/i;

  if (!basicRegex.test(value)) return false;

  const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
  const domain = value.split("@")[1];

  return allowedDomains.includes(domain);
};

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"register" | "verify">("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailError, setEmailError] = useState("");

  const setAccessToken = useSessionStore((s) => s.setAccessToken);
  const setUser = useSessionStore((s) => s.setUser);
  const { mergeGuestCartToBackend } = useCart();

  useEffect(() => {
  const storageKey = "auth-refresh-path";
  const currentPath = window.location.pathname;

  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  const navType = navEntry?.type;
  const savedPath = sessionStorage.getItem(storageKey);

  if (navType === "reload" && savedPath === currentPath) {
    sessionStorage.removeItem(storageKey);
    router.replace("/");
    return;
  }

  sessionStorage.removeItem(storageKey);

  const handleBeforeUnload = () => {
    sessionStorage.setItem(storageKey, currentPath);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    sessionStorage.removeItem(storageKey);
  };
}, [router]);

  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(""), 10000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const validateEmailField = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setEmailError("");
      return false;
    }

    if (!isValidEmail(trimmedValue)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }

    setEmailError("");
    return true;
  };

  const emailBorderClass = emailError
    ? "border-red-500 focus:border-red-500"
    : email.trim() && isValidEmail(email)
    ? "border-green-500 focus:border-green-500"
    : "";

  const onRegisterSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMsg("");

    const trimmedFullName = fullName.trim();
    const trimmedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();

    if (!trimmedFullName) {
      setErrorMsg("Full name is required.");
      return;
    }

    const emailOk = validateEmailField(trimmedEmail);
    if (!emailOk) return;

    if (!trimmedPassword) {
      setErrorMsg("Password is required.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await BaseAPI.register(trimmedFullName, trimmedEmail, trimmedPassword);

      setStep("verify");
      setErrorMsg("OTP has been sent to your email.");
    } catch (error: any) {
      const message = error?.message?.toLowerCase?.() || "";

      if (
        message.includes("email already registered") ||
        message.includes("email already in use") ||
        message.includes("already exists")
      ) {
        setErrorMsg("This email is already registered.");
      } else {
        setErrorMsg(error?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = async (e?: React.SyntheticEvent) => {
  e?.preventDefault();
  setErrorMsg("");

  const trimmedEmail = normalizeEmail(email);
  const trimmedOtp = otp.trim();

  if (!trimmedOtp) {
    setErrorMsg("OTP is required.");
    return;
  }

  if (trimmedOtp.length !== 6) {
    setErrorMsg("OTP must be 6 digits.");
    return;
  }

  try {
    setLoading(true);

    const { accessToken, user } = await BaseAPI.verifyEmailOtp(
      trimmedEmail,
      trimmedOtp
    );

    useSessionStore.getState().setAccessToken(accessToken);
    useSessionStore.getState().setUser(user);

    await mergeGuestCartToBackend();

    router.replace("/");
  } catch (error: any) {
    setErrorMsg(error?.message || "OTP verification failed.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">
        {step === "register" ? "Register" : "Verify Email"}
      </h1>

      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {step === "register" ? (
        <form onSubmit={onRegisterSubmit} className="space-y-4">
          <Input
            placeholder="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={(e) => validateEmailField(e.target.value)}
              className={emailBorderClass}
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" disabled={loading} className=" bg-[#c5c59d] dark:bg-[#d2d2c8] hover:bg-[#a7a797] text-black font-semibold w-full">
            {loading ? "Sending OTP..." : "Register"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerifySubmit} className="space-y-4">
          <Input
            placeholder="Enter 6 digit OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button type="submit" disabled={loading} className="w-full text-gray-800">
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-600 dark:text-gray-300 ">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-medium text-black dark:text-gray-200 hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading register...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}