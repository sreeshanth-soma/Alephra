"use client";

import React from "react";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  tags?: string[];
  center?: boolean;
  tall?: boolean;
  minH?: string;
}

const GridItem = ({ area, icon, title, description, tags, center, tall, minH }: GridItemProps) => {
  return (
    <li className={`list-none ${area} ${minH ? minH : tall ? "min-h-[20rem] md:min-h-[28rem]" : "min-h-[12rem] md:min-h-[14rem]"}`}>
      <div className={`relative rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-2 md:rounded-2xl lg:rounded-3xl md:p-3 dark:border-white/10 dark:bg-black/50 dark:backdrop-blur-sm ${minH ? minH : tall ? "min-h-[20rem] md:min-h-[28rem]" : ""}`}>
        <GlowingEffect
          blur={0}
          borderWidth={2}
          spread={80}
          glow={false}
          disabled={false}
          proximity={60}
          inactiveZone={0.005}
        />
        <div className={`border-0.75 relative z-[1] flex flex-col ${center ? "justify-center" : "justify-between"} gap-4 md:gap-6 rounded-lg md:rounded-xl p-4 sm:p-6 md:p-7 lg:p-8 h-full ${minH ? minH : ""}`}>
          <div className={`relative flex flex-col ${center ? "justify-center" : "justify-between"} gap-3 md:gap-4`}>
            <div className="w-fit rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm p-2 md:p-3 dark:border-gray-600 dark:from-gray-800/50 dark:to-gray-900/50 dark:backdrop-blur-sm shadow-sm">
              {icon}
            </div>
            <div className="space-y-2 md:space-y-3.5">
              <h3 className="-tracking-4 pt-0.5 font-sans text-lg sm:text-xl md:text-2xl font-bold text-balance text-gray-900 dark:text-white leading-tight">
                {title}
              </h3>
              <h2 className="font-sans text-xs sm:text-sm md:text-base text-gray-600 dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold leading-relaxed">
                {description}
              </h2>
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-5">
                  {tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-md text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export function GlowingEffectDemoSecond() {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 auto-rows-auto md:auto-rows-fr">
      {/* Left Column - Top */}
      <GridItem
        area=""
        icon={<Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        title="AI Medical Search"
        description="Ask questions in plain language. Get instant, verified answers from your health records."
        tags={["🔍 Semantic Search", "📚 Cited Sources", "💬 Natural Chat"]}
      />

      {/* Middle - Tall Card (spans 2 rows) */}
      <GridItem
        area="md:row-span-2"
        icon={<Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        title="AI Health Insights"
        description="Doctor-style explanations in simple English. Know what your results mean and what to do next."
        tags={["✨ Plain Explanations", "✅ Next Steps", "🔗 Trusted Sources"]}
        center
        tall
        minH="min-h-[24rem] sm:min-h-[28rem] md:min-h-[670px]"
      />

      {/* Right Column - Top */}
      <GridItem
        area=""
        icon={<Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        title="Voice Assistant"
        description="Talk to Alephra like a real assistant. No typing needed."
        tags={["🌍 10+ Languages", "🎤 Voice Commands", "⏰ Set Reminders"]}
      />

      {/* Left Column - Bottom */}
      <GridItem
        area=""
        icon={<Box className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        title="Smart Report Analysis"
        description="Upload any medical report. We extract key values and highlight what matters."
        tags={["📊 Auto-Extract", "⚠️ Flag Risks", "📈 Track Trends"]}
      />

      {/* Right Column - Bottom */}
      <GridItem
        area=""
        icon={<Lock className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        title="Privacy-First"
        description="Your data stays yours. Healthcare-grade security with full control."
        tags={["🔒 Secure Storage", "🎯 Your Control", "🗑️ Easy Deletion"]}
      />
    </ul>
  );
}

export default GlowingEffectDemoSecond;
