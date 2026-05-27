import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Serif_SC } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, websiteSchema } from "@/lib/seo/schema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = buildPageMetadata({
  title: "AI I Ching Oracle — Ancient Wisdom, Modern Insight",
  description:
    "Consult the I Ching with AI interpretation. Explore 64 hexagrams, public oracle readings, and mystical guidance for love, career, and spiritual growth.",
  path: "/",
  keywords: [
    "i ching",
    "iching oracle",
    "hexagram meaning",
    "ai divination",
    "book of changes",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zen-bg text-foreground">
        <JsonLd data={websiteSchema()} />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
