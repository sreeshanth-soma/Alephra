/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import BlackTimePicker from "@/components/ui/black-time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Activity, Calendar, Filter, CalendarDays, AlertTriangle, Trash2, Clock } from "lucide-react";
import BasicModal from "@/components/ui/modal";
import { Noise } from "@/components/ui/noise";
import { useSession } from "next-auth/react";
import { SignInPromptModal } from "@/components/ui/signin-prompt-modal";
import { safeGetItem, safeSetItem, safeRemoveItem, clearAllAlephraData, isLocalStorageAvailable } from "@/lib/localStorage";
import { toast } from "@/components/ui/use-toast";
import { PrescriptionRecord, prescriptionStorage } from "@/lib/prescription-storage";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { TimeRangeSelector, TimeRange, filterDataByRange } from "@/components/ui/time-range-selector";
import { ExportButton } from "@/components/ui/export-button";
import { HealthScoreDashboard, calculateHealthScore, getHealthMetrics } from "@/components/ui/health-score-dashboard";
import { 
  exportVitalsToCSV, 
  exportLabsToCSV, 
  exportRemindersToCSV, 
  exportAppointmentsToCSV,
  exportHealthSummary,
  exportToPDF
} from "@/lib/export-utils";
import { 
  loadVitalsHybrid, 
  loadLabsHybrid,
  saveVitalToServer,
  saveLabToServer,
  deleteLabFromServer 
} from "@/lib/data-sync";
import { OnboardingTour } from "@/components/ui/onboarding-tour";
import { onboardingSteps } from "@/app/onboarding-config";
import { devLog } from "@/lib/dev-logger";
// Removed dropdown menu in Appointments to keep a single add button

type VitalsPoint = { time: string; hr: number; spo2: number; date: string; bp?: { systolic: number; diastolic: number }; weight?: number; temperature?: number };

type LabData = { 
  id: string; 
  name: string; 
  value: number; 
  unit: string; 
  date: string; 
  normalRange: { min: number; max: number }; 
  category: string;
};

const meds = [
  { name: "Abciximab", dose: "250 mg", freq: "OD" },
  { name: "Vomilast", dose: "8 mg", freq: "BD" },
  { name: "Zoclar 500", dose: "500 mg", freq: "OD" },
  { name: "Gestakind 10/SR", dose: "10 mg", freq: "HS" },
];

const timeline = [
  { time: "09:00", event: "Took meds" },
  { time: "11:30", event: "Light meal" },
  { time: "13:00", event: "Vitals recorded" },
  { time: "16:00", event: "Walked 2km" },
];

const medicineCategories = [
  {
    name: "Pain Relief",
    icon: "💊",
    medicines: [
      { name: "Paracetamol", dose: "500mg", frequency: "3 times daily", price: 25, category: "Pain Relief", uses: "Fever, headache, body pain", stock: "In Stock" },
      { name: "Ibuprofen", dose: "400mg", frequency: "2 times daily", price: 35, category: "Pain Relief", uses: "Inflammation, pain relief", stock: "In Stock" },
      { name: "Aspirin", dose: "75mg", frequency: "Once daily", price: 20, category: "Pain Relief", uses: "Blood thinning, heart health", stock: "Low Stock" },
    ]
  },
  {
    name: "Antibiotics",
    icon: "🦠",
    medicines: [
      { name: "Amoxicillin", dose: "500mg", frequency: "3 times daily", price: 45, category: "Antibiotics", uses: "Bacterial infections", stock: "In Stock" },
      { name: "Azithromycin", dose: "250mg", frequency: "Once daily", price: 60, category: "Antibiotics", uses: "Respiratory infections", stock: "In Stock" },
      { name: "Ciprofloxacin", dose: "500mg", frequency: "2 times daily", price: 55, category: "Antibiotics", uses: "UTI, bacterial infections", stock: "In Stock" },
    ]
  },
  {
    name: "Cardiovascular",
    icon: "❤️",
    medicines: [
      { name: "Amlodipine", dose: "5mg", frequency: "Once daily", price: 40, category: "Cardiovascular", uses: "High blood pressure", stock: "In Stock" },
      { name: "Metoprolol", dose: "50mg", frequency: "2 times daily", price: 30, category: "Cardiovascular", uses: "Heart rate control", stock: "In Stock" },
      { name: "Lisinopril", dose: "10mg", frequency: "Once daily", price: 35, category: "Cardiovascular", uses: "Blood pressure, heart failure", stock: "In Stock" },
    ]
  },
  {
    name: "Diabetes",
    icon: "🩸",
    medicines: [
      { name: "Metformin", dose: "500mg", frequency: "2 times daily", price: 25, category: "Diabetes", uses: "Type 2 diabetes control", stock: "In Stock" },
      { name: "Glibenclamide", dose: "5mg", frequency: "Once daily", price: 30, category: "Diabetes", uses: "Blood sugar regulation", stock: "In Stock" },
      { name: "Insulin", dose: "10 units", frequency: "As prescribed", price: 120, category: "Diabetes", uses: "Blood glucose management", stock: "In Stock" },
    ]
  },
  {
    name: "Respiratory",
    icon: "🫁",
    medicines: [
      { name: "Salbutamol", dose: "100mcg", frequency: "As needed", price: 50, category: "Respiratory", uses: "Asthma, breathing difficulty", stock: "In Stock" },
      { name: "Budesonide", dose: "200mcg", frequency: "2 times daily", price: 80, category: "Respiratory", uses: "Asthma prevention", stock: "Low Stock" },
      { name: "Montelukast", dose: "10mg", frequency: "Once daily", price: 45, category: "Respiratory", uses: "Asthma, allergies", stock: "In Stock" },
    ]
  },
  {
    name: "Gastrointestinal",
    icon: "🫃",
    medicines: [
      { name: "Omeprazole", dose: "20mg", frequency: "Once daily", price: 40, category: "Gastrointestinal", uses: "Acid reflux, ulcers", stock: "In Stock" },
      { name: "Ranitidine", dose: "150mg", frequency: "2 times daily", price: 25, category: "Gastrointestinal", uses: "Heartburn, acid reduction", stock: "Out of Stock" },
      { name: "Domperidone", dose: "10mg", frequency: "3 times daily", price: 30, category: "Gastrointestinal", uses: "Nausea, vomiting", stock: "In Stock" },
    ]
  }
];

// Utility function for class names
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Types for Health Metrics Chart
interface HealthData {
  date: string;
  heartRate: number;
  spo2: number;
  timestamp: number;
}

interface SelectedPoint {
  date: string;
  heartRate: number;
  spo2: number;
  x: number;
  y: number;
}

// Generate sample data for every 15 days
// Custom tooltip component for chart points
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {new Date(label).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name === 'heartRate' ? 'Heart Rate' : 'SpO2'}:
            </span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.value} {entry.name === 'heartRate' ? 'bpm' : '%'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Detail card component
const DetailCard: React.FC<{
  data: SelectedPoint;
  onClose: () => void;
  position: { x: number; y: number };
}> = ({ data, onClose, position }) => {
  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { status: "Low", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" };
    if (hr > 100) return { status: "High", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" };
    return { status: "Normal", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" };
  };

  const getSpo2Status = (spo2: number) => {
    if (spo2 < 95) return { status: "Low", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" };
    if (spo2 >= 98) return { status: "Excellent", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" };
    return { status: "Normal", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" };
  };

  const hrStatus = getHeartRateStatus(data.heartRate);
  const spo2Status = getSpo2Status(data.spo2);

  return (
    <div
      className="absolute z-50 w-80 rounded-lg border bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.max(position.y - 100, 10),
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-black dark:text-white">Health Metrics</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            ×
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(data.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          
          <div className={cn("p-3 rounded-lg", hrStatus.bg)}>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="font-medium text-black dark:text-white">Heart Rate</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-black dark:text-white">{data.heartRate}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">bpm</span>
            </div>
            <div className={cn("text-sm font-medium", hrStatus.color)}>
              {hrStatus.status}
            </div>
          </div>
          
          <div className={cn("p-3 rounded-lg", spo2Status.bg)}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-black dark:text-white">SpO2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-black dark:text-white">{data.spo2}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
            </div>
            <div className={cn("text-sm font-medium", spo2Status.color)}>
              {spo2Status.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Functional Health Metrics Chart Component
interface HealthMetricsChartProps {
  vitalsData: VitalsPoint[];
}

const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({ vitalsData }) => {
  const [data, setData] = useState<HealthData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'heartRate' | 'spo2'>('both');
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [realData, setRealData] = useState<HealthData[]>([]);

  // Convert vitals data to chart format
  useEffect(() => {
    if (!isDemoMode) {
      const chartData: HealthData[] = vitalsData.map((vital) => ({
        date: vital.date || vital.time,
        heartRate: vital.hr,
        spo2: vital.spo2,
        timestamp: new Date(vital.date || vital.time).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);
      
      setData(chartData);
    }
  }, [vitalsData, isDemoMode]);

  const handleChartClick = (event: any) => {
    if (event && event.activePayload && event.activePayload.length > 0) {
      const payload = event.activePayload[0].payload;
      setSelectedPoint({
        date: payload.date,
        heartRate: payload.heartRate,
        spo2: payload.spo2,
        x: event.chartX || 0,
        y: event.chartY || 0
      });
    }
  };

  const loadDemoData = () => {
    if (isDemoMode) {
      // Switch back to real data
      setData(realData);
      setIsDemoMode(false);
    } else {
      // Save real data and load demo
      setRealData(data);
      
      const demoData: HealthData[] = [];
      const today = new Date();
      
      // Generate 15 sample points over the last 30 days
      for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (i * 2));
        
        demoData.push({
          date: date.toISOString().split('T')[0],
          heartRate: Math.floor(Math.random() * 30) + 65, // 65-95 bpm
          spo2: Math.floor(Math.random() * 4) + 96, // 96-99%
          timestamp: date.getTime()
        });
      }
      
      setData(demoData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setIsDemoMode(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Indicator */}
      {isDemoMode && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Demo Mode Active - Showing sample data
          </span>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedMetric === 'both' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('both')}
            className="flex items-center gap-2 text-xs"
            size="sm"
          >
            <Heart className="h-3 w-3" />
            <Activity className="h-3 w-3" />
            Both
          </Button>
          <Button
            variant={selectedMetric === 'heartRate' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('heartRate')}
            className="flex items-center gap-2 text-xs"
            size="sm"
          >
            <Heart className="h-3 w-3" />
            Heart Rate
          </Button>
          <Button
            variant={selectedMetric === 'spo2' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('spo2')}
            className="flex items-center gap-2 text-xs"
            size="sm"
          >
            <Activity className="h-3 w-3" />
            SpO2
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Export Button */}
          {data.length > 0 && (
            <Button
              onClick={() => {
                // Export chart data to CSV
                const csvContent = [
                  ['Date', 'Heart Rate (bpm)', 'SpO2 (%)'].join(','),
                  ...data.map(d => [
                    new Date(d.date).toLocaleDateString(),
                    d.heartRate,
                    d.spo2
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `health-metrics-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline"
              className="flex items-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white border-green-600"
              size="sm"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
          )}
          
          {/* Demo Mode Toggle */}
          <div className="relative group">
            <Button
              variant={isDemoMode ? 'default' : 'outline'}
              onClick={loadDemoData}
              className={`flex items-center gap-2 text-xs ${
                isDemoMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950'
              }`}
              size="sm"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isDemoMode ? 'Exit Demo' : 'Demo'}
            </Button>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl min-w-max">
              <div className="text-sm font-medium mb-1">
                {isDemoMode 
                  ? '🔄 Click to return to your real data' 
                  : '⚡ Preview with sample health data'}
              </div>
              <div className="text-xs text-gray-300 dark:text-gray-400">
                {isDemoMode 
                  ? 'Your real data is safely preserved' 
                  : 'Your real data will be preserved'}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="border-[6px] border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-80 w-full">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No health data yet
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add vitals data below to start tracking your heart rate and SpO2
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="fill-gray-600 dark:fill-gray-400"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                fontSize={10}
              />
              <YAxis 
                yAxisId="heartRate"
                orientation="left"
                domain={['dataMin - 10', 'dataMax + 10']}
                className="fill-gray-600 dark:fill-gray-400"
                hide={selectedMetric === 'spo2'}
                fontSize={10}
                label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft', style: { fill: '#ef4444' } }}
              />
              <YAxis 
                yAxisId="spo2"
                orientation="right"
                domain={['dataMin - 5', 'dataMax + 2']}
                className="fill-gray-600 dark:fill-gray-400"
                hide={selectedMetric === 'heartRate'}
                fontSize={10}
                label={{ value: 'SpO2 (%)', angle: 90, position: 'insideRight', style: { fill: '#3b82f6' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference lines for normal ranges */}
              {(selectedMetric === 'both' || selectedMetric === 'heartRate') && (
                <>
                  <ReferenceLine yAxisId="heartRate" y={60} stroke="#ef4444" strokeDasharray="2 2" />
                  <ReferenceLine yAxisId="heartRate" y={100} stroke="#ef4444" strokeDasharray="2 2" />
                </>
              )}
              
              {(selectedMetric === 'both' || selectedMetric === 'spo2') && (
                <ReferenceLine yAxisId="spo2" y={95} stroke="#3b82f6" strokeDasharray="2 2" />
              )}
              
              {(selectedMetric === 'both' || selectedMetric === 'heartRate') && (
                <Line
                  yAxisId="heartRate"
                  type="monotone"
                dataKey="heartRate"
                name="heartRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 3, fill: '#ffffff' }}
              />
            )}
            
            {(selectedMetric === 'both' || selectedMetric === 'spo2') && (
              <Line
                yAxisId="spo2"
                type="monotone"
                dataKey="spo2"
                name="spo2"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 3, fill: '#ffffff' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        )}
        
        {/* Detail Card Overlay */}
        {selectedPoint && (
          <DetailCard
            data={selectedPoint}
            onClose={() => setSelectedPoint(null)}
            position={{ x: selectedPoint.x, y: selectedPoint.y }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500"></div>
          <span>Heart Rate (60-100 bpm normal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span>SpO2 (95%+ normal)</span>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} whileHover={{ y: -2 }}>
    <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition">
      <CardContent className="p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
        <div className="text-2xl font-semibold text-black dark:text-white">
          {value} {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        {accent && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {accent}
          </Badge>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardPage() {
  // Session for authentication
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const user = session?.user;
  
  type Reminder = { id: string; text: string; time?: string; done: boolean };
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState("");
  const [newTime, setNewTime] = useState("");
  const [showRemindersConfirm, setShowRemindersConfirm] = useState(false);
  const [showAppointmentsConfirm, setShowAppointmentsConfirm] = useState(false);
  const [remindersStatus, setRemindersStatus] = useState<string>("");
  const [apptTitle, setApptTitle] = useState<string>("");
  const [apptDate, setApptDate] = useState<string>("");
  const [apptTime, setApptTime] = useState<string>("");
  const [appointments, setAppointments] = useState<Array<{id: string, title: string, date: string, time: string}>>([]);
  const [appointmentsStatus, setAppointmentsStatus] = useState<string>("");
  const [showRemindersModal, setShowRemindersModal] = useState<boolean>(false);
  const clearAllReminders = () => {
    setShowRemindersConfirm(true);
  };
  // Appointment duration fixed to 30 minutes; input removed for a cleaner UI
  // Vitals interactive state
  const [vitals, setVitals] = useState<VitalsPoint[]>([]);
  const [vitalsRangeDays, setVitalsRangeDays] = useState<number>(30);
  const [showHr, setShowHr] = useState<boolean>(true);
  const [showSpO2, setShowSpO2] = useState<boolean>(true);
  const [newHrDate, setNewHrDate] = useState<string>("");
  const [newHrValue, setNewHrValue] = useState<string>("");
  const [newSpO2Value, setNewSpO2Value] = useState<string>("");
  const [newBpSystolic, setNewBpSystolic] = useState<string>("");
  const [newBpDiastolic, setNewBpDiastolic] = useState<string>("");
  const [newWeight, setNewWeight] = useState<string>("");
  const [newTemperature, setNewTemperature] = useState<string>("");
  const [showVitalsForm, setShowVitalsForm] = useState<boolean>(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState<boolean>(false);
  // Lab data state
  const [labData, setLabData] = useState<LabData[]>([]);
  const [showLabForm, setShowLabForm] = useState<boolean>(false);
  const [newLabName, setNewLabName] = useState<string>("");
  const [newLabValue, setNewLabValue] = useState<string>("");
  const [newLabDate, setNewLabDate] = useState<string>("");
  const [newLabUnit, setNewLabUnit] = useState<string>("mg/dL");
  // Cart functionality
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  // Dropdown state for medicine categories
  const [expandedCategories, setExpandedCategories] = useState<boolean[]>(new Array(medicineCategories.length).fill(false));
  const [medicineSearch, setMedicineSearch] = useState<string>("");
  const [favoriteMedicines, setFavoriteMedicines] = useState<string[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [medicineStock, setMedicineStock] = useState<{[key: string]: {status: string, quantity: number}}>({});
  const [customFrequency, setCustomFrequency] = useState<{[key: string]: string}>({});
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [frequencyMedicine, setFrequencyMedicine] = useState<any>(null);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  
  // Prescription tracking
  interface Medicine {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }
  
  interface PrescriptionEntry {
    id: string;
    doctorName: string;
    reason: string;
    prescriptionDate: string;
    medicines: Medicine[];
    reportId?: string;
    reportName?: string;
    comments?: string;
    takenLog: Array<{medicineId: string; date: string; time: string}>;
  }
  
  const [prescriptions, setPrescriptions] = useState<PrescriptionEntry[]>([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [currentMedicines, setCurrentMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '2 times daily',
    duration: '',
    instructions: ''
  });
  const [newPrescription, setNewPrescription] = useState({
    doctorName: '',
    reason: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    reportId: '',
    comments: ''
  });
  const [uploadedReports, setUploadedReports] = useState<PrescriptionRecord[]>([]);
  const [selectedPrescriptionView, setSelectedPrescriptionView] = useState<PrescriptionEntry | null>(null);
  // Flag to prevent saving empty data on initial load
  const [isInitialized, setIsInitialized] = useState(false);
  // Show all labs or just recent ones
  const [showAllLabs, setShowAllLabs] = useState(false);
  const [showLabsModal, setShowLabsModal] = useState(false);
  // Lab chart filter
  const [selectedLabType, setSelectedLabType] = useState<'all' | 'HDL' | 'LDL' | 'Triglycerides' | 'Total Cholesterol'>('all');
  // Time range filter for analytics
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  // Export and health score state
  const [healthScore, setHealthScore] = useState(0);
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Always reload data when component mounts (even if previously initialized)
    // This ensures data shows when navigating back to dashboard
    
    const loadData = async () => {
      // Load vitals and labs from localStorage first (instant)
      if (isLocalStorageAvailable()) {
        const localVitals = safeGetItem<VitalsPoint[]>("alephra.vitals", []);
        const localLabs = safeGetItem<LabData[]>("alephra.labs", []);
        const localReminders = safeGetItem<Reminder[]>("alephra.reminders", []);
        const localAppointments = safeGetItem<Array<{id: string, title: string, date: string, time: string}>>("alephra.appointments", []);
        const localCart = safeGetItem<any[]>("alephra.cart", []);
        const localMedicineStock = safeGetItem<{[key: string]: {status: string, quantity: number}}>("alephra.medicineStock", {});
        const localCustomFrequency = safeGetItem<{[key: string]: string}>("alephra.customFrequency", {});
        const localFavorites = safeGetItem<string[]>("alephra.favoriteMedicines", []);
        const localPrescriptions = safeGetItem<PrescriptionEntry[]>("alephra.prescriptions", []);
        
        // Filter out old data (before 2025) and remove duplicates
        const filteredVitals = localVitals.filter((v: VitalsPoint) => {
          const dateStr = v.date || v.time;
          if (!dateStr) return false;
          const year = new Date(dateStr).getFullYear();
          return year >= 2025;
        });
        
        // Deduplicate vitals by date (keep last entry per date)
        const dedupedVitals = filteredVitals.reduce((acc: VitalsPoint[], curr: VitalsPoint) => {
          const currDate = curr.date || curr.time;
          const existingIndex = acc.findIndex(v => (v.date || v.time) === currDate);
          if (existingIndex >= 0) {
            // Replace with newer data
            acc[existingIndex] = curr;
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);
        
        const filteredLabs = localLabs.filter((l: LabData) => {
          if (!l.date) return false;
          const year = new Date(l.date).getFullYear();
          return year >= 2025;
        });
        
        setVitals(dedupedVitals);
        setLabData(filteredLabs);
        setReminders(localReminders);
        setAppointments(localAppointments);
        setCartItems(localCart);
        setMedicineStock(localMedicineStock);
        setCustomFrequency(localCustomFrequency);
        setFavoriteMedicines(localFavorites);
        setPrescriptions(localPrescriptions);
      }
      
      // Then sync with server in background if logged in (no blocking)
      if (session?.user?.email && !isInitialized) {
        try {
          const serverVitals = await loadVitalsHybrid(session.user.email);
          const serverLabs = await loadLabsHybrid(session.user.email);
          
          // Filter out any data from before 2025
          const filteredVitals = serverVitals.filter((v: VitalsPoint) => {
            const dateStr = v.date || v.time;
            if (!dateStr) return false;
            const year = new Date(dateStr).getFullYear();
            return year >= 2025;
          });
          
          // Deduplicate vitals by date (keep last entry per date)
          const dedupedVitals = filteredVitals.reduce((acc: VitalsPoint[], curr: VitalsPoint) => {
            const currDate = curr.date || curr.time;
            const existingIndex = acc.findIndex(v => (v.date || v.time) === currDate);
            if (existingIndex >= 0) {
              // Replace with newer data
              acc[existingIndex] = curr;
            } else {
              acc.push(curr);
            }
            return acc;
          }, []);
          
          const filteredLabs = serverLabs.filter((l: LabData) => {
            if (!l.date) return false;
            const year = new Date(l.date).getFullYear();
            return year >= 2025;
          });
          
          // Update state with server data
          setVitals(dedupedVitals);
          setLabData(filteredLabs);
          
          // Also save to localStorage as backup
          if (isLocalStorageAvailable()) {
            safeSetItem("alephra.vitals", dedupedVitals);
            safeSetItem("alephra.labs", filteredLabs);
          }
        } catch (error) {
          console.error('Background sync failed:', error);
          // Keep using localStorage data, no need to show error
        }
        
        setIsInitialized(true);
      }
    };
    
    loadData();
  }, [session, isInitialized]);

  // Load uploaded reports from prescription storage
  useEffect(() => {
    const loadReports = async () => {
      try {
        const reports = await prescriptionStorage.getAllPrescriptions();
        const sortedReports = reports.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
        setUploadedReports(sortedReports);
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    };
    loadReports();
  }, []);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("alephra.reminders", reminders);
      if (!success) {
        toast({
          title: "Storage Warning",
          description: "Failed to save reminders. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [reminders, isInitialized]);

  // Note: Vitals and Labs are now saved to database automatically, not localStorage

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("alephra.cart", cartItems);
      if (!success) {
        toast({
          title: "Storage Warning",
          description: "Failed to save cart items. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [cartItems, isInitialized]);

  // Note: Labs data now in database, removed duplicate localStorage save

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("alephra.appointments", appointments);
      if (!success) {
        toast({
          title: "Storage Warning",
          description: "Failed to save appointments. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [appointments, isInitialized]);

  // Save medicine-related data to localStorage
  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      safeSetItem("alephra.medicineStock", medicineStock);
    }
  }, [medicineStock, isInitialized]);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      safeSetItem("alephra.customFrequency", customFrequency);
    }
  }, [customFrequency, isInitialized]);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      safeSetItem("alephra.favoriteMedicines", favoriteMedicines);
    }
  }, [favoriteMedicines, isInitialized]);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      safeSetItem("alephra.prescriptions", prescriptions);
    }
  }, [prescriptions, isInitialized]);

  // Update health score when vitals or labs change
  useEffect(() => {
    if (vitals.length > 0) {
      const score = calculateHealthScore(vitals);
      setHealthScore(score);
    } else {
      setHealthScore(0);
    }
  }, [vitals, labData]);

  const addReminder = () => {
    if (!newReminder.trim()) return;
    
    // Create local reminder
    const r: Reminder = { id: crypto.randomUUID(), text: newReminder.trim(), time: newTime || undefined, done: false };
    setReminders(prev => [r, ...prev]);
    
    // If time is provided, generate Google Calendar link
    if (newTime) {
      const now = new Date();
      const [hoursStr, minutesStr] = newTime.split(":");
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      // Determine target date (today or tomorrow) based on local wall-clock
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      let target = candidate;
      if (candidate.getTime() <= now.getTime()) {
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes, 0, 0);
      }

      // Generate Google Calendar "Add to Calendar" link
      const endDateTime = new Date(target.getTime() + 15 * 60000); // 15 minutes duration
      
      const formatDateTime = (date: Date): string => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
      };
      
      const calendarUrl = new URL('https://calendar.google.com/calendar/render');
      calendarUrl.searchParams.append('action', 'TEMPLATE');
      calendarUrl.searchParams.append('text', `💊 ${newReminder.trim()}`);
      calendarUrl.searchParams.append('dates', `${formatDateTime(target)}/${formatDateTime(endDateTime)}`);
      calendarUrl.searchParams.append('details', `Medical reminder created via Alephra AI Healthcare Assistant`);
      
      // Open Google Calendar in new tab
      window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer');
      
      setRemindersStatus(`✅ Reminder saved! Opening Google Calendar to add it...`);
    } else {
      setRemindersStatus("✅ Reminder added! Add a time to sync with Google Calendar.");
    }
    
    // Clear the status message after 5 seconds
    setTimeout(() => setRemindersStatus(""), 5000);
    
    setNewReminder("");
    setNewTime("");
  };

  const addAppointment = () => {
    if (!apptTitle.trim() || !apptDate || !apptTime) {
      setAppointmentsStatus("Please fill in all fields");
      setTimeout(() => setAppointmentsStatus(""), 3000);
      return;
    }
    
    // Create local appointment
    const appointment = { 
      id: crypto.randomUUID(), 
      title: apptTitle.trim(), 
      date: apptDate, 
      time: apptTime 
    };
    setAppointments(prev => [appointment, ...prev]);
    
    // Generate Google Calendar "Add to Calendar" link
    const appointmentDateTime = new Date(`${apptDate}T${apptTime}`);
    const endDateTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // 30 minutes duration
    
    // Format dates to Google Calendar format: YYYYMMDDTHHmmssZ
    const formatDateTime = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };
    
    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    calendarUrl.searchParams.append('action', 'TEMPLATE');
    calendarUrl.searchParams.append('text', `📅 ${apptTitle.trim()}`);
    calendarUrl.searchParams.append('dates', `${formatDateTime(appointmentDateTime)}/${formatDateTime(endDateTime)}`);
    calendarUrl.searchParams.append('details', `Appointment: ${apptTitle.trim()}\n\nCreated by Alephra AI Healthcare Assistant`);
    
    // Open Google Calendar in new tab
    window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer');
    
    setAppointmentsStatus(`✅ Appointment saved! Opening Google Calendar to add it...`);
    
    // Clear the status message after 5 seconds
    setTimeout(() => setAppointmentsStatus(""), 5000);
    
    setApptTitle("");
    setApptDate("");
    setApptTime("");
  };

  const removeAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addMedicineReminder = async (medicine: any) => {
    const reminderText = `Take ${medicine.name} (${medicine.dose}) - ${medicine.frequency}`;
    
    // Create local reminder
    const r: Reminder = { id: crypto.randomUUID(), text: reminderText, time: undefined, done: false };
    setReminders(prev => [r, ...prev]);
    
    // Show immediate feedback
    setRemindersStatus(`✅ Reminder added for ${medicine.name}`);
    
    // Clear the status message after 3 seconds
    setTimeout(() => setRemindersStatus(""), 3000);
  };

  const addAllMedicineReminders = async () => {
    if (cartItems.length === 0) return;
    
    // Create reminders for all medicines
    const newReminders = cartItems.map(medicine => ({
      id: crypto.randomUUID(),
      text: `Take ${medicine.name} (${medicine.dose}) - ${medicine.frequency}`,
      time: undefined,
      done: false
    }));
    
    setReminders(prev => [...newReminders, ...prev]);
    setRemindersStatus(`✅ Reminders added for ${cartItems.length} medicines`);
    
    // Clear the status message after 3 seconds
    setTimeout(() => setRemindersStatus(""), 3000);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Calendar integration removed

  // Add HR every 15 days constraint
  const addHeartRatePoint = () => {
    const hr = Number(newHrValue);
    const spo2 = Number(newSpO2Value) || 98;
    if (!newHrDate || !Number.isFinite(hr) || hr < 30 || hr > 200) return;
    // Ensure at least 15 days since last entry
    const sorted = [...vitals].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const dNew = new Date(newHrDate);
    if (last) {
      const dLast = new Date(last.date);
      const diffDays = Math.floor((dNew.getTime() - dLast.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 15) {
        setRemindersStatus("Please choose a date at least 15 days after the last recorded HR.");
        return;
      }
    }
    const point: VitalsPoint = { time: newHrDate, date: newHrDate, hr, spo2 };
    setVitals(prev => [...prev.filter(p => p.date !== newHrDate), point].sort((a, b) => a.date.localeCompare(b.date)));
    setNewHrDate("");
    setNewHrValue("");
    setNewSpO2Value("");
    setRemindersStatus("Heart rate data added successfully!");
  };

  // Filter vitals data based on selected range
  const filteredVitals = filterDataByRange(vitals.map(v => ({ ...v, date: v.date || v.time })), timeRange);

  // Calculate health trends and scores
  const getHealthTrend = (values: number[], days: number = 7) => {
    if (values.length < 2) return 'stable';
    const recent = values.slice(-days);
    const older = values.slice(-days * 2, -days);
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  };

  const getHeartScore = () => {
    if (vitals.length === 0) return 94;
    const latest = vitals[vitals.length - 1];
    let score = 100;
    
    // Heart rate scoring (60-100 is optimal)
    if (latest.hr < 60 || latest.hr > 100) {
      score -= Math.abs(latest.hr - 80) * 0.3;
    }
    
    // SpO2 scoring (95%+ is optimal)
    if (latest.spo2 < 95) {
      score -= (95 - latest.spo2) * 2;
    }
    
    // Blood pressure scoring
    if (latest.bp) {
      const systolic = latest.bp.systolic;
      const diastolic = latest.bp.diastolic;
      if (systolic > 140 || diastolic > 90) {
        score -= 10;
      } else if (systolic < 90 || diastolic < 60) {
        score -= 5;
      }
    }
    
    // Weight trend (if available)
    if (latest.weight && vitals.length > 1) {
      const prevWeight = vitals[vitals.length - 2]?.weight;
      if (prevWeight) {
        const weightChange = Math.abs(latest.weight - prevWeight) / prevWeight;
        if (weightChange > 0.05) score -= 5; // 5% weight change
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getBpStatus = () => {
    if (vitals.length === 0) return { value: "120/80", status: "Normal", color: "text-green-600" };
    const latest = vitals[vitals.length - 1];
    if (!latest.bp) return { value: "120/80", status: "Normal", color: "text-green-600" };
    
    const { systolic, diastolic } = latest.bp;
    if (systolic >= 140 || diastolic >= 90) {
      return { value: `${systolic}/${diastolic}`, status: "High", color: "text-red-600" };
    } else if (systolic >= 120 || diastolic >= 80) {
      return { value: `${systolic}/${diastolic}`, status: "Elevated", color: "text-yellow-600" };
    } else if (systolic < 90 || diastolic < 60) {
      return { value: `${systolic}/${diastolic}`, status: "Low", color: "text-blue-600" };
    } else {
      return { value: `${systolic}/${diastolic}`, status: "Normal", color: "text-green-600" };
    }
  };

  const addVitalsEntry = async () => {
    const hr = Number(newHrValue);
    const spo2 = Number(newSpO2Value) || 98;
    const systolic = Number(newBpSystolic);
    const diastolic = Number(newBpDiastolic);
    const weight = Number(newWeight);
    const temperature = Number(newTemperature);
    
    if (!newHrDate) {
      setRemindersStatus("Please select a date");
      return;
    }
    
    // Prevent future dates
    const selectedDate = new Date(newHrDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      setRemindersStatus("❌ Cannot record vitals for future dates");
      setTimeout(() => setRemindersStatus(""), 3000);
      return;
    }
    
    if (!Number.isFinite(hr) || hr < 30 || hr > 200) {
      setRemindersStatus("Please enter valid Heart Rate (30-200 bpm)");
      return;
    }
    
    if (spo2 < 80 || spo2 > 100) {
      setRemindersStatus("Please enter valid SpO2 (80-100%)");
      return;
    }
    
    const vitalData = {
      date: newHrDate,
      time: newHrDate, // Ensure both date and time are set
      hr,
      spo2,
      ...(systolic && diastolic && { bp: { systolic, diastolic } }),
      ...(weight && { weight }),
      ...(temperature && { temperature })
    };
    
    // Save to server if logged in
    if (session?.user?.email) {
      try {
        await saveVitalToServer(vitalData);
        const updatedVitals = await loadVitalsHybrid(session.user.email);
        
        // Remove duplicates by date (keep latest entry per date)
        const deduped = updatedVitals.reduce((acc: VitalsPoint[], curr: VitalsPoint) => {
          const existingIndex = acc.findIndex(v => (v.date || v.time) === (curr.date || curr.time));
          if (existingIndex >= 0) {
            // Replace with newer data
            acc[existingIndex] = curr;
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);
        
        setVitals(deduped);
        
        // Also save to localStorage for offline access
        if (isLocalStorageAvailable()) {
          safeSetItem("alephra.vitals", deduped);
        }
        
        setRemindersStatus("✅ Vitals saved to cloud!");
      } catch (error) {
        console.error('Failed to save to server:', error);
        setRemindersStatus("⚠️ Saved locally (will sync when online)");
        // Fallback to localStorage
        const point: VitalsPoint = { ...vitalData };
        // Remove any existing entry for this date
        const filtered = vitals.filter(p => (p.date || p.time) !== newHrDate);
        const updatedVitals = [...filtered, point].sort((a, b) => (a.date || a.time).localeCompare(b.date || b.time));
        setVitals(updatedVitals);
        if (isLocalStorageAvailable()) {
          safeSetItem("alephra.vitals", updatedVitals);
        }
      }
    } else {
      // Not logged in - save locally only
      const point: VitalsPoint = { ...vitalData };
      // Remove any existing entry for this date
      const filtered = vitals.filter(p => (p.date || p.time) !== newHrDate);
      const updatedVitals = [...filtered, point].sort((a, b) => (a.date || a.time).localeCompare(b.date || b.time));
      setVitals(updatedVitals);
      if (isLocalStorageAvailable()) {
        safeSetItem("alephra.vitals", updatedVitals);
      }
      setRemindersStatus("✅ Vitals saved locally!");
    }
    
    // Clear form
    setNewHrDate("");
    setNewHrValue("");
    setNewSpO2Value("");
    setNewBpSystolic("");
    setNewBpDiastolic("");
    setNewWeight("");
    setNewTemperature("");
    setShowVitalsForm(false);
    
    setTimeout(() => setRemindersStatus(""), 5000);
  };

  // Cart functions
  const addToCart = (medicine: any) => {
    setCartItems(prev => [...prev, { ...medicine, id: crypto.randomUUID() }]);
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Lab data functions
  const getLabStatus = (lab: LabData) => {
    const { value, normalRange, name } = lab;
    
    // Special cases for different lab values
    if (name === "HDL") {
      // Higher is better for HDL
      return value >= normalRange.min ? "normal" : "abnormal";
    } else if (name === "LDL" || name === "Triglycerides") {
      // Lower is better for LDL and Triglycerides
      return value <= normalRange.max ? "normal" : "abnormal";
    } else {
      // Standard range check
      return value >= normalRange.min && value <= normalRange.max ? "normal" : "abnormal";
    }
  };

  // Process lab data for chart
  const chartData = labData.reduce((acc, lab) => {
    const existingDate = acc.find(item => item.date === lab.date);
    if (existingDate) {
      existingDate[lab.name] = lab.value;
    } else {
      acc.push({
        date: lab.date,
        [lab.name]: lab.value
      });
    }
    return acc;
  }, [] as any[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const addLabEntry = async () => {
    if (!newLabName.trim() || !newLabValue || !newLabDate) {
      setRemindersStatus("Please fill in all required fields");
      setTimeout(() => setRemindersStatus(""), 3000);
      return;
    }

    const value = Number(newLabValue);
    if (!Number.isFinite(value) || value < 0) {
      setRemindersStatus("Please enter a valid lab value");
      setTimeout(() => setRemindersStatus(""), 3000);
      return;
    }

    // Determine normal range based on lab name
    let normalRange = { min: 0, max: 100 };
    let category = "General";
    
    switch (newLabName.toLowerCase()) {
      case "glucose":
        normalRange = { min: 70, max: 100 };
        category = "Metabolic";
        break;
      case "hdl":
        normalRange = { min: 40, max: 200 };
        category = "Lipid";
        break;
      case "ldl":
        normalRange = { min: 0, max: 100 };
        category = "Lipid";
        break;
      case "triglycerides":
        normalRange = { min: 0, max: 150 };
        category = "Lipid";
        break;
      case "total cholesterol":
        normalRange = { min: 0, max: 200 };
        category = "Lipid";
        break;
      case "hba1c":
        normalRange = { min: 4, max: 5.7 };
        category = "Metabolic";
        break;
    }

    const newLabData = {
      name: newLabName.trim(),
      value,
      unit: newLabUnit,
      date: newLabDate,
      normalRange,
      category
    };

    console.log("New lab data:", newLabData);

    // Save to server if logged in
    if (session?.user?.email) {
      try {
        await saveLabToServer(newLabData);
        const updatedLabs = await loadLabsHybrid(session.user.email);
        setLabData(updatedLabs);
        
        // Also save to localStorage for offline access
        if (isLocalStorageAvailable()) {
          safeSetItem("alephra.labs", updatedLabs);
        }
        
        setRemindersStatus("✅ Lab result saved to cloud!");
      } catch (error) {
        console.error('Failed to save to server:', error);
        setRemindersStatus("⚠️ Saved locally (will sync when online)");
        // Fallback to localStorage
        const newLab: LabData = { ...newLabData, id: crypto.randomUUID() };
        const updatedLabs = [...labData, newLab].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLabData(updatedLabs);
        if (isLocalStorageAvailable()) {
          safeSetItem("alephra.labs", updatedLabs);
        }
      }
    } else {
      // Not logged in - save to localStorage
      const newLab: LabData = { ...newLabData, id: crypto.randomUUID() };
      const updatedLabs = [...labData, newLab].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLabData(updatedLabs);
      if (isLocalStorageAvailable()) {
        safeSetItem("alephra.labs", updatedLabs);
      }
      setRemindersStatus("📝 Lab result saved locally (sign in to sync across devices)");
    }
    
    // Clear form
    setNewLabName("");
    setNewLabValue("");
    setNewLabDate("");
    setNewLabUnit("mg/dL");
    setShowLabForm(false);
    
    setTimeout(() => setRemindersStatus(""), 5000);
  };

  const removeLabEntry = async (id: string) => {
    if (session?.user?.email) {
      try {
        await deleteLabFromServer(id);
        setLabData(prev => prev.filter(lab => lab.id !== id));
      } catch (error) {
        console.error('Failed to delete from server:', error);
        // Fallback to local delete
        setLabData(prev => prev.filter(lab => lab.id !== id));
      }
    } else {
      setLabData(prev => prev.filter(lab => lab.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative overflow-hidden pt-16">
      {/* Noise Background */}
      <div className="absolute inset-0 z-0">
        <Noise
          patternSize={75}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={2}
          patternAlpha={35}
          className="w-full h-full"
        />
      </div>
      
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.15] z-5 text-gray-400 dark:text-gray-600"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Ambient gradient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl z-5" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl z-5" />
      <div className="w-full px-6 py-10 relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg">
                <svg 
                  className="w-8 h-8 text-white dark:text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                >
                  {/* Heartbeat line */}
                  <path d="M3 12h3l2-4 4 8 2-4h3" />
                  {/* Medical cross overlay */}
                  <path d="M17 8v8M21 12h-8" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white"><span className="bg-gradient-to-r from-gray-600 to-black dark:from-gray-300 dark:to-white bg-clip-text text-transparent">Alephra</span> My Health Space</h1>
                <p className="text-gray-600 dark:text-gray-400">Overview of vitals, labs, meds, and care timeline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const success = clearAllAlephraData();
                  if (success) {
                    toast({
                      title: "Data Cleared",
                      description: "All your data has been successfully cleared.",
                    });
                  } else {
                    toast({
                      title: "Clear Warning",
                      description: "Some data may not have been cleared properly.",
                      variant: "destructive",
                    });
                  }
                  setVitals([]);
                  setLabData([]);
                  setReminders([]);
                  setCartItems([]);
                  setAppointments([]);
                  window.location.reload();
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                title="Clear all data (for testing)"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
        {/* Hero banner */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black">
            <div className="px-6 py-8 md:px-8 md:py-10 text-center">
                <div className="text-base font-medium text-gray-600 dark:text-gray-400 mb-3">Welcome</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white leading-tight">Your health at a glance</div>
              <div className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400">Track vitals, labs and care progress in one place.</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Upload Report", description: "Simple upload & chat", classes: "text-white bg-[#26A69A] hover:bg-[#219187] dark:text-white dark:bg-[#1E88E5] dark:hover:bg-[#1976D2]", href: "/report" },
            { label: "Health Analytics", description: "View health insights", classes: "text-black bg-[#B0BEC5] hover:bg-[#9aa8b0] dark:text-white dark:bg-[#43A047] dark:hover:bg-[#388E3C]", href: "/history" },
            { label: "Voice Assistant", description: "Talk to AI assistant", classes: "text-white bg-[#3F51B5] hover:bg-[#3546a6] dark:text-white dark:bg-[#7B1FA2] dark:hover:bg-[#6A1B9A]", href: "/voice" },
            { label: "My Health Space", description: "Medications & appointments", classes: "text-white bg-[#607D8B] hover:bg-[#546e7a] dark:text-white dark:bg-[#F57C00] dark:hover:bg-[#EF6C00]", href: "/care-plan" },
          ].map((b, i) => (
            <a key={i} href={b.href} className="block relative group">
              <motion.button 
                className={`relative w-full h-16 rounded-xl font-medium shadow px-6 border border-gray-300 dark:border-gray-700 overflow-hidden ${b.classes}`} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <GlowingEffect
                  disabled={false}
                  glow={true}
                  proximity={50}
                  spread={30}
                  blur={0}
                  movementDuration={1.5}
                  borderWidth={2}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="relative z-10 text-center">
                  <div className="font-semibold">{b.label}</div>
                  <div className="text-xs opacity-80 mt-1">{b.description}</div>
                </div>
              </motion.button>
            </a>
          ))}
        </div>

        {/* Time Range Selector & Export Buttons */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
          <TimeRangeSelector 
            selected={timeRange} 
            onChange={setTimeRange}
          />
          <ExportButton
            variant="compact"
            onExportPDF={() => exportToPDF('health-dashboard-content', 'MedScan-Health-Report.pdf')}
            onExportCSV={() => exportHealthSummary(vitals, labData, meds)}
          />
        </div>

        {/* Health Score Dashboard */}
        <div className="mb-8" id="health-dashboard-content">
          <HealthScoreDashboard
            overallScore={healthScore}
            metrics={getHealthMetrics(vitals, labData)}
          />
        </div>

        {/* Next Appointment Countdown */}
        {appointments.length > 0 && (() => {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          
          // Find the next upcoming appointment
          const upcomingAppointments = appointments
            .map(apt => ({
              ...apt,
              dateObj: new Date(apt.date)
            }))
            .filter(apt => {
              apt.dateObj.setHours(0, 0, 0, 0);
              return apt.dateObj >= now;
            })
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
          
          if (upcomingAppointments.length === 0) return null;
          
          const nextApt = upcomingAppointments[0];
          const daysUntil = Math.ceil((nextApt.dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          let urgencyColor = "from-blue-500 to-cyan-500";
          let urgencyText = "Upcoming";
          let urgencyBg = "bg-blue-50 dark:bg-blue-900/20";
          let urgencyBorder = "border-blue-300 dark:border-blue-700";
          
          if (daysUntil === 0) {
            urgencyColor = "from-red-500 to-orange-500";
            urgencyText = "Today!";
            urgencyBg = "bg-red-50 dark:bg-red-900/20";
            urgencyBorder = "border-red-300 dark:border-red-700";
          } else if (daysUntil === 1) {
            urgencyColor = "from-orange-500 to-yellow-500";
            urgencyText = "Tomorrow";
            urgencyBg = "bg-orange-50 dark:bg-orange-900/20";
            urgencyBorder = "border-orange-300 dark:border-orange-700";
          } else if (daysUntil <= 3) {
            urgencyColor = "from-yellow-500 to-amber-500";
            urgencyText = "Soon";
            urgencyBg = "bg-yellow-50 dark:bg-yellow-900/20";
            urgencyBorder = "border-yellow-300 dark:border-yellow-700";
          }
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className={`${urgencyBg} backdrop-blur border-2 ${urgencyBorder} shadow-lg`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${urgencyColor} shadow-lg`}>
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`${urgencyBorder} text-xs font-semibold`}>
                          {urgencyText}
                        </Badge>
                        {daysUntil > 0 && (
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                        {nextApt.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(nextApt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{nextApt.time}</span>
                        </div>
                      </div>
                      {upcomingAppointments.length > 1 && (
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                          + {upcomingAppointments.length - 1} more upcoming {upcomingAppointments.length === 2 ? 'appointment' : 'appointments'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

        {/* Vitals Input Form - Moved here for better proximity to vital metrics */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-300 dark:border-gray-700 shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-black dark:text-white">Record Vitals</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Track your health metrics</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Check if user is signed in before showing form (only show prompt if authenticated and not signed in)
                    if (status === "unauthenticated" && !showVitalsForm) {
                      setShowSignInPrompt(true);
                      return;
                    }
                    
                    setShowVitalsForm(!showVitalsForm);
                    if (!showVitalsForm) {
                      setNewHrDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className={`
                    px-5 py-2.5 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105
                    ${showVitalsForm 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                    }
                    flex items-center gap-2
                  `}
                >
                  {showVitalsForm ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Vitals Data
                    </>
                  )}
                </button>
              </div>
              
              {showVitalsForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label htmlFor="vitals-date" className="text-sm font-medium">Date</Label>
                    <div className="relative">
                      <Input
                        id="vitals-date"
                        type="date"
                        value={newHrDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setNewHrDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        onClick={() => {
                          const input = document.getElementById('vitals-date') as HTMLInputElement;
                          if (input && input.showPicker) {
                            input.showPicker();
                          }
                        }}
                        className="mt-1 pr-10 cursor-pointer"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setNewHrDate(new Date().toISOString().split('T')[0])}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          setNewHrDate(yesterday.toISOString().split('T')[0]);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Yesterday
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="heart-rate" className="text-sm font-medium">Heart Rate (bpm)</Label>
                    <Input
                      id="heart-rate"
                      type="number"
                      placeholder="72"
                      min="30"
                      max="200"
                      value={newHrValue}
                      onChange={(e) => setNewHrValue(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="spo2" className="text-sm font-medium">SpO2 (%)</Label>
                    <Input
                      id="spo2"
                      type="number"
                      placeholder="98"
                      min="80"
                      max="100"
                      value={newSpO2Value}
                      onChange={(e) => setNewSpO2Value(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bp-systolic" className="text-sm font-medium">BP Systolic (mmHg)</Label>
                    <Input
                      id="bp-systolic"
                      type="number"
                      placeholder="120"
                      min="70"
                      max="200"
                      value={newBpSystolic}
                      onChange={(e) => setNewBpSystolic(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bp-diastolic" className="text-sm font-medium">BP Diastolic (mmHg)</Label>
                    <Input
                      id="bp-diastolic"
                      type="number"
                      placeholder="80"
                      min="40"
                      max="120"
                      value={newBpDiastolic}
                      onChange={(e) => setNewBpDiastolic(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      min="30"
                      max="200"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="temperature" className="text-sm font-medium">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      placeholder="36.5"
                      min="35"
                      max="42"
                      step="0.1"
                      value={newTemperature}
                      onChange={(e) => setNewTemperature(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
                    <button
                      onClick={() => setShowVitalsForm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addVitalsEntry}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Save Vitals
                    </button>
                  </div>
                </div>
              )}
              
              {remindersStatus && (
                <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
                  {remindersStatus}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medical Reminders */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-300 dark:border-gray-700 shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-black dark:text-white">Medical Reminders</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={clearAllReminders}
                    className="text-xs px-2 py-1 rounded border border-rose-300 text-red-900 dark:text-red-300 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20 transition-all duration-200"
                  >
                    Remove all
                  </button>
                  {isSignedIn ? (
                    <div className="text-xs text-green-600 dark:text-green-400">✅ Synced with Google Calendar</div>
                  ) : (
                    <div className="text-xs text-orange-600 dark:text-orange-400">⚠️ Sign in to sync with Google Calendar</div>
                  )}
                </div>
              </div>
              {/* Reminders Clear Modal */}
              <BasicModal
                isOpen={showRemindersConfirm}
                onClose={() => setShowRemindersConfirm(false)}
                title="Clear All Reminders"
                size="sm"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Are you sure?</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">This will permanently delete all reminders.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      className="px-4 h-9 rounded-md border border-gray-300 dark:border-gray-700 text-sm"
                      onClick={() => setShowRemindersConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 h-9 rounded-md bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-sm inline-flex items-center shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => { setReminders([]); setShowRemindersConfirm(false); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Clear All
                    </button>
                  </div>
                </div>
              </BasicModal>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                <input
                  value={newReminder}
                  onChange={e => setNewReminder(e.target.value)}
                  placeholder="e.g., Take Zoclar 500"
                  className="md:col-span-3 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-3 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <BlackTimePicker
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="md:col-span-1"
                />
                <button onClick={addReminder} className="h-11 px-4 rounded-lg bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-sm font-medium shadow-lg hover:shadow-xl transition">📅 Add</button>
              </div>

              <div className="space-y-2">
                {reminders.length === 0 && (
                  <div className="text-sm text-gray-500">No reminders yet. Add your first one above.</div>
                )}
                {reminders.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={r.done} onChange={() => toggleReminder(r.id)} className="h-4 w-4" />
                      <div className={`text-sm ${r.done ? 'line-through text-gray-400' : 'text-black dark:text-white'}`}>{r.text}</div>
                      {r.time && <Badge variant="secondary" className="text-xs">{r.time}</Badge>}
                    </div>
                    <button onClick={() => removeReminder(r.id)} className="text-xs text-rose-600 hover:text-rose-700 hover:underline transition-colors duration-200">Remove</button>
                  </div>
                ))}
                {reminders.length > 3 && (
                  <button
                    onClick={() => setShowRemindersModal(true)}
                    className="w-full text-center text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:underline"
                  >
                    View {reminders.length - 3} more
                  </button>
                )}
                {remindersStatus && <div className="text-xs text-gray-500">{remindersStatus}</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {showRemindersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowRemindersModal(false)}></div>
            <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-black dark:text-white">All Medical Reminders</div>
                <div className="flex items-center gap-3">
                <button
                  onClick={clearAllReminders}
                  className="text-xs text-red-700 hover:text-red-800 dark:text-red-600 dark:hover:text-red-500 hover:underline transition-colors duration-200"
                >
                  Remove all
                </button>

                  <button onClick={() => setShowRemindersModal(false)} className="text-xs text-gray-600 dark:text-gray-300 hover:underline">Close</button>
                </div>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {reminders.map(r => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={r.done} onChange={() => toggleReminder(r.id)} className="h-4 w-4" />
                      <div className={`text-sm ${r.done ? 'line-through text-gray-400' : 'text-black dark:text-white'}`}>{r.text}</div>
                      {r.time && <Badge variant="secondary" className="text-xs">{r.time}</Badge>}
                    </div>
                    <button onClick={() => removeReminder(r.id)} className="text-xs text-rose-600 hover:text-rose-700 hover:underline transition-colors duration-200">Remove</button>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <div className="text-sm text-gray-500">No reminders yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-300 dark:border-gray-700 shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-black dark:text-white">Appointments</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowAppointmentsConfirm(true)}
                    className="text-xs px-2 py-1 rounded border border-rose-300 text-red-900 dark:text-red-300 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20 transition-all duration-200"
                  >
                    Remove all
                  </button>
                  {isSignedIn ? (
                    <span className="text-xs text-green-600 dark:text-green-400">✅ Connected to Google Calendar</span>
                  ) : (
                    <span className="text-xs text-orange-600 dark:text-orange-400">⚠️ Sign in to sync with Google Calendar</span>
                  )}
                </div>
              </div>
              {/* Appointments Clear Modal */}
              <BasicModal
                isOpen={showAppointmentsConfirm}
                onClose={() => setShowAppointmentsConfirm(false)}
                title="Clear All Appointments"
                size="sm"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Are you sure?</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">This will permanently delete all appointments.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      className="px-4 h-9 rounded-md border border-gray-300 dark:border-gray-700 text-sm"
                      onClick={() => setShowAppointmentsConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 h-9 rounded-md bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-sm inline-flex items-center shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => { setAppointments([]); setShowAppointmentsConfirm(false); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Clear All
                    </button>
                  </div>
                </div>
              </BasicModal>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <div className="text-sm font-medium text-black dark:text-white mb-2">Create Appointment</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      value={apptTitle}
                      onChange={e => setApptTitle(e.target.value)}
                      placeholder="Title (e.g., Doctor Visit)"
                      className="md:col-span-2 h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="date"
                      value={apptDate}
                      onChange={e => setApptDate(e.target.value)}
                      onClick={() => {
                        const input = document.getElementById('appt-date') as HTMLInputElement;
                        if (input && input.showPicker) {
                          input.showPicker();
                        }
                      }}
                      id="appt-date"
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    />
                    <div className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 hover:border-cyan-400 dark:hover:border-cyan-400 transition-colors">
                      <input
                        id="appt-time"
                        type="time"
                        value={apptTime}
                        onChange={e => setApptTime(e.target.value)}
                        onClick={() => {
                          const input = document.getElementById('appt-time') as HTMLInputElement;
                          if (input && input.showPicker) {
                            input.showPicker();
                          }
                        }}
                        className="w-full h-full rounded-lg bg-transparent px-2 text-sm text-black dark:text-white outline-none cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={addAppointment}
                      className="h-10 px-4 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      📅 Add
                    </button>
                  </div>
                  {appointmentsStatus && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {appointmentsStatus}
                    </div>
                  )}
                </div>
                
                {/* Appointments List */}
                <div className="flex-1">
                  <div className="text-sm font-medium text-black dark:text-white mb-2">Upcoming Appointments</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {appointments.length === 0 ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">No appointments scheduled</div>
                    ) : (
                      appointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-black dark:text-white">{appointment.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
                                const endDateTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
                                
                                const formatDateTime = (date: Date): string => {
                                  const year = date.getUTCFullYear();
                                  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                                  const day = String(date.getUTCDate()).padStart(2, '0');
                                  const hours = String(date.getUTCHours()).padStart(2, '0');
                                  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                                  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
                                  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
                                };
                                
                                const calendarUrl = new URL('https://calendar.google.com/calendar/render');
                                calendarUrl.searchParams.append('action', 'TEMPLATE');
                                calendarUrl.searchParams.append('text', `📅 ${appointment.title}`);
                                calendarUrl.searchParams.append('dates', `${formatDateTime(appointmentDateTime)}/${formatDateTime(endDateTime)}`);
                                calendarUrl.searchParams.append('details', `Appointment: ${appointment.title}\n\nCreated by Alephra AI Healthcare Assistant`);
                                
                                window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer');
                              }}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                              title="Add to Google Calendar"
                            >
                              📅
                            </button>
                            <button
                              onClick={() => removeAppointment(appointment.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              title="Remove appointment"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lipid Profile Snapshot */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white dark:text-black" />
                </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">Lipid Profile Snapshot</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Latest cholesterol and triglyceride levels</p>
              </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {labData.length > 0 ? new Date(labData[0].date).toLocaleDateString() : 'No data'}
              </div>
                  </div>
                  
              {/* Lipid Profile Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['HDL', 'LDL', 'Triglycerides', 'Total Cholesterol'].map((lipidType) => {
                  const lipidData = labData.find(lab => lab.name === lipidType);
                  if (!lipidData) {
                    return (
                      <div key={lipidType} className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{lipidType}</div>
                        <div className="text-xs text-gray-400">No data</div>
                    </div>
                    );
                  }
                  
                  const status = getLabStatus(lipidData);
                  const isNormal = status === "normal";
                  
                  return (
                    <div key={lipidType} className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      isNormal 
                        ? 'border-gray-300 dark:border-gray-700 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-black dark:text-white">{lipidType}</div>
                        <div className={`w-3 h-3 rounded-full ${
                          isNormal ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        </div>
                      <div className="text-2xl font-bold text-black dark:text-white mb-1">
                        {lipidData.value} <span className="text-sm text-gray-500">{lipidData.unit}</span>
                      </div>
                      <div className={`text-xs font-medium ${
                        isNormal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isNormal ? '✓ Normal' : '⚠ Abnormal'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Range: {lipidData.normalRange.min}-{lipidData.normalRange.max}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Add Data Button */}
              <div className="flex justify-center mt-6">
                          <button
                            onClick={() => {
                    // Check if user is signed in before showing form (only show prompt if authenticated and not signed in)
                    if (status === "unauthenticated" && !showLabForm) {
                      setShowSignInPrompt(true);
                      return;
                    }
                    
                    setShowLabForm(!showLabForm);
                    if (!showLabForm) {
                      setNewLabDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="px-6 py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  + Add Data
                          </button>
                        </div>
            </CardContent>
          </Card>
                    </div>
                    
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700 xl:col-span-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-black dark:text-white">Heart Rate & SpO2</div>
                <div className="flex items-center gap-2">
                  {/* <a href="/dashboard/vitals" className="text-xs text-cyan-600">View details →</a> */}
                    </div>
                  </div>
                  
              {/* Advanced Health Metrics Chart */}
              <HealthMetricsChart vitalsData={vitals} />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-black dark:text-white">Lab Results</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportLabsToCSV(labData)}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                    title="Export labs to CSV"
                  >
                    Export
                  </button>
                  {labData.length > 3 && (
                      <button
                      onClick={() => setShowLabsModal(true)}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      View All ({labData.length})
                      </button>
                  )}
                  {/* <a href="/dashboard/labs" className="text-xs text-cyan-600">View details →</a> */}
                    </div>
                  </div>
              
              
              {/* Lab Values with Enhanced Status Indicators - Show only 3 by default */}
              <div className="space-y-2 mb-4">
                {labData.slice(0, 3).map((lab) => {
                  const status = getLabStatus(lab);
                  const isNormal = status === "normal";
                  const isLipid = ['HDL', 'LDL', 'Triglycerides', 'Total Cholesterol'].includes(lab.name);
                  
                  return (
                    <div key={lab.id} className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                      isNormal 
                        ? 'border-gray-300 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' 
                        : 'border-gray-300 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    } ${isLipid ? 'ring-1 ring-blue-100 dark:ring-blue-900/30' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${
                              isNormal ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <div className="text-xs font-semibold text-black dark:text-white">{lab.name}</div>
                            {isLipid && (
                              <div className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Lipid
                              </div>
                            )}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isNormal 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {isNormal ? '✓ Normal' : '⚠ Abnormal'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(lab.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })} • {lab.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-black dark:text-white">
                            {lab.value} <span className="text-xs text-gray-500 font-normal">{lab.unit}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Range: {lab.normalRange.min}-{lab.normalRange.max}
                          </div>
                        </div>
                        <button
                          onClick={() => removeLabEntry(lab.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200"
                          title="Remove this lab result"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {/* More results indicator */}
                {labData.length > 3 && !showAllLabs && (
                  <div className="text-center py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors cursor-pointer"
                       onClick={() => setShowAllLabs(true)}>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      +{labData.length - 3} more results
                    </div>
                    <div className="text-cyan-600 hover:text-cyan-700 text-xs font-medium mt-0.5">
                      Click to view all
                    </div>
                  </div>
                )}
                
                {labData.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-lg font-medium mb-2">No lab results yet</div>
                    <div className="text-sm">Add your first lab result using the form above to get started</div>
                  </div>
                )}
              </div>

              {/* Enhanced Lab Results Chart */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-black dark:text-white">Lab Trends</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {labData.length} results
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedLabType('all')}
                        className={`px-2 py-1 text-xs rounded-full ${
                          selectedLabType === 'all'
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedLabType('HDL')}
                        className={`px-2 py-1 text-xs rounded-full ${
                          selectedLabType === 'HDL'
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        HDL
                      </button>
                      <button
                        onClick={() => setSelectedLabType('LDL')}
                        className={`px-2 py-1 text-xs rounded-full ${
                          selectedLabType === 'LDL'
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        LDL
                      </button>
                    </div>
                  </div>
                </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                    <XAxis 
                        dataKey="date" 
                      stroke="#9ca3af" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px',
                          padding: '8px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      />
                      {selectedLabType === 'all' || selectedLabType === 'HDL' ? (
                        <Line 
                          type="monotone" 
                          dataKey="HDL" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                      ) : null}
                      {selectedLabType === 'all' || selectedLabType === 'LDL' ? (
                        <Line 
                          type="monotone" 
                          dataKey="LDL" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                        />
                      ) : null}
                      {selectedLabType === 'all' || selectedLabType === 'Triglycerides' ? (
                        <Line 
                          type="monotone" 
                          dataKey="Triglycerides" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                      ) : null}
                      {selectedLabType === 'all' || selectedLabType === 'Total Cholesterol' ? (
                        <Line 
                          type="monotone" 
                          dataKey="Total Cholesterol" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                        />
                      ) : null}
                    </LineChart>
                </ResponsiveContainer>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Hover over lines to see detailed values • Click filter buttons to view specific lab types
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medicine Categories Section */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-lg font-semibold text-black dark:text-white">Medicine Categories</div>
                  <div className="text-sm text-gray-500 mt-1">Browse and manage your medicines</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Selected: {cartItems.length} items</span>
                  <button 
                    onClick={() => setShowCart(!showCart)}
                    className="h-8 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm hover:opacity-90 transition shadow-md"
                  >
                    View List
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search medicines by name, category, or use..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-gray-400 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Favorites Section */}
              {favoriteMedicines.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-amber-800 dark:text-amber-200">Favorite Medicines</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicineCategories.flatMap(cat => cat.medicines).filter(med => favoriteMedicines.includes(med.name)).map((med, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!cartItems.find(item => item.name === med.name)) {
                            addToCart(med);
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-amber-300 dark:border-amber-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        {med.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Popup Modal */}
              {showCart && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full h-[80vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                      <h2 className="text-xl font-semibold text-black dark:text-white">Selected Medicines</h2>
                      <button 
                        onClick={() => setShowCart(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-gray-500 text-lg mb-2">No medicines selected</div>
                          <div className="text-gray-400 text-sm">Select medicines from categories below</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cartItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="text-sm font-semibold text-black dark:text-white">{item.name}</div>
                                  <Badge variant="secondary">{item.dose}</Badge>
                                </div>
                                <div className="text-xs text-gray-500 mb-1">{item.frequency}</div>
                                <div className="text-xs text-gray-500">{item.category}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-cyan-600">₹{item.price}</div>
                                </div>
                                <button 
                                  onClick={() => addMedicineReminder(item)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                                  title="Set reminder for this medicine"
                                >
                                  ⏰ Reminder
                                </button>
                                <button 
                                  onClick={() => removeFromCart(index)}
                                  className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"
                                  title="Remove from list"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price Summary */}
                    {cartItems.length > 0 && (
                      <div className="border-t border-gray-300 dark:border-gray-700 p-6 sticky bottom-0 bg-white dark:bg-zinc-900 z-10">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Total ({cartItems.length} items)</span>
                            <span className="text-lg font-semibold text-cyan-600">₹{cartItems.reduce((sum, item) => sum + item.price, 0)}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                            * Approximate prices for reference only
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                          <button 
                            onClick={addAllMedicineReminders}
                            className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                          >
                            ⏰ Set All Reminders
                          </button>
                          <button 
                            onClick={() => setCartItems([])}
                            className="w-full h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                          >
                            Clear List
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medicine Categories Dropdown */}
              <div className="space-y-4">
                {medicineCategories.map((category, categoryIndex) => {
                  const filteredMedicines = category.medicines.filter(med => 
                    medicineSearch === "" || 
                    med.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
                    med.category.toLowerCase().includes(medicineSearch.toLowerCase()) ||
                    med.uses.toLowerCase().includes(medicineSearch.toLowerCase())
                  );
                  
                  if (filteredMedicines.length === 0 && medicineSearch !== "") return null;
                  
                  return (
                    <div key={categoryIndex} className="border-2 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => {
                          const newExpanded = [...expandedCategories];
                          newExpanded[categoryIndex] = !newExpanded[categoryIndex];
                          setExpandedCategories(newExpanded);
                        }}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors bg-gradient-to-r from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <div className="text-base font-bold text-black dark:text-white">{category.name}</div>
                            <div className="text-xs text-gray-500">{filteredMedicines.length} {filteredMedicines.length === 1 ? 'medicine' : 'medicines'}</div>
                          </div>
                        </div>
                        <div className={`transform transition-transform ${expandedCategories[categoryIndex] ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedCategories[categoryIndex] && (
                        <div className="border-t-2 border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-zinc-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMedicines.map((medicine, medicineIndex) => (
                              <div key={medicineIndex} className="group relative p-4 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all duration-200 hover:border-cyan-500 dark:hover:border-cyan-400">
                                {/* Favorite Star */}
                                <button
                                  onClick={() => {
                                    if (favoriteMedicines.includes(medicine.name)) {
                                      setFavoriteMedicines(prev => prev.filter(n => n !== medicine.name));
                                    } else {
                                      setFavoriteMedicines(prev => [...prev, medicine.name]);
                                    }
                                  }}
                                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                  <svg className={`w-5 h-5 ${favoriteMedicines.includes(medicine.name) ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} fill={favoriteMedicines.includes(medicine.name) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>

                                <div className="flex-1 mb-3">
                                  <div className="text-base font-bold text-black dark:text-white mb-1">{medicine.name}</div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="text-xs">{medicine.dose}</Badge>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentStock = medicineStock[medicine.name] || { status: medicine.stock, quantity: 30 };
                                        const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];
                                        const currentIndex = statuses.indexOf(currentStock.status);
                                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                        setMedicineStock({
                                          ...medicineStock,
                                          [medicine.name]: { 
                                            status: nextStatus, 
                                            quantity: nextStatus === 'Out of Stock' ? 0 : nextStatus === 'Low Stock' ? 5 : 30 
                                          }
                                        });
                                      }}
                                      className={`text-xs px-2 py-0.5 rounded-full cursor-pointer hover:scale-105 transition-transform ${
                                        (medicineStock[medicine.name]?.status || medicine.stock) === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        (medicineStock[medicine.name]?.status || medicine.stock) === 'Low Stock' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      }`}
                                      title="Click to update stock status"
                                    >
                                      {medicineStock[medicine.name]?.status || medicine.stock}
                                      {medicineStock[medicine.name]?.quantity !== undefined && ` (${medicineStock[medicine.name].quantity})`}
                                    </button>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFrequencyMedicine(medicine);
                                      setShowFrequencyModal(true);
                                      setSelectedTimes([]);
                                    }}
                                    className="text-xs text-gray-600 dark:text-gray-400 mb-2 hover:text-cyan-600 dark:hover:text-cyan-400 underline decoration-dotted cursor-pointer transition-colors"
                                    title="Click to customize frequency"
                                  >
                                    📅 {customFrequency[medicine.name] || medicine.frequency}
                                  </button>
                                  <div className="text-xs text-gray-500 italic">{medicine.uses}</div>
                                </div>
                                
                                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <div className="text-sm font-bold text-cyan-600">₹{medicine.price}</div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setSelectedMedicine(medicine)}
                                      className="px-3 py-1.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-xs font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                      title="View details"
                                    >
                                      ℹ️
                                    </button>
                                    <button 
                                      onClick={() => addToCart(medicine)}
                                      disabled={medicine.stock === 'Out of Stock'}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        medicine.stock === 'Out of Stock' 
                                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                          : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-md'
                                      }`}
                                    >
                                      + Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Frequency Customization Modal */}
              {showFrequencyModal && frequencyMedicine && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full shadow-2xl border-2 border-gray-300 dark:border-gray-700">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-black dark:text-white mb-1">Customize Frequency</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{frequencyMedicine.name}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowFrequencyModal(false);
                            setFrequencyMedicine(null);
                            setSelectedTimes([]);
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Preset Frequencies */}
                      <div className="space-y-3 mb-4">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Select</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Once daily', value: 'Once daily' },
                            { label: 'Twice daily', value: '2 times daily' },
                            { label: 'Three times', value: '3 times daily' },
                            { label: 'Four times', value: '4 times daily' },
                            { label: 'Every 8 hours', value: 'Every 8 hours' },
                            { label: 'As needed', value: 'As needed' },
                            { label: 'Before meals', value: 'Before meals' },
                            { label: 'After meals', value: 'After meals' },
                          ].map((freq) => (
                            <button
                              key={freq.value}
                              onClick={() => {
                                setCustomFrequency({
                                  ...customFrequency,
                                  [frequencyMedicine.name]: freq.value
                                });
                              }}
                              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                (customFrequency[frequencyMedicine.name] || frequencyMedicine.frequency) === freq.value
                                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                                  : 'border-gray-300 dark:border-gray-700 hover:border-cyan-400 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {freq.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Times */}
                      <div className="space-y-3 mb-6">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Set Reminder Times</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['08:00', '12:00', '16:00', '20:00', '09:00', '13:00', '17:00', '21:00', '10:00'].map((time) => (
                            <button
                              key={time}
                              onClick={() => {
                                if (selectedTimes.includes(time)) {
                                  setSelectedTimes(selectedTimes.filter(t => t !== time));
                                } else {
                                  setSelectedTimes([...selectedTimes, time]);
                                }
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedTimes.includes(time)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                              }`}
                            >
                              ⏰ {time}
                            </button>
                          ))}
                        </div>
                        {selectedTimes.length > 0 && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                              {selectedTimes.length} reminder{selectedTimes.length > 1 ? 's' : ''} set: {selectedTimes.sort().join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowFrequencyModal(false);
                            setFrequencyMedicine(null);
                            setSelectedTimes([]);
                          }}
                          className="flex-1 h-11 rounded-lg font-medium bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Set reminders for selected times
                            if (selectedTimes.length > 0) {
                              selectedTimes.forEach(time => {
                                const reminder: Reminder = {
                                  id: Date.now().toString() + Math.random(),
                                  text: `Take ${frequencyMedicine.name} (${frequencyMedicine.dose})`,
                                  time: time,
                                  done: false
                                };
                                setReminders(prev => [...prev, reminder]);
                              });
                            }
                            setShowFrequencyModal(false);
                            setFrequencyMedicine(null);
                            setSelectedTimes([]);
                          }}
                          className="flex-1 h-11 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition-all"
                        >
                          Save & Set Reminders
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medicine Details Modal */}
              {selectedMedicine && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full shadow-2xl border-2 border-gray-300 dark:border-gray-700">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-black dark:text-white mb-1">{selectedMedicine.name}</h3>
                          <Badge className="text-sm">{selectedMedicine.category}</Badge>
                        </div>
                        <button 
                          onClick={() => setSelectedMedicine(null)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Dosage</div>
                          <div className="text-base text-black dark:text-white">{selectedMedicine.dose}</div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency</div>
                          <div className="flex items-center gap-2">
                            <div className="text-base text-black dark:text-white">
                              {customFrequency[selectedMedicine.name] || selectedMedicine.frequency}
                            </div>
                            <button
                              onClick={() => {
                                setFrequencyMedicine(selectedMedicine);
                                setShowFrequencyModal(true);
                                setSelectedMedicine(null);
                                setSelectedTimes([]);
                              }}
                              className="text-xs px-2 py-1 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                            >
                              ✏️ Change
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Uses</div>
                          <div className="text-base text-black dark:text-white">{selectedMedicine.uses}</div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Availability</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm px-3 py-1 rounded-full ${
                              (medicineStock[selectedMedicine.name]?.status || selectedMedicine.stock) === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              (medicineStock[selectedMedicine.name]?.status || selectedMedicine.stock) === 'Low Stock' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {medicineStock[selectedMedicine.name]?.status || selectedMedicine.stock}
                              {medicineStock[selectedMedicine.name]?.quantity !== undefined && ` (${medicineStock[selectedMedicine.name].quantity} pills)`}
                            </span>
                            <button
                              onClick={() => {
                                const currentStock = medicineStock[selectedMedicine.name] || { status: selectedMedicine.stock, quantity: 30 };
                                const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];
                                const currentIndex = statuses.indexOf(currentStock.status);
                                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                setMedicineStock({
                                  ...medicineStock,
                                  [selectedMedicine.name]: { 
                                    status: nextStatus, 
                                    quantity: nextStatus === 'Out of Stock' ? 0 : nextStatus === 'Low Stock' ? 5 : 30 
                                  }
                                });
                              }}
                              className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              🔄 Update
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Price</div>
                          <div className="text-2xl font-bold text-cyan-600">₹{selectedMedicine.price}</div>
                          <div className="text-xs text-gray-500 mt-1">* Approximate price for reference</div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => {
                            addToCart(selectedMedicine);
                            setSelectedMedicine(null);
                          }}
                          disabled={selectedMedicine.stock === 'Out of Stock'}
                          className={`flex-1 h-12 rounded-lg font-semibold transition-all ${
                            selectedMedicine.stock === 'Out of Stock'
                              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg'
                          }`}
                        >
                          Add to List
                        </button>
                        <button
                          onClick={() => {
                            addMedicineReminder(selectedMedicine);
                            setSelectedMedicine(null);
                          }}
                          className="flex-1 h-12 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          ⏰ Set Reminder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prescription Tracking Section */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-lg font-semibold text-black dark:text-white">My Prescriptions</div>
                  <div className="text-sm text-gray-500 mt-1">Track your medications and dosage schedule</div>
                </div>
                <button 
                  onClick={() => {
                    setShowPrescriptionForm(true);
                    setCurrentMedicines([]);
                    setNewMedicine({ name: '', dosage: '', frequency: '2 times daily', duration: '', instructions: '' });
                    setNewPrescription({ doctorName: '', reason: '', prescriptionDate: new Date().toISOString().split('T')[0], reportId: '', comments: '' });
                  }}
                  className="h-10 px-4 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-md border-2 border-black dark:border-white"
                >
                  + Add Prescription
                </button>
              </div>

              {/* Prescriptions Preview Grid */}
              {prescriptions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="text-gray-500 text-lg mb-2">No prescriptions added yet</div>
                  <div className="text-gray-400 text-sm">Add your first prescription to start tracking</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prescriptions.map((prescription) => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayLog = prescription.takenLog.filter(log => log.date === today);
                    
                    return (
                      <div 
                        key={prescription.id} 
                        onClick={() => setSelectedPrescriptionView(prescription)}
                        className="relative bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-none p-5 shadow-lg font-mono cursor-pointer hover:shadow-2xl hover:scale-102 transition-all duration-200"
                      >
                        {/* Delete Button */}
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this prescription?')) {
                                setPrescriptions(prev => prev.filter(p => p.id !== prescription.id));
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Preview Card Content */}
                        <div className="text-3xl font-bold mb-2 text-black dark:text-white">℞</div>
                        <div className="border-b-2 border-black dark:border-white pb-3 mb-3">
                          <div className="text-base font-bold text-black dark:text-white mb-1">Dr. {prescription.doctorName}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{new Date(prescription.prescriptionDate).toLocaleDateString()}</div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">DIAGNOSIS</div>
                          <div className="text-sm font-semibold text-black dark:text-white line-clamp-2">{prescription.reason}</div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">MEDICINES</div>
                          <div className="space-y-1">
                            {prescription.medicines.slice(0, 3).map((med) => (
                              <div key={med.id} className="text-xs text-black dark:text-white">
                                • {med.name} - {med.dosage}
                              </div>
                            ))}
                            {prescription.medicines.length > 3 && (
                              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                +{prescription.medicines.length - 3} more...
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                          <div className="text-xs font-bold text-center text-gray-500 dark:text-gray-400">
                            Click to view full prescription →
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional functional placeholders (UI only, no handlers) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
         

          
        </div>
      </div>

      {/* Floating Lab Form Modal */}
      {showLabForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <svg className="w-5 h-5 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">Add Lab Result</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enter your lab test results to update your lipid profile</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowLabForm(false);
                  setNewLabName("");
                  setNewLabValue("");
                  setNewLabDate("");
                  setNewLabUnit("mg/dL");
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="modal-lab-name" className="text-sm font-medium text-black dark:text-white mb-2 block">Lab Type *</Label>
                  <select
                    id="modal-lab-name"
                    value={newLabName}
                    onChange={(e) => setNewLabName(e.target.value)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select lab type</option>
                    <option value="HDL">HDL Cholesterol</option>
                    <option value="LDL">LDL Cholesterol</option>
                    <option value="Triglycerides">Triglycerides</option>
                    <option value="Total Cholesterol">Total Cholesterol</option>
                    <option value="Glucose">Glucose</option>
                    <option value="HbA1c">HbA1c</option>
                    <option value="Other">Other</option>
                  </select>
                  {newLabName === "Other" && (
                    <Input
                      placeholder="Enter custom lab name"
                      value={newLabName}
                      onChange={(e) => setNewLabName(e.target.value)}
                      className="mt-2 h-12 text-sm border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
                
                <div>
                  <Label htmlFor="modal-lab-value" className="text-sm font-medium text-black dark:text-white mb-2 block">Value *</Label>
                  <Input
                    id="modal-lab-value"
                    type="number"
                    placeholder="Enter value"
                    value={newLabValue}
                    onChange={(e) => setNewLabValue(e.target.value)}
                    className="h-12 text-sm border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="modal-lab-date" className="text-sm font-medium text-black dark:text-white mb-2 block">Date *</Label>
                  <div className="relative">
                    <Input
                      id="modal-lab-date"
                      type="date"
                      value={newLabDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewLabDate(e.target.value)}
                      onClick={() => {
                        const input = document.getElementById('modal-lab-date') as HTMLInputElement;
                        if (input && input.showPicker) {
                          input.showPicker();
                        }
                      }}
                      className="h-12 text-sm border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 cursor-pointer"
                      placeholder="Select date"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <CalendarDays className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setNewLabDate(new Date().toISOString().split('T')[0])}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
                      >
                        📅 Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          setNewLabDate(yesterday.toISOString().split('T')[0]);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Yesterday
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const lastWeek = new Date();
                          lastWeek.setDate(lastWeek.getDate() - 7);
                          setNewLabDate(lastWeek.toISOString().split('T')[0]);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Last Week
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="modal-lab-unit" className="text-sm font-medium text-black dark:text-white mb-2 block">Unit</Label>
                  <select
                    id="modal-lab-unit"
                    value={newLabUnit}
                    onChange={(e) => setNewLabUnit(e.target.value)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                    <option value="%">%</option>
                    <option value="g/dL">g/dL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-300 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowLabForm(false);
                  setNewLabName("");
                  setNewLabValue("");
                  setNewLabDate("");
                  setNewLabUnit("mg/dL");
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addLabEntry}
                className="px-6 py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-sm rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Add Lab Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Prompt Modal */}
      <SignInPromptModal 
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
      />
      
      {/* All Labs Modal */}
      {showLabsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">All Lab Results</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total: {labData.length} results</p>
              </div>
              <button
                onClick={() => setShowLabsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable with bottom padding */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labData.map((lab) => {
                  const status = getLabStatus(lab);
                  const isNormal = status === "normal";
                  const isLipid = ['HDL', 'LDL', 'Triglycerides', 'Total Cholesterol'].includes(lab.name);
                  
                  return (
                    <div
                      key={lab.id}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-lg ${
                        isNormal 
                          ? 'border-gray-300 dark:border-gray-700 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/40' 
                          : 'border-gray-400 dark:border-gray-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            isNormal ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div className="font-bold text-base text-black dark:text-white">{lab.name}</div>
                          {isLipid && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full font-semibold">
                              Lipid
                            </span>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (session?.user?.email) {
                              try {
                                await deleteLabFromServer(lab.id);
                                const updatedLabs = labData.filter(l => l.id !== lab.id);
                                setLabData(updatedLabs);
                                if (isLocalStorageAvailable()) {
                                  safeSetItem("alephra.labs", updatedLabs);
                                }
                              } catch (error) {
                                console.error('Failed to delete from server:', error);
                                const updatedLabs = labData.filter(l => l.id !== lab.id);
                                setLabData(updatedLabs);
                                if (isLocalStorageAvailable()) {
                                  safeSetItem("alephra.labs", updatedLabs);
                                }
                              }
                            } else {
                              const updatedLabs = labData.filter(l => l.id !== lab.id);
                              setLabData(updatedLabs);
                              if (isLocalStorageAvailable()) {
                                safeSetItem("alephra.labs", updatedLabs);
                              }
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition flex-shrink-0"
                          title="Delete lab result"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-2">
                        <div className="text-3xl font-bold text-black dark:text-white">
                          {lab.value} <span className="text-lg font-medium text-gray-600 dark:text-gray-400">{lab.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="text-gray-600 dark:text-gray-400">
                          Normal: {lab.normalRange.min}-{lab.normalRange.max} {lab.unit}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500 dark:text-gray-500">
                          {new Date(lab.date).toLocaleDateString()}
                        </div>
                        {lab.category && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            {lab.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {labData.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No lab results yet</p>
                  <p className="text-sm mt-2">Add your first lab result to get started</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Sticky at bottom */}
            <div className="sticky bottom-0 p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => exportLabsToCSV(labData)}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium"
              >
                Export All to CSV
              </button>
              <button
                onClick={() => setShowLabsModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Onboarding Tour */}
      <OnboardingTour
        steps={onboardingSteps}
        onComplete={() => {
          setShowOnboarding(false);
          toast({
            title: "Welcome aboard! 🎉",
            description: "You're all set to start using Alephra.",
          });
        }}
        onSkip={() => {
          setShowOnboarding(false);
          toast({
            title: "Skipped tutorial",
            description: "You can always restart it from settings.",
          });
        }}
        storageKey="alephra-onboarding-completed"
      />

      {/* Add Prescription Form Modal */}
      {showPrescriptionForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-black dark:border-white rounded-none">
            {/* Modal Header */}
            <div className="sticky top-0 bg-black dark:bg-white text-white dark:text-black p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">℞ New Prescription</div>
                  <p className="text-sm opacity-75">Fill in the prescription details</p>
                </div>
                <button
                  onClick={() => {
                    setShowPrescriptionForm(false);
                    setCurrentMedicines([]);
                    setNewMedicine({ name: '', dosage: '', frequency: '2 times daily', duration: '', instructions: '' });
                    setNewPrescription({ doctorName: '', reason: '', prescriptionDate: new Date().toISOString().split('T')[0], reportId: '', comments: '' });
                  }}
                  className="p-2 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6 font-mono">
              {/* Prescription Header Info */}
              <div className="space-y-4 pb-6 border-b-2 border-gray-300 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-2">
                      DOCTOR NAME *
                    </label>
                    <input
                      type="text"
                      value={newPrescription.doctorName}
                      onChange={(e) => setNewPrescription({ ...newPrescription, doctorName: e.target.value })}
                      placeholder="Dr. John Doe"
                      className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-2">
                      PRESCRIPTION DATE *
                    </label>
                    <input
                      type="date"
                      value={newPrescription.prescriptionDate}
                      onChange={(e) => setNewPrescription({ ...newPrescription, prescriptionDate: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-2">
                    DIAGNOSIS / REASON FOR PRESCRIPTION *
                  </label>
                  <textarea
                    value={newPrescription.reason}
                    onChange={(e) => setNewPrescription({ ...newPrescription, reason: e.target.value })}
                    placeholder="e.g., High Blood Pressure, Diabetes Management"
                    rows={2}
                    className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-2">
                    LINK TO MEDICAL REPORT (Optional)
                  </label>
                  <select
                    value={newPrescription.reportId}
                    onChange={(e) => setNewPrescription({ ...newPrescription, reportId: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">No report linked</option>
                    {uploadedReports.map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.fileName} - {new Date(report.uploadedAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Medicines Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-black dark:text-white underline">MEDICATIONS</div>
                  <div className="text-xs text-gray-500">Added: {currentMedicines.length}</div>
                </div>

                {/* Added Medicines List */}
                {currentMedicines.length > 0 && (
                  <div className="mb-4 border-2 border-black dark:border-white p-3 bg-gray-50 dark:bg-zinc-800">
                    <table className="w-full text-xs">
                      <thead className="border-b-2 border-black dark:border-white">
                        <tr>
                          <th className="text-left p-1 font-bold">Medicine</th>
                          <th className="text-left p-1 font-bold">Dosage</th>
                          <th className="text-left p-1 font-bold">Frequency</th>
                          <th className="text-left p-1 font-bold">Duration</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMedicines.map((med) => (
                          <tr key={med.id} className="border-t border-gray-300 dark:border-gray-600">
                            <td className="p-1 font-semibold">{med.name}</td>
                            <td className="p-1">{med.dosage}</td>
                            <td className="p-1">{med.frequency}</td>
                            <td className="p-1">{med.duration}</td>
                            <td className="p-1">
                              <button
                                onClick={() => setCurrentMedicines(currentMedicines.filter(m => m.id !== med.id))}
                                className="text-red-600 hover:text-red-800 font-bold"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Medicine Form */}
                <div className="border-2 border-gray-400 dark:border-gray-600 p-4 bg-gray-50 dark:bg-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">+ Add Medicine</div>
                  
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      placeholder="e.g., Aspirin"
                      className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-white mb-1">Dosage *</label>
                      <input
                        type="text"
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                        placeholder="500mg"
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-white mb-1">Duration *</label>
                      <input
                        type="text"
                        value={newMedicine.duration}
                        onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                        placeholder="7 days"
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1">Frequency *</label>
                    <select
                      value={newMedicine.frequency}
                      onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    >
                      <option>Once daily</option>
                      <option>2 times daily</option>
                      <option>3 times daily</option>
                      <option>4 times daily</option>
                      <option>Every 6 hours</option>
                      <option>Every 8 hours</option>
                      <option>Every 12 hours</option>
                      <option>As needed</option>
                      <option>Before meals</option>
                      <option>After meals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1">Special Instructions (Optional)</label>
                    <input
                      type="text"
                      value={newMedicine.instructions}
                      onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                      placeholder="e.g., Take with food"
                      className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!newMedicine.name.trim() || !newMedicine.dosage.trim() || !newMedicine.duration.trim()) {
                        alert('Please fill in medicine name, dosage, and duration');
                        return;
                      }
                      const medicine: Medicine = {
                        id: Date.now().toString(),
                        name: newMedicine.name,
                        dosage: newMedicine.dosage,
                        frequency: newMedicine.frequency,
                        duration: newMedicine.duration,
                        instructions: newMedicine.instructions || undefined
                      };
                      setCurrentMedicines([...currentMedicines, medicine]);
                      setNewMedicine({ name: '', dosage: '', frequency: '2 times daily', duration: '', instructions: '' });
                    }}
                    className="w-full py-2 text-sm bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-80 transition"
                  >
                    + Add to List
                  </button>
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-2">
                  ADDITIONAL COMMENTS (Optional)
                </label>
                <textarea
                  value={newPrescription.comments}
                  onChange={(e) => setNewPrescription({ ...newPrescription, comments: e.target.value })}
                  placeholder="Any additional notes or comments..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-300 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowPrescriptionForm(false);
                    setCurrentMedicines([]);
                    setNewMedicine({ name: '', dosage: '', frequency: '2 times daily', duration: '', instructions: '' });
                    setNewPrescription({ doctorName: '', reason: '', prescriptionDate: new Date().toISOString().split('T')[0], reportId: '', comments: '' });
                  }}
                  className="flex-1 h-12 border-2 border-black dark:border-white text-black dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newPrescription.doctorName.trim() || !newPrescription.reason.trim()) {
                      alert('Please fill in doctor name and reason for prescription');
                      return;
                    }
                    
                    if (currentMedicines.length === 0) {
                      alert('Please add at least one medicine to the prescription');
                      return;
                    }
                    
                    const linkedReport = uploadedReports.find(report => report.id === newPrescription.reportId);
                    const prescription: PrescriptionEntry = {
                      id: Date.now().toString(),
                      doctorName: newPrescription.doctorName,
                      reason: newPrescription.reason,
                      prescriptionDate: newPrescription.prescriptionDate,
                      medicines: currentMedicines,
                      reportId: newPrescription.reportId || undefined,
                      reportName: linkedReport ? `${linkedReport.fileName} (${new Date(linkedReport.uploadedAt).toLocaleDateString()})` : undefined,
                      comments: newPrescription.comments || undefined,
                      takenLog: []
                    };

                    setPrescriptions(prev => [prescription, ...prev]);
                    setShowPrescriptionForm(false);
                    setCurrentMedicines([]);
                    setNewMedicine({ name: '', dosage: '', frequency: '2 times daily', duration: '', instructions: '' });
                    setNewPrescription({ doctorName: '', reason: '', prescriptionDate: new Date().toISOString().split('T')[0], reportId: '', comments: '' });
                    
                    toast({
                      title: "Prescription Added",
                      description: `Prescription from Dr. ${prescription.doctorName} with ${prescription.medicines.length} medicine(s) added.`
                    });
                  }}
                  className="flex-1 h-12 bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-80 transition shadow-lg"
                >
                  Save Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription View Modal */}
      {selectedPrescriptionView && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedPrescriptionView(null)}>
          <div className="bg-white dark:bg-zinc-900 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-black dark:border-white rounded-none" onClick={(e) => e.stopPropagation()}>
            {/* Full Prescription Display */}
            <div className="relative p-8 font-mono">
              <button
                onClick={() => setSelectedPrescriptionView(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition z-10"
              >
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="border-b-4 border-black dark:border-white pb-4 mb-6">
                <div className="text-5xl font-bold mb-2 text-black dark:text-white">℞</div>
                <div className="text-2xl font-bold text-black dark:text-white mb-1">Dr. {selectedPrescriptionView.doctorName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Date: {new Date(selectedPrescriptionView.prescriptionDate).toLocaleDateString()}</div>
              </div>

              {/* Patient Details / Reason */}
              <div className="mb-6 bg-gray-50 dark:bg-zinc-800 p-4 border-2 border-black dark:border-white">
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">DIAGNOSIS / REASON</div>
                <div className="text-base font-semibold text-black dark:text-white">{selectedPrescriptionView.reason}</div>
                {selectedPrescriptionView.reportName && (
                  <div className="text-xs text-gray-500 mt-2">
                    📄 Related Report: {selectedPrescriptionView.reportName}
                  </div>
                )}
              </div>

              {/* Medicines Table */}
              <div className="mb-6">
                <div className="text-sm font-bold text-black dark:text-white mb-3 underline">MEDICATIONS:</div>
                <div className="border-2 border-black dark:border-white">
                  <table className="w-full">
                    <thead className="bg-black dark:bg-white text-white dark:text-black">
                      <tr>
                        <th className="text-left p-2 text-xs font-bold border-r-2 border-white dark:border-black">S.No</th>
                        <th className="text-left p-2 text-xs font-bold border-r-2 border-white dark:border-black">Medicine Name</th>
                        <th className="text-left p-2 text-xs font-bold border-r-2 border-white dark:border-black">Dosage</th>
                        <th className="text-left p-2 text-xs font-bold border-r-2 border-white dark:border-black">Frequency</th>
                        <th className="text-left p-2 text-xs font-bold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescriptionView.medicines.map((med, idx) => (
                        <tr key={med.id} className="border-t-2 border-black dark:border-white">
                          <td className="p-2 text-sm font-bold border-r-2 border-black dark:border-white text-black dark:text-white">{idx + 1}</td>
                          <td className="p-2 text-sm font-semibold border-r-2 border-black dark:border-white text-black dark:text-white">{med.name}</td>
                          <td className="p-2 text-sm border-r-2 border-black dark:border-white text-black dark:text-white">{med.dosage}</td>
                          <td className="p-2 text-sm border-r-2 border-black dark:border-white text-black dark:text-white">{med.frequency}</td>
                          <td className="p-2 text-sm text-black dark:text-white">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Individual medicine instructions */}
                {selectedPrescriptionView.medicines.some(m => m.instructions) && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-bold text-black dark:text-white">Special Instructions:</div>
                    {selectedPrescriptionView.medicines.map((med) => 
                      med.instructions ? (
                        <div key={med.id} className="text-xs text-gray-700 dark:text-gray-300">
                          • {med.name}: <span className="italic">{med.instructions}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>

              {/* Comments */}
              {selectedPrescriptionView.comments && (
                <div className="mb-6 border-l-4 border-black dark:border-white pl-4">
                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">ADDITIONAL COMMENTS:</div>
                  <div className="text-sm italic text-gray-700 dark:text-gray-300">{selectedPrescriptionView.comments}</div>
                </div>
              )}

              {/* Tracking Today's Intake */}
              <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-black dark:text-white">TODAY&apos;S INTAKE LOG:</span>
                  <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedPrescriptionView.medicines.map((med) => {
                    const today = new Date().toISOString().split('T')[0];
                    const medLogs = selectedPrescriptionView.takenLog.filter(log => log.medicineId === med.id && log.date === today);
                    return (
                      <div key={med.id} className="border-2 border-gray-300 dark:border-gray-600 p-2 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-black dark:text-white truncate">{med.name}</span>
                          <button
                            onClick={() => {
                              const now = new Date();
                              const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
                              setPrescriptions(prev => prev.map(p => {
                                if (p.id === selectedPrescriptionView.id) {
                                  const updated = {
                                    ...p,
                                    takenLog: [...p.takenLog, { medicineId: med.id, date: today, time: timeStr }]
                                  };
                                  setSelectedPrescriptionView(updated);
                                  return updated;
                                }
                                return p;
                              }));
                            }}
                            className="text-xs px-2 py-1 bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-80 transition"
                          >
                            ✓
                          </button>
                        </div>
                        {medLogs.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {medLogs.map((log, idx) => (
                              <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
                                {log.time}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">Not taken yet</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


