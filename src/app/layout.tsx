import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/web3-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TLOOT - GameFi Social Ticketing Platform",
  description: "Pool funds, play games, and access premium event tickets with reduced costs. Built on Mantle Network.",
  keywords: ["tickets", "events", "gamefi", "web3", "mantle", "blockchain"],
  openGraph: {
    title: "TLOOT",
    description: "Transform event ticketing into a GameFi-powered social experience",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          backgroundColor: "#ffffff",
          color: "#000000",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <Web3Provider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
          <Toaster theme="light" position="top-right" />
        </Web3Provider>
      </body>
    </html>
  );
}
