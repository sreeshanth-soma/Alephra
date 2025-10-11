/* eslint-disable react/no-unescaped-entities */

"use client";

import { Calendar, Code, FileText, User, Clock, Brain, Mic, Database } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const medicalFeaturesData = [
  {
    id: 1,
    title: "1) Upload",
    date: "Step",
    content: "Drop a PDF or image. We securely extract values, units, and reference ranges.",
    category: "Flow",
    icon: Brain,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "2) Structure",
    date: "Step",
    content: "We normalize test names, map to concepts, and track your history over time.",
    category: "Flow",
    icon: Mic,
    relatedIds: [1, 4],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "3) Analyze",
    date: "Step",
    content: "Gemini reviews out-of-range values, symptoms, and guidelines to draft insights.",
    category: "Flow",
    icon: Database,
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "4) Verify",
    date: "Step",
    content: "We explain reasoning in plain language and cite where interpretations come from.",
    category: "Flow",
    icon: FileText,
    relatedIds: [2, 6],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 5,
    title: "5) Act",
    date: "Step",
    content: "Set reminders, talk to the voice agent, or share a summary with your clinician.",
    category: "Flow",
    icon: Calendar,
    relatedIds: [3, 6],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 6,
    title: "6) Learn",
    date: "Step",
    content: "Over time MedScan learns your baselines to reduce noise and surface what matters.",
    category: "Flow",
    icon: Clock,
    relatedIds: [4, 5],
    status: "pending" as const,
    energy: 30,
  },
];

export function RadialOrbitalTimelineDemo() {
  return (
    <>
      <RadialOrbitalTimeline timelineData={medicalFeaturesData} />
    </>
  );
}

const RadialOrbitalTimelineDemoComponent = {
  RadialOrbitalTimelineDemo,
};

export default RadialOrbitalTimelineDemoComponent;
