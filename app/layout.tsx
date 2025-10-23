/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
// import { Toaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";
import SessionWrapper from "@/components/SessionWrapper";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { FEATURE_FLAGS } from "./feature-flags";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Alephra",
  description: "AI-powered medical report analysis and insights",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "any" },
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    apple: [
      { url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
    shortcut: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${playfair.variable} font-sans`}>
        <SessionWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange={false}
          >
            <Navbar />
            <TooltipProvider>{children}</TooltipProvider>
            {FEATURE_FLAGS.MOBILE_BOTTOM_NAV && <MobileBottomNav />}
            {FEATURE_FLAGS.OFFLINE_INDICATOR && <OfflineIndicator />}
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
