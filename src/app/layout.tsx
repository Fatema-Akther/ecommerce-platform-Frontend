import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || "light";
  }
  return "light";
};

export const metadata = {
  title: "sumashop | Premium Fashion Store",
  description: "Discover premium fashion and lifestyle products at sumashop.",

  metadataBase: new URL("https://sumashop.xyz"),

  openGraph: {
    title: "sumashop | Premium Fashion Store",
    description: "Modern eCommerce platform with smart ordering system and automation.",
    url: "https://sumashop.xyz",
    siteName: "sumashop",
    images: [
      {
         url: "https://sumashop.xyz/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "sumashop | Premium Fashion Store",
    description: "Modern eCommerce platform with automation & fraud detection.",
     images: ["https://sumashop.xyz/og-image.png"],
  },

  icons: {
    icon: "/icon/64.png",
    shortcut: "/icon/180.png",
    apple: "/icon/180.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}





