/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
// import { Toaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";
import { Analytics } from "@vercel/analytics/next";

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
  title: "MedScan",
  description: "AI-powered medical report analysis and insights",
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
            enableSystem={false}
            disableTransitionOnChange
          >
            <Navbar />
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
