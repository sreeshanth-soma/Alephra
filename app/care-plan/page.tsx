"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { SignInPromptModal } from '@/components/ui/signin-prompt-modal';
import {
  Heart,
  Pill,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Activity,
  Stethoscope,
  FileText,
  Bell
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  startDate: string;
  endDate?: string;
  taken: boolean;
}

interface HealthGoal {
  id: string;
  title: string;
  target: string;
  current: string;
  progress: number;
  deadline: string;
  category: 'weight' | 'exercise' | 'diet' | 'vitals' | 'other';
}

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
}

export default function CarePlanPage() {
  const { data: session } = useSession();
  const [showSignInModal, setShowSignInModal] = useState(false);
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from server only (no localStorage)
  useEffect(() => {
    const loadDataFromServer = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [medsResponse, goalsResponse, apptsResponse] = await Promise.all([
          fetch('/api/care-plan/medications').then(r => r.ok ? r.json() : { medications: [] }),
          fetch('/api/care-plan/health-goals').then(r => r.ok ? r.json() : { healthGoals: [] }),
          fetch('/api/care-plan/care-appointments').then(r => r.ok ? r.json() : { appointments: [] })
        ]);

        setMedications(medsResponse.medications || []);
        setHealthGoals(goalsResponse.healthGoals || []);
        setAppointments(apptsResponse.appointments || []);
      } catch (error) {
        console.error('Error loading from server:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDataFromServer();
  }, [session]);

  // Save to server only
  const syncMedications = async (newMedications: Medication[]) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    const newMed = newMedications[newMedications.length - 1];
    
    try {
      const response = await fetch('/api/care-plan/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed)
      });

      if (response.ok) {
        // Reload all medications from server to ensure sync
        const serverMeds = await fetch('/api/care-plan/medications').then(r => r.json());
        setMedications(serverMeds.medications || []);
      }
    } catch (err) {
      console.error('Error saving medication:', err);
      alert('Failed to save medication. Please try again.');
    }
  };

  const syncHealthGoals = async (newGoals: HealthGoal[]) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    const newGoal = newGoals[newGoals.length - 1];
    
    try {
      const response = await fetch('/api/care-plan/health-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      });

      if (response.ok) {
        // Reload all goals from server to ensure sync
        const serverGoals = await fetch('/api/care-plan/health-goals').then(r => r.json());
        setHealthGoals(serverGoals.healthGoals || []);
      }
    } catch (err) {
      console.error('Error saving health goal:', err);
      alert('Failed to save health goal. Please try again.');
    }
  };

  const syncAppointments = async (newAppointments: Appointment[]) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    const newAppt = newAppointments[newAppointments.length - 1];
    
    try {
      const response = await fetch('/api/care-plan/care-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt)
      });

      if (response.ok) {
        // Reload all appointments from server to ensure sync
        const serverAppts = await fetch('/api/care-plan/care-appointments').then(r => r.json());
        setAppointments(serverAppts.appointments || []);
        
        // Also sync to dashboard appointments
        const dashboardAppts = (serverAppts.appointments || []).map((apt: Appointment) => ({
          id: apt.id,
          title: `${apt.doctor} - ${apt.specialty}`,
          date: apt.date,
          time: apt.time
        }));
        localStorage.setItem('alephra.appointments', JSON.stringify(dashboardAppts));
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      alert('Failed to save appointment. Please try again.');
    }
  };

  const toggleMedicationTaken = async (id: string) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    const medication = medications.find(m => m.id === id);
    if (!medication) return;

    try {
      const response = await fetch(`/api/care-plan/medications?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taken: !medication.taken })
      });

      if (response.ok) {
        // Reload from server
        const serverMeds = await fetch('/api/care-plan/medications').then(r => r.json());
        setMedications(serverMeds.medications || []);
      }
    } catch (err) {
      console.error('Error updating medication:', err);
    }
  };

  const deleteMedication = async (id: string) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/care-plan/medications?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Reload from server
        const serverMeds = await fetch('/api/care-plan/medications').then(r => r.json());
        setMedications(serverMeds.medications || []);
      }
    } catch (err) {
      console.error('Error deleting medication:', err);
      alert('Failed to delete medication. Please try again.');
    }
  };

  const deleteHealthGoal = async (id: string) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/care-plan/health-goals?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Reload from server
        const serverGoals = await fetch('/api/care-plan/health-goals').then(r => r.json());
        setHealthGoals(serverGoals.healthGoals || []);
      }
    } catch (err) {
      console.error('Error deleting health goal:', err);
      alert('Failed to delete health goal. Please try again.');
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/care-plan/care-appointments?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Reload from server
        const serverAppts = await fetch('/api/care-plan/care-appointments').then(r => r.json());
        setAppointments(serverAppts.appointments || []);
        
        // Also update dashboard appointments
        const dashboardAppts = (serverAppts.appointments || []).map((apt: Appointment) => ({
          id: apt.id,
          title: `${apt.doctor} - ${apt.specialty}`,
          date: apt.date,
          time: apt.time
        }));
        localStorage.setItem('alephra.appointments', JSON.stringify(dashboardAppts));
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  const calculateProgress = (current: string, target: string): number => {
    // Extract numbers from strings
    const currentNum = parseFloat(current.replace(/[^\d.]/g, ''));
    const targetNum = parseFloat(target.replace(/[^\d.]/g, ''));
    
    if (isNaN(currentNum) || isNaN(targetNum) || targetNum === 0) {
      return 0;
    }
    
    // For weight loss or reduction goals (current > target)
    if (currentNum > targetNum) {
      const totalToLose = currentNum - targetNum;
      const progress = ((currentNum - targetNum) / currentNum) * 100;
      return Math.max(0, Math.min(100, 100 - progress));
    }
    
    // For increase goals (target > current)
    const progress = (currentNum / targetNum) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getNextDose = (medication: Medication) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const time of medication.time) {
      const [hours, minutes] = time.split(':').map(Number);
      const doseTime = hours * 60 + minutes;
      
      if (doseTime > currentTime) {
        return `Next dose at ${time}`;
      }
    }
    
    return `Next dose tomorrow at ${medication.time[0]}`;
  };

  const getCategoryColor = (category: string) => {
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600';
  };

  const getDaysUntil = (date: string) => {
    const target = new Date(date);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-16 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your health space...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-16 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access your health space and sync your data across devices.
          </p>
          <button
            onClick={() => setShowSignInModal(true)}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimal Header */}
        <div className="py-8 border-b-2 border-black dark:border-white mb-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-mono text-black dark:text-white tracking-tight">
                MY HEALTH SPACE
              </h1>
              <p className="text-base font-mono text-black dark:text-white uppercase tracking-wide opacity-70 mt-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </p>
            </div>
            {session && (
              <div className="text-sm font-mono text-black dark:text-white opacity-60">
                LAST UPDATED: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 mb-12 rounded-xl overflow-hidden">
          {[
            { label: 'Medications', value: medications.length },
            { label: 'Health Goals', value: healthGoals.length },
            { label: 'Appointments', value: appointments.length },
            { label: 'Adherence', value: '92%' }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-black p-6 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
            >
              <div className="text-xs font-bold font-mono uppercase tracking-wider text-black dark:text-white opacity-60 mb-2">
                {stat.label.toUpperCase()}
              </div>
              <div className="text-3xl font-bold text-black dark:text-white">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Medications Section */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black dark:border-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center border-2 border-black dark:border-white">
                  <Pill className="w-4 h-4 text-white dark:text-black" />
                </div>
                <h2 className="text-2xl font-bold font-mono text-black dark:text-white">
                  TODAY&apos;S MEDICATIONS
                </h2>
              </div>
              <Button
                onClick={() => setShowMedicationForm(!showMedicationForm)}
                size="sm"
                variant="outline"
                className="border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono text-xs"
              >
                <Plus className="w-4 h-4 mr-2" />
                ADD NEW
              </Button>
            </div>

            {showMedicationForm && (
              <div className="p-5 bg-white dark:bg-black border-2 border-black dark:border-white mb-4">
                <h3 className="font-bold font-mono text-black dark:text-white mb-4">ADD NEW MEDICATION</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const times = formData.get('time') as string;
                  const newMedication: Medication = {
                    id: Date.now().toString(),
                    name: formData.get('name') as string,
                    dosage: formData.get('dosage') as string,
                    frequency: formData.get('frequency') as string,
                    time: times.split(',').map(t => t.trim()),
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string || undefined,
                    taken: false,
                  };
                  
                  // Reset form first
                  e.currentTarget.reset();
                  
                  await syncMedications([...medications, newMedication]);
                  setShowMedicationForm(false);
                }} className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs font-bold font-mono text-black dark:text-white uppercase">MEDICATION NAME</Label>
                    <Input id="name" name="name" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="E.G., METFORMIN" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dosage" className="text-xs font-bold font-mono text-black dark:text-white uppercase">DOSAGE</Label>
                      <Input id="dosage" name="dosage" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="E.G., 500MG" />
                    </div>
                    <div>
                      <Label htmlFor="frequency" className="text-xs font-bold font-mono text-black dark:text-white uppercase">FREQUENCY</Label>
                      <Input id="frequency" name="frequency" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="E.G., TWICE DAILY" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-xs font-bold font-mono text-black dark:text-white uppercase">TIME(S) - COMMA SEPARATED</Label>
                    <Input id="time" name="time" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="E.G., 08:00, 20:00" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="startDate" className="text-xs font-bold font-mono text-black dark:text-white uppercase">START DATE</Label>
                      <Input id="startDate" name="startDate" type="date" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-xs font-bold font-mono text-black dark:text-white uppercase">END DATE (OPTIONAL)</Label>
                      <Input id="endDate" name="endDate" type="date" className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white font-bold font-mono text-xs">ADD MEDICATION</Button>
                    <Button type="button" variant="outline" onClick={() => setShowMedicationForm(false)} className="border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono text-xs">CANCEL</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.length === 0 && !showMedicationForm && (
                <div className="col-span-2 text-center py-8 text-black dark:text-white opacity-70">
                  <p className="font-bold font-mono">NO MEDICATIONS ADDED YET. CLICK &quot;ADD NEW&quot; TO ADD ONE.</p>
                </div>
              )}
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-5 border-2 border-black dark:border-white bg-white dark:bg-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold font-mono text-lg text-black dark:text-white mb-1">
                        {med.name.toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-2 text-sm font-mono text-black dark:text-white opacity-60">
                        <span>{med.dosage.toUpperCase()}</span>
                        <span>•</span>
                        <span>{med.frequency.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          // Add today's medication to dashboard reminders
                          const dashboardReminders = localStorage.getItem('alephra.reminders');
                          const reminders = dashboardReminders ? JSON.parse(dashboardReminders) : [];
                          
                          med.time.forEach(time => {
                            reminders.push({
                              id: `${Date.now()}-${Math.random()}`,
                              text: `Take ${med.name} (${med.dosage})`,
                              time: time,
                              done: false
                            });
                          });
                          
                          localStorage.setItem('alephra.reminders', JSON.stringify(reminders));
                          alert(`Added ${med.name} to today's reminders!`);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Add to today's reminders"
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => toggleMedicationTaken(med.id)}
                        size="sm"
                        variant={med.taken ? "default" : "ghost"}
                        className={med.taken ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" : "text-gray-500 hover:text-black dark:hover:text-white"}
                      >
                        {med.taken ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700 group-hover:border-black dark:group-hover:border-white" />
                        )}
                      </Button>
                      <Button
                        onClick={() => deleteMedication(med.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-black dark:text-white opacity-60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getNextDose(med).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Goals Section */}
          <Card className="mt-6 bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black dark:border-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center border-2 border-black dark:border-white">
                      <Target className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-mono text-black dark:text-white">
                        HEALTH GOALS
                      </h2>
                      <p className="text-sm font-mono text-black dark:text-white opacity-70 uppercase">
                        TRACK YOUR PROGRESS
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowGoalForm(!showGoalForm)}
                    size="sm"
                    className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white font-bold font-mono text-xs"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ADD GOAL
                  </Button>
                </div>

                {showGoalForm && (
                  <div className="p-5 bg-white dark:bg-black border-2 border-black dark:border-white mb-4">
                    <h3 className="font-bold font-mono text-black dark:text-white mb-4">ADD NEW HEALTH GOAL</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const current = formData.get('current') as string;
                      const target = formData.get('target') as string;
                      const progress = calculateProgress(current, target);
                      
                      const newGoal: HealthGoal = {
                        id: Date.now().toString(),
                        title: formData.get('title') as string,
                        target: target,
                        current: current,
                        progress: progress,
                        deadline: formData.get('deadline') as string,
                        category: formData.get('category') as 'weight' | 'exercise' | 'diet' | 'vitals' | 'other',
                      };
                      
                      // Reset form first
                      e.currentTarget.reset();
                      
                      await syncHealthGoals([...healthGoals, newGoal]);
                      setShowGoalForm(false);
                    }} className="space-y-3">
                      <div>
                        <Label htmlFor="title" className="text-xs font-bold font-mono text-black dark:text-white uppercase">GOAL TITLE</Label>
                        <Input id="title" name="title" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="E.G., REDUCE BLOOD PRESSURE" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="current" className="text-xs font-bold font-mono text-black dark:text-white uppercase">CURRENT VALUE</Label>
                          <Input id="current" name="current" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="E.G., 135/85 MMHG" />
                        </div>
                        <div>
                          <Label htmlFor="target" className="text-xs font-bold font-mono text-black dark:text-white uppercase">TARGET VALUE</Label>
                          <Input id="target" name="target" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="E.G., 120/80 MMHG" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="category" className="text-xs font-bold font-mono text-black dark:text-white uppercase">CATEGORY</Label>
                          <select 
                            id="category" 
                            name="category" 
                            required 
                            className="mt-1 w-full h-10 px-3 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-mono"
                          >
                            <option value="vitals">VITALS</option>
                            <option value="weight">WEIGHT</option>
                            <option value="exercise">EXERCISE</option>
                            <option value="diet">DIET</option>
                            <option value="other">OTHER</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="deadline" className="text-xs font-bold font-mono text-black dark:text-white uppercase">DEADLINE</Label>
                          <Input id="deadline" name="deadline" type="date" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white font-bold font-mono text-xs">ADD GOAL</Button>
                        <Button type="button" variant="outline" onClick={() => setShowGoalForm(false)} className="border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono text-xs">CANCEL</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {healthGoals.length === 0 && !showGoalForm && (
                    <div className="text-center py-8 text-black dark:text-white opacity-70">
                      <p className="font-bold font-mono">NO HEALTH GOALS SET YET. CLICK &quot;ADD GOAL&quot; TO CREATE ONE.</p>
                    </div>
                  )}
                  {healthGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-4 border-2 border-black dark:border-white bg-white dark:bg-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold font-mono text-black dark:text-white">
                              {goal.title.toUpperCase()}
                            </h3>
                            <Badge className={`${getCategoryColor(goal.category)} font-bold font-mono text-xs uppercase`}>
                              {goal.category.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-mono text-black dark:text-white opacity-70">
                            <span>CURRENT: <strong>{goal.current.toUpperCase()}</strong></span>
                            <span>→</span>
                            <span>TARGET: <strong>{goal.target.toUpperCase()}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold font-mono text-black dark:text-white">
                              {Math.round(calculateProgress(goal.current, goal.target))}%
                            </div>
                            <div className="text-xs font-mono text-black dark:text-white opacity-60">
                              {getDaysUntil(goal.deadline)} DAYS LEFT
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteHealthGoal(goal.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-600 hover:text-white border-2 border-red-600 font-bold font-mono"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 mt-3 border border-black dark:border-white">
                        <div
                          className="bg-black dark:bg-white h-2 transition-all duration-300"
                          style={{ width: `${Math.round(calculateProgress(goal.current, goal.target))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black dark:border-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center border-2 border-black dark:border-white">
                      <Calendar className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold font-mono text-black dark:text-white">
                        APPOINTMENTS
                      </h2>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                    size="sm"
                    variant="outline"
                    className="border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showAppointmentForm && (
                  <div className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white mb-4">
                    <h3 className="font-bold font-mono text-black dark:text-white mb-4">ADD NEW APPOINTMENT</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const date = formData.get('date') as string;
                      const time = formData.get('time') as string;
                      const doctor = formData.get('doctor') as string;
                      
                      const newAppointment: Appointment = {
                        id: Date.now().toString(),
                        doctor: doctor,
                        specialty: formData.get('specialty') as string,
                        date: date,
                        time: time,
                        location: formData.get('location') as string,
                        notes: formData.get('notes') as string || undefined,
                      };
                      
                      // Reset form first (before hiding it)
                      e.currentTarget.reset();
                      
                      // Add to care plan appointments (will also sync to dashboard)
                      await syncAppointments([...appointments, newAppointment]);
                      
                      // Hide form after reset
                      setShowAppointmentForm(false);
                    }} className="space-y-3">
                      <div>
                        <Label htmlFor="doctor" className="text-xs font-bold font-mono text-black dark:text-white uppercase">DOCTOR NAME</Label>
                        <Input id="doctor" name="doctor" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="DR. JOHN SMITH" />
                      </div>
                      <div>
                        <Label htmlFor="specialty" className="text-xs font-bold font-mono text-black dark:text-white uppercase">SPECIALTY</Label>
                        <Input id="specialty" name="specialty" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="CARDIOLOGIST" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="date" className="text-xs font-bold font-mono text-black dark:text-white uppercase">DATE</Label>
                          <Input id="date" name="date" type="date" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" />
                        </div>
                        <div>
                          <Label htmlFor="time" className="text-xs font-bold font-mono text-black dark:text-white uppercase">TIME</Label>
                          <Input id="time" name="time" type="time" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-xs font-bold font-mono text-black dark:text-white uppercase">LOCATION</Label>
                        <Input id="location" name="location" required className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="CITY HOSPITAL, ROOM 204" />
                      </div>
                      <div>
                        <Label htmlFor="notes" className="text-xs font-bold font-mono text-black dark:text-white uppercase">NOTES (OPTIONAL)</Label>
                        <Input id="notes" name="notes" className="mt-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono" placeholder="FOLLOW-UP VISIT" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white font-bold font-mono text-xs">ADD APPOINTMENT</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAppointmentForm(false)} className="border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono text-xs">CANCEL</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {appointments.length === 0 && !showAppointmentForm && (
                    <div className="text-center py-8 text-black dark:text-white opacity-70">
                      <p className="font-bold font-mono">NO APPOINTMENTS SCHEDULED. CLICK + TO ADD ONE.</p>
                    </div>
                  )}
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <Stethoscope className="w-5 h-5 text-black dark:text-white mt-0.5" strokeWidth={2.5} />
                          <div className="flex-1">
                            <h3 className="font-bold font-mono text-black dark:text-white">
                              {apt.doctor.toUpperCase()}
                            </h3>
                            <p className="text-sm font-mono text-black dark:text-white opacity-60">
                              {apt.specialty.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
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
                              calendarUrl.searchParams.append('text', `${apt.doctor} - ${apt.specialty}`);
                              calendarUrl.searchParams.append('dates', `${formatDateTime(appointmentDateTime)}/${formatDateTime(endDateTime)}`);
                              calendarUrl.searchParams.append('details', `Appointment with ${apt.doctor}\nSpecialty: ${apt.specialty}\nLocation: ${apt.location}${apt.notes ? `\nNotes: ${apt.notes}` : ''}`);
                              
                              window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer');
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Add to Google Calendar"
                          >
                            📅
                          </Button>
                          <Button
                            onClick={() => deleteAppointment(apt.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="ml-8 space-y-1 text-sm font-mono">
                        <div className="flex items-center gap-2 text-black dark:text-white opacity-70">
                          <Calendar className="w-3 h-3" strokeWidth={2.5} />
                          {new Date(apt.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })} at {apt.time}
                        </div>
                        <div className="text-black dark:text-white opacity-60">
                          📍 {apt.location}
                        </div>
                        {apt.notes && (
                          <div className="mt-2 p-2 rounded bg-white dark:bg-gray-800 text-xs">
                            {apt.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/report'}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Upload New Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View Vitals
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/voice'}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Ask AI Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </div>
  );
}
