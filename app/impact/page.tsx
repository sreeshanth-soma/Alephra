"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Heart, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10" />
          <Image
            src="/elderly_confusion.png"
            alt="Elderly man confused by medical report"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Healthcare Shouldn&apos;t Be <br />
              <span className="text-red-500">A Struggle.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            For millions of elderly patients, a simple medical report is a source of anxiety, confusion, and helplessness.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="animate-bounce mt-10">
              <span className="text-gray-400 text-sm uppercase tracking-widest">Scroll to see the change</span>
              <div className="w-px h-16 bg-gradient-to-b from-gray-400 to-transparent mx-auto mt-4" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-100">The Fear of the Unknown</h2>
            <div className="space-y-6 text-lg text-gray-400">
              <p>
                For 600 million Indians, a medical report isn&apos;t just data. It&apos;s a wall.
                A wall between them and their health. Between them and their peace of mind.
              </p>
              <p>
                <strong className="text-white">It&apos;s the shame of asking for help to read a prescription.</strong> 
                It&apos;s the silent anxiety of taking a pill and wondering, <em className="text-gray-500">&quot;Is this the right one?&quot;</em>
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <h3 className="text-3xl font-bold text-red-400 mb-1">600M+</h3>
                <p className="text-sm text-gray-500">Indians face a language barrier in healthcare</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <h3 className="text-3xl font-bold text-red-400 mb-1">Silence</h3>
                <p className="text-sm text-gray-500">The sound of unanswered medical questions</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          >
             {/* Reusing the confusion image for now, focusing on the report */}
            <Image
              src="/elderly_confusion.png"
              alt="Confusion with medical reports"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 p-4 rounded-xl">
                <p className="text-red-200 italic">&quot;I feel like a burden to my children...&quot;</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-indigo-950 to-black relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/20 order-2 md:order-1"
          >
            {/* Placeholder for the happy image - using a gradient fallback for now if image is missing */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-blue-900" />
            <Image
              src="/elderly_happy.png" 
              alt="Happy elderly man with tablet"
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback if image doesn't exist yet
                e.currentTarget.style.display = 'none';
              }}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
             <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 p-4 rounded-xl">
                <p className="text-indigo-200 italic">&quot;It speaks my language. It understands me.&quot;</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 md:order-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-400 w-6 h-6" />
              <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">The Alephra Promise</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Dignity Restored. <br />
              <span className="text-indigo-400">Independence Reclaimed.</span>
            </h2>
            <div className="space-y-6 text-lg text-gray-300">
              <p>
                MedScan doesn&apos;t just translate words; it translates care. It gives our elders the power to understand their own health, 
                in their own voice, on their own terms.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start gap-3">
                  <div className="bg-green-500/20 p-2 rounded-full mt-1">
                    <Heart className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <strong className="block text-white">A 24/7 Companion</strong>
                    <span className="text-sm">Always there to answer, explain, and reassure.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-full mt-1">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <strong className="block text-white">Language No Barrier</strong>
                    <span className="text-sm">Medical advice in the language of their heart.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-10">
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-indigo-600/25"
              >
                See the Impact <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Quote */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl md:text-3xl font-serif italic text-gray-400 max-w-4xl mx-auto leading-relaxed">
            &quot;We are not just processing data. We are giving our elders their dignity back.&quot;
          </h3>
          <p className="mt-6 text-gray-600">- The Alephra Mission</p>
        </motion.div>
      </section>
    </div>
  );
}
