"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/ui/head/Navbar";
import { usePathname } from "next/navigation";
import { useBusiness } from "@/hooks/useBusiness";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { businessData } = useBusiness();

  const hideFooterRoutes = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  const hideFooter = hideFooterRoutes.includes(pathname);

  return (
    <>
      <Navbar businessData={businessData} />
      {children}
      {/* {!hideFooter &&  <Footer businessData={businessData} />} */}
  {!hideFooter && <Footer businessData={businessData} />}
    </>
  );
}