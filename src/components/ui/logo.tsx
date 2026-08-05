


"use client";

import Image from "next/image";

type LogoProps = {
  logo?: string | { secure_url?: string; url?: string } | null;
  className?: string;
  priority?: boolean;
};

export default function Logo({
  logo,
  className = "w-full h-full",
  priority = false,
}: LogoProps) {
  const logoUrl =
    typeof logo === "string"
      ? logo
      : logo?.secure_url || logo?.url || "";

  return (
    <div className={`relative shrink-0 overflow-hidden ${className}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="Business Logo"
          fill
          priority={priority}
          sizes="240px"
          className="object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-lg font-semibold text-current">
            Business Name
          </span>
        </div>
      )}
    </div>
  );
}


