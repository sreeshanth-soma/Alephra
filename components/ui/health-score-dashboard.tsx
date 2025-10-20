"use client";

import React from "react";
import { Heart, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HealthMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: "normal" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
  change?: string;
}

interface HealthScoreDashboardProps {
  overallScore: number;
  metrics: HealthMetric[];
  className?: string;
}

export function HealthScoreDashboard({ overallScore, metrics, className = "" }: HealthScoreDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600";
    if (score >= 70) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "warning": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "critical": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "stable": return <Minus className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Health Score */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br ${getScoreBgColor(overallScore)} p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold opacity-90">Overall Health Score</h3>
                <p className="text-sm opacity-75">Based on latest vitals & labs</p>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold">{overallScore}</span>
            <span className="text-2xl opacity-75">/100</span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
            <Activity className="w-4 h-4" />
            <span>
              {overallScore >= 90 ? "Excellent health!" :
               overallScore >= 70 ? "Good health, monitor trends" :
               "Attention needed - consult your doctor"}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {metric.label}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(metric.status)}`}>
                {metric.status === "normal" ? "Normal" :
                 metric.status === "warning" ? "Elevated" :
                 "Critical"}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.unit}
                </span>
              )}
            </div>

            {metric.trend && metric.change && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {getTrendIcon(metric.trend)}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {metric.change}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to calculate health score from vitals
export function calculateHealthScore(vitals: any[]): number {
  if (vitals.length === 0) return 95;
  
  const latest = vitals[vitals.length - 1];
  let score = 100;
  
  // Heart rate scoring (60-100 optimal)
  if (latest.hr) {
    if (latest.hr < 60 || latest.hr > 100) {
      score -= Math.min(15, Math.abs(latest.hr - 80) * 0.3);
    }
  }
  
  // SpO2 scoring (95%+ optimal)
  if (latest.spo2) {
    if (latest.spo2 < 95) {
      score -= (95 - latest.spo2) * 2;
    }
  }
  
  // Blood pressure scoring
  if (latest.bp) {
    const { systolic, diastolic } = latest.bp;
    if (systolic > 140 || diastolic > 90) {
      score -= 10;
    } else if (systolic > 130 || diastolic > 85) {
      score -= 5;
    }
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Helper to get health metrics from data
export function getHealthMetrics(vitals: any[], labs: any[]): HealthMetric[] {
  const metrics: HealthMetric[] = [];
  
  if (vitals.length > 0) {
    const latest = vitals[vitals.length - 1];
    const previous = vitals.length > 7 ? vitals[vitals.length - 8] : null;
    
    // Heart Rate
    if (latest.hr) {
      const hrTrend = previous ? (latest.hr > previous.hr ? "up" : latest.hr < previous.hr ? "down" : "stable") : undefined;
      const hrChange = previous ? `${Math.abs(latest.hr - previous.hr)} bpm vs last week` : undefined;
      metrics.push({
        label: "Heart Rate",
        value: latest.hr,
        unit: "bpm",
        status: (latest.hr >= 60 && latest.hr <= 100) ? "normal" : latest.hr > 100 ? "warning" : "critical",
        trend: hrTrend,
        change: hrChange
      });
    }
    
    // SpO2
    if (latest.spo2) {
      metrics.push({
        label: "Blood Oxygen",
        value: latest.spo2,
        unit: "%",
        status: latest.spo2 >= 95 ? "normal" : latest.spo2 >= 90 ? "warning" : "critical"
      });
    }
    
    // Blood Pressure
    if (latest.bp) {
      const { systolic, diastolic } = latest.bp;
      metrics.push({
        label: "Blood Pressure",
        value: `${systolic}/${diastolic}`,
        unit: "mmHg",
        status: (systolic <= 130 && diastolic <= 85) ? "normal" : (systolic <= 140 && diastolic <= 90) ? "warning" : "critical"
      });
    }
  }
  
  // Add lab metrics
  if (labs.length > 0) {
    const glucoseLab = labs.find(l => l.name === "Glucose");
    if (glucoseLab) {
      metrics.push({
        label: "Glucose",
        value: glucoseLab.value,
        unit: glucoseLab.unit,
        status: (glucoseLab.value >= glucoseLab.normalRange.min && glucoseLab.value <= glucoseLab.normalRange.max) ? "normal" : 
                glucoseLab.value > glucoseLab.normalRange.max ? "warning" : "critical"
      });
    }
  }
  
  return metrics;
}
