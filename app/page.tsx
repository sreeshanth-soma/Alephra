"use client";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { LampDemo } from "@/components/ui/lamp";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Brain, Database, Languages, Shield, Zap } from "lucide-react";
import RadialOrbitalTimelineDemo from "@/components/RadialOrbitalTimelineDemo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <>
      <LampDemo />
      <div className="flex flex-col overflow-hidden pb-24 pt-2 bg-black">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-white">
                Unleash the power of <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                  Data Driven Diagnosis
                </span>
              </h1>
              {/* Buttons moved below the image */}
            </>
          }
        >
          <Image
            src="/landing-hero.jpg"
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
            priority
          />
        </ContainerScroll>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="h-11 rounded-xl bg-black text-white dark:bg-white dark:text-black px-5 w-full sm:w-auto">Go to Dashboard</Button>
          </Link>
          <Link href="/analysis">
            <Button variant="secondary" className="h-11 rounded-xl px-5 w-full sm:w-auto">Go to Analysis</Button>
          </Link>
          <Link href="/voice">
            <Button variant="outline" className="h-11 rounded-xl px-5 w-full sm:w-auto">Voice Assistant</Button>
          </Link>
        </div>
      </div>

      {/* Interactive Features Timeline */}
      <div className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2 text-sm font-medium">
              <Brain className="w-4 h-4 mr-2" />
              Interactive Feature Timeline
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-2">
              Explore MedScan's Capabilities
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Click on any feature to discover how MedScan's AI-powered healthcare technology works together to provide comprehensive medical assistance.
            </p>
          </div>

          {/* Radial Orbital Timeline */}
          <div className="-mt-8">
            <RadialOrbitalTimelineDemo.RadialOrbitalTimelineDemo />
          </div>

          {/* Feature Cards Grid - Hidden for now */}
          <div className="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Vector Database Intelligence */}
            <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">
                  Vector Database Intelligence
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Powered by advanced embeddings and Pinecone vector database for context-aware medical insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Semantic search through medical data
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Context-aware clinical findings
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Personalized medical recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multi-Language Support */}
            <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Languages className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">
                  Multi-Language Support
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Speak naturally in 10+ Indian languages with intelligent speech recognition and synthesis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">English</Badge>
                  <Badge variant="secondary" className="text-xs">Hindi</Badge>
                  <Badge variant="secondary" className="text-xs">Tamil</Badge>
                  <Badge variant="secondary" className="text-xs">Bengali</Badge>
                  <Badge variant="secondary" className="text-xs">Telugu</Badge>
                  <Badge variant="secondary" className="text-xs">+5 more</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced Sarvam AI technology for accurate speech-to-text and natural voice synthesis
                </p>
              </CardContent>
            </Card>

            {/* AI-Powered Analysis */}
            <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">
                  AI-Powered Analysis
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Google Gemini AI provides intelligent medical insights and personalized health guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                    Medical report interpretation
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                    Symptom analysis and guidance
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                    Treatment recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Real-time Processing */}
            <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">
                  Real-time Processing
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Instant speech recognition, AI analysis, and voice synthesis for seamless conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></div>
                    Sub-second response times
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></div>
                    Continuous conversation flow
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></div>
                    Adaptive learning from context
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">
                  Privacy & Security
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your medical data is protected with enterprise-grade security and privacy measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                    End-to-end encryption
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                    HIPAA compliant processing
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                    Local data storage options
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Seamless Integration */}
            <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">
                  Seamless Integration
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Works seamlessly with your existing medical reports and prescription history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3"></div>
                    Automatic report analysis
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3"></div>
                    Prescription history access
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3"></div>
                    Dashboard synchronization
                  </li>
                </ul>
              </CardContent>
            </Card>
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
    </>
  );
}
