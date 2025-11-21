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
    if (score >= 90) return "bg-green-50 dark:bg-green-950";
    if (score >= 70) return "bg-yellow-50 dark:bg-yellow-950";
    return "bg-red-50 dark:bg-red-950";
  };

  const getMetricCardBgColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-white dark:bg-zinc-900";
      case "warning": return "bg-white dark:bg-zinc-900";
      case "critical": return "bg-white dark:bg-zinc-900";
      default: return "bg-white dark:bg-black";
    }
  };

  const getMetricCardBorderColor = (status: string) => {
    switch (status) {
      case "normal": return "border-green-500";
      case "warning": return "border-yellow-500";
      case "critical": return "border-red-500";
      default: return "border-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
  case "normal": return "bg-emerald-600 dark:bg-emerald-400 text-white dark:text-black";
      case "warning": return "bg-yellow-600 dark:bg-yellow-400 text-white dark:text-black";
      case "critical": return "bg-red-600 dark:bg-red-400 text-white dark:text-black";
      default: return "bg-black dark:bg-white text-white dark:text-black";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-black dark:text-white" strokeWidth={2.5} />;
      case "down": return <TrendingDown className="w-4 h-4 text-black dark:text-white" strokeWidth={2.5} />;
      case "stable": return <Minus className="w-4 h-4 text-black dark:text-white" strokeWidth={2.5} />;
      default: return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Health Score */}
      <div className={`relative overflow-hidden rounded-xl border-4 ${overallScore >= 90 ? 'border-green-500' : overallScore >= 70 ? 'border-yellow-500' : 'border-red-500'} ${getScoreBgColor(overallScore)} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]`}>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-lg border-2 border-black dark:border-white flex items-center justify-center ${overallScore >= 90 ? 'bg-green-600 dark:bg-green-400' : overallScore >= 70 ? 'bg-yellow-600 dark:bg-yellow-400' : 'bg-red-600 dark:bg-red-400'}`}>
                <Heart className="w-8 h-8 text-white dark:text-black" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold font-mono text-black dark:text-white capitalize tracking-tight">Overall health score</h3>
                <p className="text-sm font-mono text-black dark:text-white opacity-70 mt-1 capitalize">Based on latest vitals & labs</p>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className={`text-7xl font-extrabold font-mono ${overallScore >= 90 ? 'text-green-600 dark:text-green-400' : overallScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{overallScore}</span>
            <span className="text-3xl font-bold font-mono text-black dark:text-white opacity-60">/100</span>
          </div>

          <div className="mt-6 flex items-center gap-3 text-base">
            <Activity className="w-5 h-5 text-black dark:text-white" strokeWidth={2.5} />
            <span className="font-bold font-mono text-black dark:text-white capitalize">
              {overallScore >= 90 ? "Excellent health! Keep up the great work!" :
               overallScore >= 70 ? "Good health, continue monitoring trends" :
               "Attention needed - please consult your doctor"}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border-4 ${getMetricCardBgColor(metric.status)} ${getMetricCardBorderColor(metric.status)} shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold font-mono text-black dark:text-white capitalize">
                  {metric.label}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold font-mono border-2 border-black dark:border-white capitalize ${getStatusColor(metric.status)}`}>
                {metric.status === "normal" ? "Normal" :
                 metric.status === "warning" ? "Elevated" :
                 "Critical"}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold font-mono text-black dark:text-white">
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-base font-bold font-mono text-black dark:text-white opacity-60">
                  {metric.unit}
                </span>
              )}
            </div>

            {metric.trend && metric.change && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-black dark:border-white">
                {getTrendIcon(metric.trend)}
                <span className="text-xs font-bold font-mono text-black dark:text-white opacity-70 capitalize">
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

// Helper function to calculate health score from vitals and labs
export function calculateHealthScore(vitals: any[] = [], labs: any[] = []): number {
  if (vitals.length === 0 && labs.length === 0) return 95;

  const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

  const scoreVitalPoint = (point: any) => {
    let pointScore = 100;

    if (typeof point.hr === "number") {
      if (point.hr < 60 || point.hr > 100) {
        pointScore -= Math.min(15, Math.abs(point.hr - 80) * 0.3);
      }
    }

    if (typeof point.spo2 === "number") {
      if (point.spo2 < 95) {
        pointScore -= (95 - point.spo2) * 2;
      }
    }

    if (point.bp) {
      const { systolic, diastolic } = point.bp;
      if (systolic > 140 || diastolic > 90) {
        pointScore -= 10;
      } else if (systolic > 130 || diastolic > 85) {
        pointScore -= 5;
      }
    }

    if (typeof point.temperature === "number") {
      if (point.temperature > 37.5 || point.temperature < 36.1) {
        pointScore -= 5;
      }
    }

    return clampScore(pointScore);
  };

  const vitalScores = Array.isArray(vitals) ? vitals.map(scoreVitalPoint) : [];
  const averageVitalScore =
    vitalScores.length > 0
      ? vitalScores.reduce((sum, val) => sum + val, 0) / vitalScores.length
      : 100;

  let score = averageVitalScore;

  if (labs.length > 0) {
    const withinRange = (lab: any) => {
      if (!lab?.normalRange) return true;
      const { min, max } = lab.normalRange;
      if (typeof min !== "number" || typeof max !== "number") return true;
      return lab.value >= min && lab.value <= max;
    };

    const glucoseLab = labs.find((l: any) => l.name === "Glucose");
    if (glucoseLab && !withinRange(glucoseLab)) {
      score -= 5;
    }

    const hdlLab = labs.find((l: any) => l.name === "HDL");
    if (hdlLab && !withinRange(hdlLab) && hdlLab.value < hdlLab.normalRange.min) {
      score -= 3;
    }

    const ldlLab = labs.find((l: any) => l.name === "LDL");
    if (ldlLab && !withinRange(ldlLab) && ldlLab.value > ldlLab.normalRange.max) {
      score -= 3;
    }
  }

  return clampScore(score);
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
    
    // Weight
    if (latest.weight) {
      const weightTrend = previous && previous.weight ? 
        (latest.weight > previous.weight ? "up" : latest.weight < previous.weight ? "down" : "stable") : undefined;
      const weightChange = previous && previous.weight ? 
        `${Math.abs(latest.weight - previous.weight).toFixed(1)} kg vs last reading` : undefined;
      metrics.push({
        label: "Weight",
        value: latest.weight,
        unit: "kg",
        status: "normal", // Weight status is subjective, keeping it normal
        trend: weightTrend,
        change: weightChange
      });
    }
    
    // Temperature
    if (latest.temperature) {
      metrics.push({
        label: "Temperature",
        value: latest.temperature,
        unit: "°C",
        status: (latest.temperature >= 36.1 && latest.temperature <= 37.2) ? "normal" : 
                latest.temperature > 37.5 ? "warning" : "critical"
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
