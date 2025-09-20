/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const labsData = [
  { name: "Glucose", value: 110 },
  { name: "HDL", value: 45 },
  { name: "LDL", value: 120 },
  { name: "Trig", value: 160 },
];

export default function LabsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Labs</h1>
          <Link href="/dashboard" className="text-sm text-cyan-600">← Back to dashboard</Link>
        </div>
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2 text-black dark:text-white">Lipid Profile</div>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={labsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


