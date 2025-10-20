"use client";

import React from "react";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function GlowingEffectDemoSecond() {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-4">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Search className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="AI Medical Search"
        description="Clinically-verified answers, tailored to your history—delivered in seconds."
        points={[
          "Semantic search across your records and reports",
          "Cited sources and guideline snippets",
          "Ask follow‑ups in plain language",
        ]}
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Box className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="Report Upload & Extract"
        description="Drag, drop, done — values parsed, trends detected, risks highlighted."
        points={[
          "Auto‑detect lab panels, units, and reference ranges",
          "Flag out‑of‑range and critical values",
          "Track trends across visits",
        ]}
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="AI Health Insights"
        description="Clear, doctor-style explanations with next best actions you can trust."
        points={[
          "Plain‑English interpretations for each abnormal finding",
          "Actionable next steps and clinician talking points",
          "Links to trustworthy references",
        ]}
        center
        tall
        minH="min-h-[38rem] md:min-h-[38rem]"
      />

      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Settings className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="Voice Assistant"
        description="Speak naturally — Alephra listens, understands, and acts across features."
        points={[
          "10+ languages with natural TTS",
          "Dictate symptoms, commands, and questions",
          "Set reminders hands‑free",
        ]}
      />

      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Lock className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="Privacy‑First by Design"
        description="Healthcare‑grade security, full transparency, and total control over your data."
        points={[
          "Local‑first options where possible",
          "Granular sharing and export controls",
          "Transparent logs and easy deletions",
        ]}
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  points?: string[];
  center?: boolean;
  tall?: boolean;
  minH?: string;
}

const GridItem = ({ area, icon, title, description, points, center, tall, minH }: GridItemProps) => {
  return (
    <li className={`list-none ${area} ${minH ? minH : tall ? "min-h-[28rem]" : "min-h-[14rem]"}`}>
      <div className={`relative rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-2 md:rounded-3xl md:p-3 dark:border-white/10 dark:bg-black/50 dark:backdrop-blur-sm ${minH ? minH : tall ? "min-h-[28rem]" : ""}`}>
        <GlowingEffect
          blur={0}
          borderWidth={4}
          spread={120}
          glow={true}
          disabled={false}
          proximity={80}
          inactiveZone={0.005}
        />
        <div className={`border-0.75 relative z-[1] flex flex-col ${center ? "justify-center" : "justify-between"} gap-6 rounded-xl p-6 md:p-6 h-full ${minH ? minH : ""}`}>
          <div className={`relative flex flex-col ${center ? "justify-center" : "justify-between"} gap-3`}>
            <div className="w-fit rounded-lg border border-gray-200 bg-white/60 backdrop-blur-sm p-2 dark:border-gray-600 dark:bg-black/30 dark:backdrop-blur-sm">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-gray-900 md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-gray-600 md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
              {points && points.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {points.map((p, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-black dark:bg-white"></span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default GlowingEffectDemoSecond;


