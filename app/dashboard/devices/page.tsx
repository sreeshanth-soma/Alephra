/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const devices = [
  { name: "Smart BP Monitor", status: "Online", color: "text-emerald-600" },
  { name: "Pulse Oximeter", status: "Online", color: "text-emerald-600" },
  { name: "Glucose Tracker", status: "Offline", color: "text-red-500" },
];

export default function DevicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Connected Devices</h1>
          <Link href="/dashboard" className="text-sm text-cyan-600">← Back to dashboard</Link>
        </div>
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="space-y-3 text-sm">
              {devices.map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3 text-black dark:text-white">
                  <span>{d.name}</span>
                  <span className={d.color}>{d.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


