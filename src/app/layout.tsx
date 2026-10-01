import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GAVEN — A Private Archive of Things I Never Said",
  description: "A digital sanctuary for personal memories, poems, diaries, and unsent letters.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${mono.variable} h-full dark`}
    >
      <body className="min-h-full bg-[#0D0D0D] text-[#F2F0EA] antialiased selection:bg-[#C8A96B] selection:text-[#0D0D0D]">
        {children}
      </body>
    </html>
  );
}
