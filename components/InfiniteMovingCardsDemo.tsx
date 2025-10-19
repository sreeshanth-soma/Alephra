"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const medicalStepsData = [
  {
    quote: "Drop a PDF or image. We securely extract values, units, and reference ranges from your medical reports using advanced AI technology.",
    name: "Step 1",
    title: "Upload Report",
  },
  {
    quote: "We normalize test names, map to medical concepts, and track your health history over time for comprehensive analysis.",
    name: "Step 2",
    title: "Structure Data",
  },
  {
    quote: "Gemini AI reviews out-of-range values, symptoms, and medical guidelines to draft personalized insights for you.",
    name: "Step 3",
    title: "AI Analysis",
  },
  {
    quote: "We explain reasoning in plain language and cite where medical interpretations come from for transparency.",
    name: "Step 4",
    title: "Verify Results",
  },
  {
    quote: "Set reminders in the dashboard, speak with the voice assistant, or share a summary with your clinician for follow-up care.",
    name: "Step 5",
    title: "Take Action",
  },
  {
    quote: "Over time MedScan learns your health baselines to reduce noise and surface what matters most to you.",
    name: "Step 6",
    title: "Learn & Improve",
  },
];

export function InfiniteMovingCardsDemo() {
  return (
    <div className="w-full pb-20 pt-12">
      <InfiniteMovingCards
        items={medicalStepsData}
        direction="left"
        speed="slow"
        pauseOnHover={true}
        className="w-full"
      />
    </div>
  );
}

