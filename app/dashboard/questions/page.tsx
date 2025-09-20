/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const items = [
  "What tests should I do next?",
  "Any medicine interactions?",
  "Diet and activity tips?",
];

export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Important Questions</h1>
          <Link href="/dashboard" className="text-sm text-cyan-600">← Back to dashboard</Link>
        </div>
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-black dark:text-white">Ask your clinician</div>
              <Badge variant="secondary">Guide</Badge>
            </div>
            <ul className="space-y-2 text-sm text-black dark:text-white">
              {items.map((q, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  {q} <span className="text-xs text-gray-500">Add</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


