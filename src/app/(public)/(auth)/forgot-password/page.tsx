"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BaseAPI } from "@/lib/api/baseApi";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button/LogButton";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const sendOtp = async () => {
    setErrorMsg("");
    setMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await BaseAPI.forgotPassword(trimmedEmail);
      setMsg(res.message || "OTP sent to your email.");
      setStep("reset");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setErrorMsg("");
    setMsg("");

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();
    const trimmedPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedEmail || !trimmedOtp || !trimmedPassword || !trimmedConfirmPassword) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await BaseAPI.resetPassword(
        trimmedEmail,
        trimmedOtp,
        trimmedPassword
      );
      setMsg(res.message || "Password reset successful.");
      router.push("/login");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">
        Forgot Password
      </h1>

      {msg && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {msg}
        </div>
      )}

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

      {step === "request" ? (
        <Button onClick={sendOtp} disabled={loading} className="w-full text-black bg-[#c5c59d] dark:bg-[#d2d2c8] hover:bg-[#a7a797]">
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>
      ) : (
        <>
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Input
            placeholder="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button onClick={resetPassword} disabled={loading} className="w-full bg-[#e2e2a3] text-black">
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          <button
            type="button"
            onClick={sendOtp}
            className="w-full text-sm font-medium text-[#848428] hover:text-[#a7a797]"
          >
            Resend OTP
          </button>
        </>
      )}

      <p className="text-sm text-gray-600">
        Back to{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-medium text-black hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
}