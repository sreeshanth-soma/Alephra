"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const medicalStepsData = [
  {
    quote: "Upload any medical report. AI extracts all values instantly.",
    name: "Step 1",
    title: "Upload Report",
  },
  {
    quote: "Your data organized. History tracked automatically.",
    name: "Step 2",
    title: "Structure Data",
  },
  {
    quote: "AI reviews your results against medical guidelines.",
    name: "Step 3",
    title: "AI Analysis",
  },
  {
    quote: "Clear explanations with trusted medical sources.",
    name: "Step 4",
    title: "Verify Results",
  },
  {
    quote: "Set reminders, chat with voice AI, or share with doctors.",
    name: "Step 5",
    title: "Take Action",
  },
  {
    quote: "Learns your health patterns. Shows what matters.",
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

