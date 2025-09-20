/* eslint-disable react/no-unescaped-entities */

"use client";

import { Calendar, Code, FileText, User, Clock, Brain, Mic, Database } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const medicalFeaturesData = [
  {
    id: 1,
    title: "AI Analysis",
    date: "2025",
    content: "Advanced AI-powered medical report analysis using Google Gemini for intelligent insights and diagnosis.",
    category: "AI",
    icon: Brain,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Voice Assistant",
    date: "2025",
    content: "Multi-language voice interface with real-time speech recognition and natural language processing.",
    category: "Voice",
    icon: Mic,
    relatedIds: [1, 4],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "Vector Database",
    date: "2025",
    content: "Pinecone vector database with semantic search for context-aware medical findings and recommendations.",
    category: "Database",
    icon: Database,
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "Report Upload",
    date: "2025",
    content: "Seamless medical report upload and processing with automatic text extraction and analysis.",
    category: "Upload",
    icon: FileText,
    relatedIds: [2, 6],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 5,
    title: "Dashboard",
    date: "2025",
    content: "Comprehensive health dashboard with vitals tracking, medication management, and appointment scheduling.",
    category: "Dashboard",
    icon: Calendar,
    relatedIds: [3, 6],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 6,
    title: "Future Features",
    date: "2025",
    content: "Advanced features including predictive analytics, telemedicine integration, and personalized health plans.",
    category: "Future",
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

export default {
  RadialOrbitalTimelineDemo,
};
