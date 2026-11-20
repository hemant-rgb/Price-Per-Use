import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PricePerUse — Value & Cost-Per-Use Calculator",
  description:
    "Evaluate whether a product is genuinely worth buying by calculating its real cost per use, monthly/yearly ownership cost, and long-term break-even value.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F6F9FC] text-[#0A2540] antialiased selection:bg-[#635BFF]/10 selection:text-[#635BFF]">
        {children}
      </body>
    </html>
  );
}
