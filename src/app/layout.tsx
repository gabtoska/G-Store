import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const satoshi = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap"
});

const clash = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-clash",
  weight: ["500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "G Store | Dress like a G",
  description:
    "High-end fashion e-commerce experience with premium clothing, statement accessories, and runway-inspired essentials.",
  metadataBase: new URL("https://gstore.example.com")
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${satoshi.variable} ${clash.variable} bg-cloud font-sans text-ink antialiased`}>
        <Providers>
          <div className="relative min-h-screen">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
