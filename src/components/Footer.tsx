


"use client";

import Link from "next/link";
import { FaInstagram, FaTiktok, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import Logo from "./ui/logo";

import { useMemo } from "react";

interface FooterProps {
  businessData?: any;
}


function normalizeExternalUrl(url?: string | null) {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

const Footer = ({ businessData }: FooterProps) => {
 
  // ✅ memoized (avoid recalculation on re-render)
  const socialLinks = useMemo(() => {
    return {
      facebook: normalizeExternalUrl(businessData?.facebookUrl),
      instagram: normalizeExternalUrl(businessData?.instagramUrl),
      tiktok: normalizeExternalUrl(businessData?.tiktokUrl),
    };
  }, [
    businessData?.facebookUrl,
    businessData?.instagramUrl,
    businessData?.tiktokUrl,
  ]);

  return (
    <footer className=" bg-primary text-secondary dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10 lg:px-14">

        {/* GRID */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-10 justify-items-center">


         {/* ABOUT */}
<div className="min-h-[150px]">
  <h3 className="mb-5 h-[16px] text-[12px] font-semibold uppercase leading-[16px] tracking-[0.14em]">
    About Us
  </h3>

  <ul className="space-y-3 text-[14px] leading-[20px]">
    <li className="h-[20px]">
      <Link href="/" className="inline-block">
        Our Story
      </Link>
    </li>
    <li className="h-[20px]">
      <Link href="/" className="inline-block">
        Made with Care
      </Link>
    </li>
    <li className="h-[20px]">
      <Link href="/" className="inline-block">
        Blog
      </Link>
    </li>
  </ul>
</div>

{/* ASSISTANCE */}
<div className="min-h-[150px]">
  <h3 className="mb-5 h-[16px] text-[12px] font-semibold uppercase leading-[16px] tracking-[0.14em]">
    Assistance
  </h3>

  <ul className="space-y-3 text-[14px] leading-[20px]">
    <li className="min-h-[20px]">
      <Link href="/" className="inline-block">
        Terms & Conditions
      </Link>
    </li>
    <li className="min-h-[20px]">
      <Link href="/" className="inline-block">
        Privacy Policy
      </Link>
    </li>
    <li className="min-h-[20px]">
      <Link href="/" className="inline-block">
        Accessibility
      </Link>
    </li>
  </ul>
</div>

{/* BOUTIQUES */}
<div className="min-h-[150px]">
  <h3 className="mb-5 h-[16px] text-[12px] font-semibold uppercase leading-[16px] tracking-[0.14em]">
    Boutiques
  </h3>

  <ul className="space-y-3 text-[14px] leading-[20px]">
    <li className="min-h-[20px]">
      <Link href="/" className="inline-block">
        Find a store
      </Link>
    </li>
    <li className="min-h-[20px]">
      <Link href="/" className="inline-block">
        Book a free eye test
      </Link>
    </li>
  </ul>
</div>
        </div>

        {/* SOCIAL */}
       <div className="mt-8 text-center sm:mt-0 min-h-[80px]">
          <div className="flex items-center justify-center gap-5 min-h-[24px]">

            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition"
              >
                <FaInstagram className="h-[18px] w-[18px]" />
              </a>
            )}

            {socialLinks.tiktok && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="transition"
              >
                <FaTiktok className="h-[17px] w-[17px]" />
              </a>
            )}

            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition"
              >
                {/* ✅ FIXED BUG HERE */}
                <FaFacebookF className="h-[16px] w-[16px]" />
              </a>
            )}

            <a
              href="#"
              aria-label="X"
              className="transition"
            >
              <FaXTwitter className="h-[16px] w-[16px]" />
            </a>

          </div>

          <p className="mt-8 h-[18px] text-[12px]">
  © 2026 {businessData?.businessName ?? ""}
</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;