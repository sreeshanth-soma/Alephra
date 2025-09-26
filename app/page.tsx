/* eslint-disable react/no-unescaped-entities */
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
      <div className="flex flex-col overflow-hidden pb-24 pt-0 bg-white dark:bg-black">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-black dark:text-white">
                Your AI-Powered <br />
                <span className="text-4xl md:text-[4rem] font-bold mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Medical Assistant
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto text-center">
                Upload reports, ask questions, and get instant medical insights powered by advanced AI technology.
              </p>
              {/* Buttons moved below the image */}
            </>
          }
        >
          <div className="relative mx-auto rounded-2xl overflow-hidden">
          <Image
            src="/landing-hero.jpg"
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
      <div className="py-24 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2 text-sm font-medium">
              <Brain className="w-4 h-4 mr-2" />
              Interactive Feature Timeline
            </Badge>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-2">
              Explore MedScan's Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Click on any feature to discover how MedScan's AI-powered healthcare technology works together to provide comprehensive medical assistance.
            </p>
          </div>

          {/* Radial Orbital Timeline */}
          <div className="mt-1">
            <RadialOrbitalTimelineDemo.RadialOrbitalTimelineDemo />
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Smart Medical Search */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Smart Medical Search
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Find relevant medical information instantly with AI-powered search that understands context
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3"></div>
                    Search through your medical history
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3"></div>
                    Find relevant health information
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3"></div>
                    Get personalized health insights
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Language Support */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Languages className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Multi-Language Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Speak naturally in 10+ Indian languages with intelligent speech recognition and synthesis
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">Telugu</span>
                  <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">English</span>
                  <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">Hindi</span>
                  <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">Tamil</span>
                  <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">Bengali</span>
                  <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">+5 more</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Advanced Sarvam AI technology for accurate speech-to-text and natural voice synthesis
                </p>
              </div>
            </div>

            {/* AI-Powered Analysis */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Google Gemini AI provides intelligent medical insights and personalized health guidance
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mr-3"></div>
                    Medical report interpretation
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mr-3"></div>
                    Symptom analysis and guidance
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mr-3"></div>
                    Treatment recommendations
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Processing */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Real-time Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Instant speech recognition, AI analysis, and voice synthesis for seamless conversations
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mr-3"></div>
                    Sub-second response times
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mr-3"></div>
                    Continuous conversation flow
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mr-3"></div>
                    Adaptive learning from context
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Privacy & Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Your medical data is protected with enterprise-grade security and privacy measures
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mr-3"></div>
                    End-to-end encryption
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mr-3"></div>
                    HIPAA compliant processing
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mr-3"></div>
                    Local data storage options
                  </div>
                </div>
              </div>
            </div>

            {/* Seamless Integration */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900/20 dark:to-teal-900/20 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Seamless Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Works seamlessly with your existing medical reports and prescription history
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full mr-3"></div>
                    Automatic report analysis
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full mr-3"></div>
                    Prescription history access
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full mr-3"></div>
                    Dashboard synchronization
                  </div>
                </div>
              </div>
            </div>
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
