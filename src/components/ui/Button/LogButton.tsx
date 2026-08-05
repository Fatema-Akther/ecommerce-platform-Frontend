"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:opacity-90 disabled:bg-primary/60",
  secondary:
    "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-500",
  outline:
    "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-60",
  ghost:
    "bg-transparent text-gray-900 hover:bg-gray-100 disabled:opacity-60",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(
          "inline-flex items-center justify-center rounded-lg font-medium transition outline-none",
          "focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;