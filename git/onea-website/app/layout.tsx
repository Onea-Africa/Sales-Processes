import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Onea Africa — Connectivity, Digital Growth & Communications",
  description:
    "One partner for fibre internet, digital marketing, and corporate communications across South Africa. Openserve Certified · B-BBEE Level 1.",
  openGraph: {
    title: "Onea Africa",
    description: "One Partner For Connectivity, Digital Growth & Communications.",
    siteName: "Onea Africa",
    locale: "en_ZA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
