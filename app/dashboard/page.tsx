"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Activity, Calendar, Filter } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
// Removed dropdown menu in Appointments to keep a single add button

type VitalsPoint = { time: string; hr: number; spo2: number; date: string };

function seedVitals(): VitalsPoint[] {
  const points: VitalsPoint[] = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toISOString().slice(0, 10);
    const hr = 72 + Math.round((Math.sin(i / 5) + Math.random() * 0.8) * 6);
    const spo2 = 97 + (Math.random() > 0.8 ? -1 : 0);
    points.push({ time: label, hr, spo2, date: label });
  }
  return points;
}

const labsData = [
  { name: "Glucose", value: 110 },
  { name: "HDL", value: 45 },
  { name: "LDL", value: 120 },
  { name: "Trig", value: 160 },
];

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
    medicines: [
      { name: "Paracetamol", dose: "500mg", frequency: "3 times daily", price: 25, category: "Pain Relief" },
      { name: "Ibuprofen", dose: "400mg", frequency: "2 times daily", price: 35, category: "Pain Relief" },
      { name: "Aspirin", dose: "75mg", frequency: "Once daily", price: 20, category: "Pain Relief" },
    ]
  },
  {
    name: "Antibiotics",
    medicines: [
      { name: "Amoxicillin", dose: "500mg", frequency: "3 times daily", price: 45, category: "Antibiotics" },
      { name: "Azithromycin", dose: "250mg", frequency: "Once daily", price: 60, category: "Antibiotics" },
      { name: "Ciprofloxacin", dose: "500mg", frequency: "2 times daily", price: 55, category: "Antibiotics" },
    ]
  },
  {
    name: "Cardiovascular",
    medicines: [
      { name: "Amlodipine", dose: "5mg", frequency: "Once daily", price: 40, category: "Cardiovascular" },
      { name: "Metoprolol", dose: "50mg", frequency: "2 times daily", price: 30, category: "Cardiovascular" },
      { name: "Lisinopril", dose: "10mg", frequency: "Once daily", price: 35, category: "Cardiovascular" },
    ]
  },
  {
    name: "Diabetes",
    medicines: [
      { name: "Metformin", dose: "500mg", frequency: "2 times daily", price: 25, category: "Diabetes" },
      { name: "Glibenclamide", dose: "5mg", frequency: "Once daily", price: 30, category: "Diabetes" },
      { name: "Insulin", dose: "10 units", frequency: "As prescribed", price: 120, category: "Diabetes" },
    ]
  },
  {
    name: "Respiratory",
    medicines: [
      { name: "Salbutamol", dose: "100mcg", frequency: "As needed", price: 50, category: "Respiratory" },
      { name: "Budesonide", dose: "200mcg", frequency: "2 times daily", price: 80, category: "Respiratory" },
      { name: "Montelukast", dose: "10mg", frequency: "Once daily", price: 45, category: "Respiratory" },
    ]
  },
  {
    name: "Gastrointestinal",
    medicines: [
      { name: "Omeprazole", dose: "20mg", frequency: "Once daily", price: 40, category: "Gastrointestinal" },
      { name: "Ranitidine", dose: "150mg", frequency: "2 times daily", price: 25, category: "Gastrointestinal" },
      { name: "Domperidone", dose: "10mg", frequency: "3 times daily", price: 30, category: "Gastrointestinal" },
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
const generateSampleData = (): HealthData[] => {
  const data: HealthData[] = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < 24; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (i * 15));
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
      spo2: Math.floor(Math.random() * 5) + 95, // 95-100%
      timestamp: currentDate.getTime()
    });
  }
  
  return data;
};

// Custom tooltip component for chart points
const CustomTooltip = ({ active, payload, label, coordinate }: any) => {
  if (active && payload && payload.length && coordinate) {
    return null; // We handle this with our custom click handler
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
const HealthMetricsChart: React.FC = () => {
  const [data, setData] = useState<HealthData[]>(generateSampleData());
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'heartRate' | 'spo2'>('both');
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [newHeartRate, setNewHeartRate] = useState('');
  const [newSpo2, setNewSpo2] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

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

  const addDataPoint = () => {
    if (newDate && newHeartRate && newSpo2) {
      const heartRate = parseInt(newHeartRate);
      const spo2 = parseInt(newSpo2);
      
      if (heartRate >= 30 && heartRate <= 200 && spo2 >= 80 && spo2 <= 100) {
        const newDataPoint: HealthData = {
          date: newDate,
          heartRate: heartRate,
          spo2: spo2,
          timestamp: new Date(newDate).getTime()
        };
        
        // Add new data point and sort by date
        const updatedData = [...data, newDataPoint].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setData(updatedData);
        setNewDate('');
        setNewHeartRate('');
        setNewSpo2('');
        setShowAddForm(false);
      } else {
        alert('Please enter valid values: Heart Rate (30-200 bpm), SpO2 (80-100%)');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
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
        
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700"
          size="sm"
        >
          <Calendar className="h-3 w-3" />
          Add Data
        </Button>
      </div>

      {/* Add Data Form */}
      {showAddForm && (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-800">
          <div className="text-sm font-medium text-black dark:text-white mb-3">Add New Health Data</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="date" className="text-xs">Date</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="heartRate" className="text-xs">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="70"
                min="30"
                max="200"
                value={newHeartRate}
                onChange={(e) => setNewHeartRate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="spo2" className="text-xs">SpO2 (%)</Label>
              <Input
                id="spo2"
                type="number"
                placeholder="98"
                min="80"
                max="100"
                value={newSpo2}
                onChange={(e) => setNewSpo2(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addDataPoint} 
                className="h-8 w-full bg-cyan-600 hover:bg-cyan-700 text-xs"
                size="sm"
              >
                Add Point
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative h-80 w-full">
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
              domain={[50, 120]}
              className="fill-gray-600 dark:fill-gray-400"
              hide={selectedMetric === 'spo2'}
              fontSize={10}
            />
            <YAxis 
              yAxisId="spo2"
              orientation="right"
              domain={[90, 100]}
              className="fill-gray-600 dark:fill-gray-400"
              hide={selectedMetric === 'heartRate'}
              fontSize={10}
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
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
            )}
            
            {(selectedMetric === 'both' || selectedMetric === 'spo2') && (
              <Line
                yAxisId="spo2"
                type="monotone"
                dataKey="spo2"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
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
    <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
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
  type Reminder = { id: string; text: string; time?: string; done: boolean };
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState("");
  const [newTime, setNewTime] = useState("");
  const [remindersStatus, setRemindersStatus] = useState<string>("");
  const [apptTitle, setApptTitle] = useState<string>("");
  const [apptDate, setApptDate] = useState<string>("");
  const [apptTime, setApptTime] = useState<string>("");
  // Appointment duration fixed to 30 minutes; input removed for a cleaner UI
  // Vitals interactive state
  const [vitals, setVitals] = useState<VitalsPoint[]>([]);
  const [vitalsRangeDays, setVitalsRangeDays] = useState<number>(30);
  const [showHr, setShowHr] = useState<boolean>(true);
  const [showSpO2, setShowSpO2] = useState<boolean>(true);
  const [newHrDate, setNewHrDate] = useState<string>("");
  const [newHrValue, setNewHrValue] = useState<string>("");
  const [newSpO2Value, setNewSpO2Value] = useState<string>("");
  // Cart functionality
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  // Dropdown state for medicine categories
  const [expandedCategories, setExpandedCategories] = useState<boolean[]>(new Array(medicineCategories.length).fill(false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("medscan.reminders");
      if (raw) setReminders(JSON.parse(raw));
    } catch {}
    // Vitals
    try {
      const rawVitals = localStorage.getItem("medscan.vitals");
      setVitals(rawVitals ? JSON.parse(rawVitals) : seedVitals());
    } catch { setVitals(seedVitals()); }
    // Cart
    try {
      const rawCart = localStorage.getItem("medscan.cart");
      if (rawCart) setCartItems(JSON.parse(rawCart));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("medscan.reminders", JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem("medscan.vitals", JSON.stringify(vitals));
    } catch {}
  }, [vitals]);

  useEffect(() => {
    try {
      localStorage.setItem("medscan.cart", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const addReminder = () => {
    if (!newReminder.trim()) return;
    const r: Reminder = { id: crypto.randomUUID(), text: newReminder.trim(), time: newTime || undefined, done: false };
    setReminders(prev => [r, ...prev]);
    setNewReminder("");
    setNewTime("");
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
  const filteredVitals = vitals.slice(-vitalsRangeDays);

  // Cart functions
  const addToCart = (medicine: any) => {
    setCartItems(prev => [...prev, { ...medicine, id: crypto.randomUUID() }]);
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          color: "#000",
        }}
      />
      {/* Ambient gradient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="container mx-auto px-4 py-10 relative">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white"><span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">MedScan</span> Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Overview of vitals, labs, meds, and care timeline</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/analysis">
                <Button variant="outline" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2"></path>
                  </svg>
                  Analysis
                </Button>
              </Link>
              <Link href="/voice">
                <Button variant="outline" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Assistant
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
        {/* Hero banner */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-900">
            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="text-sm text-cyan-700 dark:text-cyan-300 mb-1">Welcome</div>
              <div className="text-2xl md:text-3xl font-semibold text-black dark:text-white">Your health at a glance</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Track vitals, labs and care progress in one place.</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Upload Report", classes: "bg-black text-white dark:bg-white dark:text-black", href: "/report" },
            { label: "Start AI Chat", classes: "bg-cyan-600 text-white", href: "/analysis" },
            { label: "View History", classes: "bg-emerald-600 text-white", href: "/dashboard/timeline" },
            { label: "Go to Analysis", classes: "bg-slate-800 text-white", href: "/analysis" },
          ].map((b, i) => (
            <a key={i} href={b.href} className="block">
              <motion.button className={`w-full h-12 rounded-xl font-medium shadow px-4 ${b.classes}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {b.label}
              </motion.button>
            </a>
          ))}
        </div>

        {/* Medical Reminders */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-200 dark:border-gray-800 shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-black dark:text-white">Medical Reminders</div>
                
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                <input
                  value={newReminder}
                  onChange={e => setNewReminder(e.target.value)}
                  placeholder="e.g., Take Zoclar 500"
                  className="md:col-span-3 h-11 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 px-3 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="md:col-span-1 h-11 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 px-3 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button onClick={addReminder} className="h-11 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:opacity-90 transition">Add</button>
              </div>

              <div className="space-y-2">
                {reminders.length === 0 && (
                  <div className="text-sm text-gray-500">No reminders yet. Add your first one above.</div>
                )}
                {reminders.map(r => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={r.done} onChange={() => toggleReminder(r.id)} className="h-4 w-4" />
                      <div className={`text-sm ${r.done ? 'line-through text-gray-400' : 'text-black dark:text-white'}`}>{r.text}</div>
                      {r.time && <Badge variant="secondary" className="text-xs">{r.time}</Badge>}
                    </div>
                    <button onClick={() => removeReminder(r.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                  </div>
                ))}
                {remindersStatus && <div className="text-xs text-gray-500">{remindersStatus}</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-200 dark:border-gray-800 shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-black dark:text-white">Appointments</div>
                
              </div>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <div className="text-sm font-medium text-black dark:text-white mb-2">Create Appointment</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      value={apptTitle}
                      onChange={e => setApptTitle(e.target.value)}
                      placeholder="Title (e.g., Doctor Visit)"
                      className="md:col-span-2 h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 px-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="date"
                      value={apptDate}
                      onChange={e => setApptDate(e.target.value)}
                      className="h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 px-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="time"
                      value={apptTime}
                      onChange={e => setApptTime(e.target.value)}
                      className="h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 px-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    
                  </div>
                
              </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            label="Heart Rate" 
            value={vitals.length > 0 ? vitals[vitals.length - 1].hr.toString() : "86"} 
            unit="bpm" 
            accent={vitals.length > 0 && vitals[vitals.length - 1].hr > 100 ? "High" : vitals.length > 0 && vitals[vitals.length - 1].hr < 60 ? "Low" : "Normal"} 
          />
          <MetricCard 
            label="SpO2" 
            value={vitals.length > 0 ? `${vitals[vitals.length - 1].spo2}%` : "98%"} 
            accent={vitals.length > 0 && vitals[vitals.length - 1].spo2 < 95 ? "Low" : "Good"} 
          />
          <MetricCard label="Blood Pressure" value="120/80" unit="mmHg" accent="Stable" />
          <MetricCard 
            label="Heart Score" 
            value={vitals.length > 0 ? Math.max(60, Math.min(100, 100 - Math.abs(vitals[vitals.length - 1].hr - 75) * 0.5)).toFixed(0) : "94"} 
            unit="%" 
            accent="Stay healthy" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800 lg:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-black dark:text-white">Heart Rate & SpO2</div>
                <div className="flex items-center gap-2">
                  <a href="/dashboard/vitals" className="text-xs text-cyan-600">View details →</a>
                </div>
              </div>
              
              {/* Advanced Health Metrics Chart */}
              <HealthMetricsChart />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-black dark:text-white">Lipid Profile Snapshot</div>
                <a href="/dashboard/labs" className="text-xs text-cyan-600">View details →</a>
              </div>
              
              {/* Lab Values with Status Indicators */}
              <div className="space-y-2 mb-4">
                {labsData.map((lab, i) => {
                  const isNormal = (lab.name === "Glucose" && lab.value <= 100) || 
                                 (lab.name === "HDL" && lab.value >= 40) ||
                                 (lab.name === "LDL" && lab.value <= 100) ||
                                 (lab.name === "Trig" && lab.value <= 150);
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-zinc-800">
                      <div className="text-xs text-black dark:text-white">{lab.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium text-black dark:text-white">{lab.value}</div>
                        <div className={`h-2 w-2 rounded-full ${isNormal ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={labsData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#60a5fa" 
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medicine Categories Section */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-semibold text-black dark:text-white">Medicine Categories</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Cart: {cartItems.length} items</span>
                  <button 
                    onClick={() => setShowCart(!showCart)}
                    className="h-8 px-3 rounded-lg bg-cyan-600 text-white text-sm hover:opacity-90 transition"
                  >
                    View Cart
                  </button>
                </div>
              </div>

              {/* Cart Popup Modal */}
              {showCart && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="text-xl font-semibold text-black dark:text-white">Shopping Cart</h2>
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
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-gray-500 text-lg mb-2">Your cart is empty</div>
                          <div className="text-gray-400 text-sm">Add some medicines to get started</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cartItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-800">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="text-sm font-semibold text-black dark:text-white">{item.name}</div>
                                  <Badge variant="secondary">{item.dose}</Badge>
                                </div>
                                <div className="text-xs text-gray-500 mb-1">{item.frequency}</div>
                                <div className="text-xs text-gray-500">{item.category}</div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-cyan-600">₹{item.price}</div>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(index)}
                                  className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"
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

                    {/* Billing Summary */}
                    {cartItems.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-800 p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>₹{cartItems.reduce((sum, item) => sum + item.price, 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>GST (18%)</span>
                            <span>₹{Math.round(cartItems.reduce((sum, item) => sum + item.price, 0) * 0.18)}</span>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="flex justify-between text-lg font-semibold text-black dark:text-white">
                              <span>Total</span>
                              <span>₹{Math.round(cartItems.reduce((sum, item) => sum + item.price, 0) * 1.18)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                          <button 
                            onClick={() => setCartItems([])}
                            className="flex-1 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                          >
                            Clear Cart
                          </button>
                          <button 
                            onClick={() => {
                              alert('Order placed successfully! Total: ₹' + Math.round(cartItems.reduce((sum, item) => sum + item.price, 0) * 1.18));
                              setCartItems([]);
                              setShowCart(false);
                            }}
                            className="flex-1 h-12 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                          >
                            Place Order
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medicine Categories Dropdown */}
              <div className="space-y-4">
                {medicineCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="border border-gray-200 dark:border-gray-800 rounded-lg">
                    <button
                      onClick={() => {
                        const newExpanded = [...expandedCategories];
                        newExpanded[categoryIndex] = !newExpanded[categoryIndex];
                        setExpandedCategories(newExpanded);
                      }}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-black dark:text-white">{category.name}</div>
                        <Badge variant="secondary">{category.medicines.length} medicines</Badge>
                      </div>
                      <div className={`transform transition-transform ${expandedCategories[categoryIndex] ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {expandedCategories[categoryIndex] && (
                      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {category.medicines.map((medicine, medicineIndex) => (
                            <div key={medicineIndex} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-black dark:text-white">{medicine.name}</div>
                                <div className="text-xs text-gray-500">{medicine.dose} • {medicine.frequency}</div>
                                <div className="text-xs text-cyan-600">₹{medicine.price}</div>
                              </div>
                              <button 
                                onClick={() => addToCart(medicine)}
                                className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:opacity-90 transition"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Additional functional placeholders (UI only, no handlers) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         

          
        </div>
      </div>
    </div>
  );
}


