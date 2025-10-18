/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Brain } from "lucide-react";
import RadialOrbitalTimelineDemo from "@/components/RadialOrbitalTimelineDemo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlowingEffectDemoSecond } from "@/components/GlowingEffectDemoSecond";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

// Dynamic import to prevent SSR issues with Three.js/WebGL
const Dither = dynamic(() => import("@/components/Dither"), { ssr: false });

export default function Home() {
  const { theme } = useTheme();
  
  return (
    <>
      {/* Fixed background that covers entire viewport */}
      <div className="fixed inset-0 z-0 bg-white dark:bg-black">
        <Dither
          waveColor={theme === "dark" ? [0.5, 0.5, 0.5] : [0.2, 0.2, 0.2]}
          backgroundColor={theme === "dark" ? [0, 0, 0] : [1, 1, 1]}
          invertColors={false}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>
      
      <div className="relative min-h-screen z-10">
        {/* Hero Section */}
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
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
            <h1 className="text-8xl md:text-[12rem] lg:text-[14rem] font-extrabold tracking-tight text-black dark:text-white mb-8">
              MedScan
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
              }}
              className="text-2xl md:text-4xl lg:text-5xl text-black dark:text-gray-200 font-medium tracking-wide max-w-5xl mx-auto"
            >
              Where care meets technology
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.8,
              }}
              className="text-lg md:text-2xl lg:text-3xl text-black dark:text-gray-300 font-normal mt-6 max-w-4xl mx-auto leading-relaxed"
            >
              RAG-driven healthcare intelligence with a conversational voice interface
            </motion.p>
          </motion.div>
        </div>

        <div className="flex flex-col overflow-hidden pb-24 pt-0 relative z-10">
          <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white">
                Your AI-Powered <br />
                <span className="text-5xl md:text-7xl lg:text-8xl font-extrabold mt-2 leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-400 dark:from-cyan-300 dark:to-pink-400 from-blue-600 to-purple-600 drop-shadow-lg">
                  Medical Assistant
                </span>
              </h1>
              <p className="text-lg text-gray-800 dark:text-gray-200 mt-4 max-w-2xl mx-auto text-center">
                Upload reports, ask questions, and get instant medical insights powered by advanced AI technology.
              </p>
              {/* Buttons moved below the image */}
            </>
          }
        >
          <div className="relative mx-auto rounded-2xl overflow-hidden z-10">
          <Image
            src={theme === "dark" ? "/landing-hero-dark1.jpg" : "/landing-hero-light.jpg"}
              alt="MedScan AI Medical Assistant Dashboard"
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
        </ContainerScroll>
        </div>

        {/* Interactive Features Timeline */}
        <div className="py-24 px-4 relative z-30">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - How MedScan Works */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2 text-sm font-medium">
              <Brain className="w-4 h-4 mr-2" />
              How MedScan Works
            </Badge>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-2">
              A simple flow from report to recommendations
            </h2>
            <p className="text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto">
              Follow the steps to see how uploads become structured data, AI insights, and actions you can take.
            </p>
          </div>

          {/* Radial Orbital Timeline */}
          <div className="mt-1">
            <RadialOrbitalTimelineDemo.RadialOrbitalTimelineDemo />
          </div>

          {/* Features Subheader - What you can do */}
          <div className="text-center mt-16 mb-6">
            <Badge variant="outline" className="mb-2 text-sm font-medium">
              What you can do
            </Badge>
            <h3 className="text-2xl font-bold text-black dark:text-white">
              Explore MedScan's Capabilities
                </h3>
            </div>

          {/* Feature Cards Grid - replaced with themed glowing cards */}
          <div className="mb-16">
            <GlowingEffectDemoSecond />
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
              Ready to Experience AI-Powered Healthcare?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Start a conversation with your intelligent medical assistant. Ask questions about your health, 
              get insights from your reports, and receive personalized guidance in your preferred language.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/voice">
                <Button className="h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black px-8 text-lg font-semibold">
                  <Mic className="w-5 h-5 mr-2" />
                  Try Voice Assistant
                </Button>
              </Link>
              <Link href="/analysis">
                <Button variant="outline" className="h-12 rounded-xl px-8 text-lg font-semibold">
                  Upload Medical Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
