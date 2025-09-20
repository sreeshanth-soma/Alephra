/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const timeline = [
  { time: "09:00", event: "Took meds" },
  { time: "11:30", event: "Light meal" },
  { time: "13:00", event: "Vitals recorded" },
  { time: "16:00", event: "Walked 2km" },
];

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="space-y-4">
              {timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <div className="text-sm text-black dark:text-white">{t.time} — {t.event}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


