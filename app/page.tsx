/* eslint-disable react/no-unescaped-entities */
"use client";
// Static-friendly: avoid session fetch on first paint
import React from "react";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Brain } from "lucide-react";
import { InfiniteMovingCardsDemo } from "@/components/InfiniteMovingCardsDemo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlowingEffectDemoSecond } from "@/components/GlowingEffectDemoSecond";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { HoverButton } from "@/components/ui/hover-button";
// import { useSession } from "next-auth/react";
import Waves from "@/components/Waves";

export default function Home() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const currentTheme = mounted ? (resolvedTheme || theme) : "light";
  
  return (
    <>
      {/* Fixed background with Waves animation */}
      <div className="fixed inset-0 z-0 bg-white dark:bg-black">
        <Waves
          lineColor={currentTheme === "dark" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.25)"}
          backgroundColor="transparent"
          cursorDotColor="transparent"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={100}
          xGap={12}
          yGap={36}
        />
      </div>
      
      <div className="relative min-h-screen z-10">
        {/* Hero Section */}
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[12rem] xl:text-[14rem] font-extrabold tracking-tight text-black dark:text-white mb-6 sm:mb-8">
              Alephra
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
              }}
              className="text-base sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl text-black dark:text-gray-200 font-medium tracking-wide max-w-5xl mx-auto px-4"
            >
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/70 dark:bg-black/70 backdrop-blur-md border-2 border-blue-300/30 dark:border-blue-500/30 shadow-xl shadow-blue-500/10 whitespace-nowrap text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl">
                Where care meets technology
              </span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.8,
              }}
              className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl text-black dark:text-gray-300 font-normal mt-4 sm:mt-6 max-w-4xl mx-auto leading-relaxed px-4"
            >
              RAG-driven healthcare intelligence with a conversational voice interface
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.1,
                duration: 0.8,
              }}
              className="mt-8 sm:mt-12"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
                <Link href="/analysis">
                  <HoverButton className="px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 text-base sm:text-lg w-full sm:w-auto">
                    Get Started
                  </HoverButton>
                </Link>
                <button 
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 rounded-3xl text-base sm:text-lg font-medium leading-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 w-full sm:w-auto"
                >
                  Learn More
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section with Medical Assistant */}
        <div id="features" className="flex flex-col overflow-hidden pt-0 pb-16 relative z-10">
          <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white px-4">
                Your AI-Powered <br />
                <span className="relative inline-block text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold mt-2 leading-none">
                  {/* Foreground text with gradient */}
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-black dark:from-gray-300 dark:to-white">
                    Medical Assistant
                  </span>
                  {/* Shadow text below */}
                  <span 
                    className="absolute top-0 left-0 text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold leading-none -z-10 text-black dark:text-white"
                    style={{
                      transform: 'translate(1px, 3px)'
                    }}
                  >
                    Medical Assistant
                  </span>
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-800 dark:text-gray-200 mt-4 max-w-2xl mx-auto text-center px-4">
                Upload reports, ask questions, and get instant medical insights powered by advanced AI technology.
              </p>
              {/* Buttons moved below the image */}
            </>
          }
        >
          <div className="relative mx-auto rounded-2xl overflow-hidden z-10">
            {/* Desktop view - show on md and larger */}
            <div className="hidden md:block">
              <Image
                key={`desktop-${currentTheme}`}
                src={currentTheme === "dark" ? "/landing-hero-dark1.jpg" : "/landing-hero-light.jpg"}
                alt="Alephra AI Medical Assistant Dashboard"
                height={720}
                width={1400}
                className="mx-auto rounded-2xl object-cover h-full object-left-top"
                draggable={false}
                priority
                onError={(e) => {
                  // Fallback to gradient background if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-[720px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center">
                        <div class="text-center p-8">
                          <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">AI Medical Assistant</h3>
                          <p class="text-gray-600 dark:text-gray-400">Upload your medical reports and get instant AI-powered insights</p>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
            </div>
            
            {/* Mobile view - show on smaller than md */}
            <div className="block md:hidden w-full max-w-md mx-auto">
              <Image
                key={`mobile-${currentTheme}`}
                src={currentTheme === "dark" ? "/mobile-screen-dark.png" : "/mobile-screen-light.png"}
                alt="Alephra Mobile App"
                height={800}
                width={400}
                className="mx-auto rounded-2xl object-contain w-full h-auto"
                draggable={false}
                priority
              />
            </div>
          </div>
        </ContainerScroll>
        </div>

        {/* How Alephra Works Section */}
        <div className="py-20 px-4 relative z-30">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-sm font-medium">
                <Brain className="w-4 h-4 mr-2" />
                How Alephra Works
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4 px-4">
                A simple flow from report to recommendations
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed px-4">
                Follow the steps to see how uploads become structured data, AI insights, and actions you can take.
              </p>
            </div>

            {/* Infinite Moving Cards Timeline */}
            <div className="mt-16 mb-20">
              <InfiniteMovingCardsDemo />
            </div>
          </div>
        </div>

        {/* Capabilities Section */}
        <div className="py-20 px-4 relative z-30">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-sm font-medium">
                What you can do
              </Badge>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4 px-4">
                Explore Alephra's Capabilities
              </h3>
            </div>

            {/* Feature Cards Grid */}
            <div className="mb-16">
              <GlowingEffectDemoSecond />
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="py-24 px-4 relative z-30">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-6 px-4">
              Ready to Experience AI-Powered Healthcare?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              Start a conversation with your intelligent medical assistant. Ask questions about your health, 
              get insights from your reports, and receive personalized guidance in your preferred language.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
              <Link href="/voice">
                <Button className="h-12 sm:h-14 rounded-xl bg-black text-white dark:bg-white dark:text-black px-6 sm:px-10 text-base sm:text-lg font-semibold hover:scale-105 transition-transform duration-200 w-full sm:w-auto">
                  <Mic className="w-5 h-5 mr-2" />
                  Try Voice Assistant
                </Button>
              </Link>
              <Link href="/analysis">
                <Button variant="outline" className="h-12 sm:h-14 rounded-xl px-6 sm:px-10 text-base sm:text-lg font-semibold hover:scale-105 transition-transform duration-200 w-full sm:w-auto">
                  Upload Medical Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
