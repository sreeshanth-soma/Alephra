"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line } from "recharts";

const vitalsData = [
  { time: "09:00", hr: 78, spo2: 98 },
  { time: "10:00", hr: 81, spo2: 97 },
  { time: "11:00", hr: 76, spo2: 99 },
  { time: "12:00", hr: 85, spo2: 96 },
  { time: "13:00", hr: 79, spo2: 98 },
  { time: "14:00", hr: 82, spo2: 97 },
];

export default function VitalsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Vitals</h1>
          <Link href="/dashboard" className="text-sm text-cyan-600">← Back to dashboard</Link>
        </div>
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2 text-black dark:text-white">Heart Rate & SpO2</div>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vitalsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="hr" stroke="#06b6d4" fillOpacity={1} fill="url(#colorHr)" name="Heart Rate" />
                  <Line type="monotone" dataKey="spo2" stroke="#22c55e" dot={false} name="SpO2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


