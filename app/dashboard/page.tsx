/* eslint-disable react/no-unescaped-entities */
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
import { Heart, Activity, Calendar, Filter, CalendarDays } from "lucide-react";
import { Noise } from "@/components/ui/noise";
import { useSession } from "next-auth/react";
import { safeGetItem, safeSetItem, safeRemoveItem, clearAllMedScanData, isLocalStorageAvailable } from "@/lib/localStorage";
import { toast } from "@/components/ui/use-toast";
// Removed dropdown menu in Appointments to keep a single add button

type VitalsPoint = { time: string; hr: number; spo2: number; date: string; bp?: { systolic: number; diastolic: number }; weight?: number; temperature?: number };

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

type LabData = { 
  id: string; 
  name: string; 
  value: number; 
  unit: string; 
  date: string; 
  normalRange: { min: number; max: number }; 
  category: string;
};

const initialLabsData: LabData[] = [
  { id: "1", name: "Glucose", value: 110, unit: "mg/dL", date: new Date().toISOString().split('T')[0], normalRange: { min: 70, max: 100 }, category: "Metabolic" },
  { id: "2", name: "HDL", value: 45, unit: "mg/dL", date: new Date().toISOString().split('T')[0], normalRange: { min: 40, max: 200 }, category: "Lipid" },
  { id: "3", name: "LDL", value: 120, unit: "mg/dL", date: new Date().toISOString().split('T')[0], normalRange: { min: 0, max: 100 }, category: "Lipid" },
  { id: "4", name: "Triglycerides", value: 160, unit: "mg/dL", date: new Date().toISOString().split('T')[0], normalRange: { min: 0, max: 150 }, category: "Lipid" },
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
        <div className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800">
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
  
  type Reminder = { id: string; text: string; time?: string; done: boolean };
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState("");
  const [newTime, setNewTime] = useState("");
  const [remindersStatus, setRemindersStatus] = useState<string>("");
  const [apptTitle, setApptTitle] = useState<string>("");
  const [apptDate, setApptDate] = useState<string>("");
  const [apptTime, setApptTime] = useState<string>("");
  const [appointments, setAppointments] = useState<Array<{id: string, title: string, date: string, time: string}>>([]);
  const [appointmentsStatus, setAppointmentsStatus] = useState<string>("");
  const [showRemindersModal, setShowRemindersModal] = useState<boolean>(false);
  const clearAllReminders = () => {
    const ok = typeof window !== 'undefined' ? window.confirm('Remove all reminders? This cannot be undone.') : true;
    if (!ok) return;
    setReminders([]);
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
  // Flag to prevent saving empty data on initial load
  const [isInitialized, setIsInitialized] = useState(false);
  // Show all labs or just recent ones
  const [showAllLabs, setShowAllLabs] = useState(false);
  // Lab chart filter
  const [selectedLabType, setSelectedLabType] = useState<'all' | 'HDL' | 'LDL' | 'Triglycerides' | 'Total Cholesterol'>('all');

  useEffect(() => {
    // Clear any existing default/seeded data first
    if (isLocalStorageAvailable()) {
      // Clear old seeded vitals data
      const rawVitals = safeGetItem("medscan.vitals", []);
      if (Array.isArray(rawVitals) && rawVitals.length === 60) {
        safeRemoveItem("medscan.vitals");
      }
      
      // Clear old default lab data
      const rawLabs = safeGetItem<LabData[]>("medscan.labs", []);
      if (Array.isArray(rawLabs) && rawLabs.length === 4 && rawLabs[0]?.id === "1") {
        safeRemoveItem("medscan.labs");
      }
    }

    // Now load data (will be empty if no real data exists)
    if (isLocalStorageAvailable()) {
      setReminders(safeGetItem<Reminder[]>("medscan.reminders", []));
      setVitals(safeGetItem<VitalsPoint[]>("medscan.vitals", []));
      setCartItems(safeGetItem<any[]>("medscan.cart", []));
      setLabData(safeGetItem<LabData[]>("medscan.labs", []));
      setAppointments(safeGetItem<Array<{id: string, title: string, date: string, time: string}>>("medscan.appointments", []));
    } else {
      // Fallback when localStorage is not available
      setReminders([]);
      setVitals([]);
      setCartItems([]);
      setLabData([]);
      setAppointments([]);
    }
    
    // Mark as initialized after loading
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("medscan.reminders", reminders);
      if (!success) {
        toast({
          title: "Storage Warning",
          description: "Failed to save reminders. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [reminders, isInitialized]);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("medscan.vitals", vitals);
      if (!success) {
        toast({
          title: "Storage Warning", 
          description: "Failed to save vitals. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [vitals, isInitialized]);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("medscan.cart", cartItems);
      if (!success) {
        toast({
          title: "Storage Warning",
          description: "Failed to save cart items. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [cartItems, isInitialized]);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("medscan.labs", labData);
      if (!success) {
        toast({
          title: "Storage Warning",
          description: "Failed to save lab data. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [labData, isInitialized]);

  useEffect(() => {
    if (isInitialized && isLocalStorageAvailable()) {
      const success = safeSetItem("medscan.appointments", appointments);
      if (!success) {
        toast({
          title: "Storage Warning",
          description: "Failed to save appointments. Your data may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [appointments, isInitialized]);

  const addReminder = async () => {
    if (!newReminder.trim()) return;
    
    // Create local reminder
    const r: Reminder = { id: crypto.randomUUID(), text: newReminder.trim(), time: newTime || undefined, done: false };
    setReminders(prev => [r, ...prev]);
    
    // Show immediate feedback
    setRemindersStatus("Adding reminder to Google Calendar...");
    
    // Try to sync with Google Calendar if user is signed in and time is provided
    if (newTime) {
      try {
        // Build a timezone-agnostic local datetime string (YYYY-MM-DDTHH:mm:SS) and send the IANA timeZone separately.
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

        const pad = (n: number) => String(n).padStart(2, "0");
        const localDateStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
        const localTimeStr = `${pad(hours)}:${pad(minutes)}:00`;
        const localDateTime = `${localDateStr}T${localTimeStr}`; // No Z, no offset

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("Frontend reminder creation:", { localDateTime, tz });
        
        const response = await fetch('/api/reminders/calendar-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newReminder.trim(),
            description: `Medical reminder created via MedScan`,
            reminderLocal: localDateTime,
            timeZone: tz,
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setRemindersStatus(`✅ Reminder added to Google Calendar! Check your calendar app.`);
        } else {
          setRemindersStatus(`⚠️ Reminder saved locally. ${result.error || 'Calendar sync failed'}`);
        }
      } catch (error) {
        console.error('Calendar sync error:', error);
        setRemindersStatus("⚠️ Reminder saved locally. Calendar sync unavailable.");
      }
    } else {
      setRemindersStatus("✅ Reminder added! Add a time to sync with Google Calendar.");
    }
    
    // Clear the status message after 5 seconds
    setTimeout(() => setRemindersStatus(""), 5000);
    
    setNewReminder("");
    setNewTime("");
  };

  const addAppointment = async () => {
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
    
    // Show immediate feedback
    if (session?.user) {
      setAppointmentsStatus("Adding appointment to Google Calendar...");
    } else {
      setAppointmentsStatus("Appointment saved locally. Sign in to sync with Google Calendar.");
    }
    
    // Try to sync with Google Calendar if user is signed in
    if (session?.user) {
      try {
      // Create a datetime for the appointment
      const appointmentDateTime = new Date(`${apptDate}T${apptTime}`);
      const endDateTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // 30 minutes duration
      
      const response = await fetch('/api/reminders/calendar-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `📅 ${apptTitle.trim()}`,
          description: `Appointment: ${apptTitle.trim()}\n\nCreated by MedScan AI Healthcare Assistant`,
          reminderTime: appointmentDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setAppointmentsStatus(`✅ Appointment added to Google Calendar! Check your calendar app.`);
      } else {
        if (result.error?.includes("Unauthorized") || result.error?.includes("No Google access token")) {
          setAppointmentsStatus(`⚠️ Please sign in with Google to sync appointments to your calendar.`);
        } else {
          setAppointmentsStatus(`⚠️ Appointment saved locally. Calendar sync failed: ${result.error || 'Unknown error'}`);
        }
      }
      } catch (error) {
        console.error('Appointment calendar sync error:', error);
        setAppointmentsStatus(`⚠️ Appointment saved locally. Calendar sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
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
  const filteredVitals = vitals.slice(-vitalsRangeDays);

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

  const addVitalsEntry = () => {
    const hr = Number(newHrValue);
    const spo2 = Number(newSpO2Value) || 98;
    const systolic = Number(newBpSystolic);
    const diastolic = Number(newBpDiastolic);
    const weight = Number(newWeight);
    const temperature = Number(newTemperature);
    
    if (!newHrDate || !Number.isFinite(hr) || hr < 30 || hr > 200) {
      setRemindersStatus("Please enter valid Heart Rate (30-200 bpm)");
      return;
    }
    
    if (spo2 < 80 || spo2 > 100) {
      setRemindersStatus("Please enter valid SpO2 (80-100%)");
      return;
    }
    
    const point: VitalsPoint = {
      time: newHrDate,
      date: newHrDate,
      hr,
      spo2,
      ...(systolic && diastolic && { bp: { systolic, diastolic } }),
      ...(weight && { weight }),
      ...(temperature && { temperature })
    };
    
    setVitals(prev => [...prev.filter(p => p.date !== newHrDate), point].sort((a, b) => a.date.localeCompare(b.date)));
    
    // Clear form
    setNewHrDate("");
    setNewHrValue("");
    setNewSpO2Value("");
    setNewBpSystolic("");
    setNewBpDiastolic("");
    setNewWeight("");
    setNewTemperature("");
    setShowVitalsForm(false);
    
    setRemindersStatus("Vitals data added successfully!");
    setTimeout(() => setRemindersStatus(""), 3000);
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

  const addLabEntry = () => {
    console.log("Adding lab entry:", { newLabName, newLabValue, newLabDate, newLabUnit });
    
    if (!newLabName.trim() || !newLabValue || !newLabDate) {
      setRemindersStatus("Please fill in all required fields");
      return;
    }

    const value = Number(newLabValue);
    if (!Number.isFinite(value) || value < 0) {
      setRemindersStatus("Please enter a valid lab value");
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

    const newLab: LabData = {
      id: crypto.randomUUID(),
      name: newLabName.trim(),
      value,
      unit: newLabUnit,
      date: newLabDate,
      normalRange,
      category
    };

    console.log("New lab data:", newLab);
    setLabData(prev => {
      const updated = [...prev, newLab].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      console.log("Updated lab data:", updated);
      return updated;
    });
    
    // Clear form
    setNewLabName("");
    setNewLabValue("");
    setNewLabDate("");
    setNewLabUnit("mg/dL");
    setShowLabForm(false);
    
    setRemindersStatus("Lab data added successfully!");
    setTimeout(() => setRemindersStatus(""), 3000);
  };

  const removeLabEntry = (id: string) => {
    setLabData(prev => prev.filter(lab => lab.id !== id));
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
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white"><span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">MedScan</span> Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Overview of vitals, labs, meds, and care timeline</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const success = clearAllMedScanData();
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
          <div className="relative overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-900">
            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="text-sm text-cyan-700 dark:text-cyan-300 mb-1">Welcome</div>
              <div className="text-2xl md:text-3xl font-semibold text-black dark:text-white">Your health at a glance</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Track vitals, labs and care progress in one place.</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Upload Report", classes: "bg-black text-white dark:bg-white dark:text-black", href: "/report" },
            { label: "View History", classes: "bg-emerald-600 text-white", href: "/dashboard/timeline" },
            { label: "Voice Assistant", classes: "bg-indigo-600 text-white", href: "/voice" },
            { label: "Analysis", classes: "bg-orange-600 text-white", href: "/analysis" },
          ].map((b, i) => (
            <a key={i} href={b.href} className="block">
              <motion.button className={`w-full h-14 rounded-xl font-medium shadow px-6 border border-gray-300 dark:border-gray-700 ${b.classes}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {b.label}
              </motion.button>
            </a>
          ))}
        </div>

        {/* Medical Reminders */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-300 dark:border-gray-700 shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-black dark:text-white">Medical Reminders</div>
                <div className="flex items-center gap-3">
                  <button onClick={clearAllReminders} className="text-xs text-red-600 hover:underline">Remove all</button>
                  <div className="text-xs text-gray-500 dark:text-gray-400">📅 Syncs with Google Calendar</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                <input
                  value={newReminder}
                  onChange={e => setNewReminder(e.target.value)}
                  placeholder="e.g., Take Zoclar 500"
                  className="md:col-span-3 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-3 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  placeholder="Time"
                  title="Add time to sync with Google Calendar"
                  className="md:col-span-1 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-3 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button onClick={addReminder} className="h-11 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:opacity-90 transition">📅 Add</button>
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
                    <button onClick={() => removeReminder(r.id)} className="text-xs text-red-600 hover:underline">Remove</button>
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
                  <button onClick={clearAllReminders} className="text-xs text-red-600 hover:underline">Remove all</button>
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
                    <button onClick={() => removeReminder(r.id)} className="text-xs text-red-600 hover:underline">Remove</button>
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
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {session?.user ? (
                    <span className="text-green-600 dark:text-green-400">✅ Connected to Google Calendar</span>
                  ) : (
                    <span className="text-orange-600 dark:text-orange-400">⚠️ Sign in to sync with Google Calendar</span>
                  )}
                </div>
              </div>
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
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="time"
                      value={apptTime}
                      onChange={e => setApptTime(e.target.value)}
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      onClick={addAppointment}
                      className="h-10 px-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
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
                          <button
                            onClick={() => removeAppointment(appointment.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
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
          <MetricCard 
            label="Blood Pressure" 
            value={getBpStatus().value} 
            unit="mmHg" 
            accent={getBpStatus().status} 
          />
          <MetricCard 
            label="Health Score" 
            value={getHeartScore().toString()} 
            unit="%" 
            accent={getHeartScore() >= 90 ? "Excellent" : getHeartScore() >= 80 ? "Good" : getHeartScore() >= 70 ? "Fair" : "Needs Attention"} 
          />
          <MetricCard 
            label="Weight" 
            value={(() => {
              const latestVital = vitals[vitals.length - 1];
              return latestVital?.weight ? latestVital.weight.toString() : "70";
            })()} 
            unit="kg" 
            accent="Normal" 
          />
          <MetricCard 
            label="Temperature" 
            value={(() => {
              const latestVital = vitals[vitals.length - 1];
              return latestVital?.temperature ? latestVital.temperature.toString() : "36.5";
            })()} 
            unit="°C" 
            accent={(() => {
              const latestVital = vitals[vitals.length - 1];
              if (!latestVital?.temperature) return "Normal";
              if (latestVital.temperature > 37.5) return "Fever";
              if (latestVital.temperature < 36) return "Low";
              return "Normal";
            })()} 
          />
        </div>

        {/* Vitals Input Form */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur border-gray-300 dark:border-gray-700 shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-black dark:text-white">Record Vitals</div>
                <button
                  onClick={() => {
                    setShowVitalsForm(!showVitalsForm);
                    if (!showVitalsForm) {
                      setNewHrDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {showVitalsForm ? "Cancel" : "Add Vitals"}
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
                        className="mt-1 pr-10"
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

        {/* Lipid Profile Snapshot */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
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
                    setShowLabForm(!showLabForm);
                    if (!showLabForm) {
                      setNewLabDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
              <HealthMetricsChart />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-black dark:text-white">Lab Results</div>
                <div className="flex items-center gap-2">
                  {labData.length > 3 && (
                      <button
                      onClick={() => setShowAllLabs(!showAllLabs)}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      {showAllLabs ? 'Show Less' : `View All (${labData.length})`}
                      </button>
                  )}
                  {/* <a href="/dashboard/labs" className="text-xs text-cyan-600">View details →</a> */}
                    </div>
                  </div>
              
              
              {/* Lab Values with Enhanced Status Indicators - Show only 3 by default */}
              <div className="space-y-2 mb-4">
                {labData.slice(0, showAllLabs ? labData.length : 3).map((lab) => {
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
                <div className="text-lg font-semibold text-black dark:text-white">Medicine Categories</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Selected: {cartItems.length} items</span>
                  <button 
                    onClick={() => setShowCart(!showCart)}
                    className="h-8 px-3 rounded-lg bg-cyan-600 text-white text-sm hover:opacity-90 transition"
                  >
                    View List
                  </button>
                </div>
              </div>

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
                {medicineCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="border border-gray-300 dark:border-gray-700 rounded-lg">
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
                      <div className="border-t border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {category.medicines.map((medicine, medicineIndex) => (
                            <div key={medicineIndex} className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="h-12 text-sm border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
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
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Add Lab Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


