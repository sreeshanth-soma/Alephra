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
  const [isInitialized, setIsInitialized] = useState(false);

  // Hybrid sync: Load from localStorage first (instant), then sync with server
  useEffect(() => {
    if (isInitialized) return;

    // 1. Load from localStorage immediately (instant display)
    const savedMedications = localStorage.getItem('alephra.carePlan.medications');
    const savedGoals = localStorage.getItem('alephra.carePlan.healthGoals');
    const savedAppointments = localStorage.getItem('alephra.carePlan.appointments');
    
    if (savedMedications) {
      try {
        setMedications(JSON.parse(savedMedications));
      } catch (e) {
        console.error('Failed to parse medications:', e);
      }
    }
    
    if (savedGoals) {
      try {
        setHealthGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error('Failed to parse health goals:', e);
      }
    }
    
    if (savedAppointments) {
      try {
        setAppointments(JSON.parse(savedAppointments));
      } catch (e) {
        console.error('Failed to parse appointments:', e);
      }
    }

    // 2. If user is signed in, sync with server in background
    if (session?.user) {
      Promise.all([
        fetch('/api/care-plan/medications').then(r => r.ok ? r.json() : []),
        fetch('/api/care-plan/health-goals').then(r => r.ok ? r.json() : []),
        fetch('/api/care-plan/care-appointments').then(r => r.ok ? r.json() : [])
      ]).then(([serverMeds, serverGoals, serverAppts]) => {
        if (serverMeds.length > 0) {
          setMedications(serverMeds);
          localStorage.setItem('alephra.carePlan.medications', JSON.stringify(serverMeds));
        }
        if (serverGoals.length > 0) {
          setHealthGoals(serverGoals);
          localStorage.setItem('alephra.carePlan.healthGoals', JSON.stringify(serverGoals));
        }
        if (serverAppts.length > 0) {
          setAppointments(serverAppts);
          localStorage.setItem('alephra.carePlan.appointments', JSON.stringify(serverAppts));
        }
      }).catch(error => {
        console.error('Error syncing with server:', error);
      });
    }

    setIsInitialized(true);
  }, [session, isInitialized]);

  // Save to both localStorage and server
  const syncMedications = async (newMedications: Medication[]) => {
    setMedications(newMedications);
    localStorage.setItem('alephra.carePlan.medications', JSON.stringify(newMedications));
    
    if (session?.user) {
      // Sync to server in background
      fetch('/api/care-plan/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedications[newMedications.length - 1])
      }).catch(err => console.error('Error syncing medication:', err));
    }
  };

  const syncHealthGoals = async (newGoals: HealthGoal[]) => {
    setHealthGoals(newGoals);
    localStorage.setItem('alephra.carePlan.healthGoals', JSON.stringify(newGoals));
    
    if (session?.user) {
      fetch('/api/care-plan/health-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoals[newGoals.length - 1])
      }).catch(err => console.error('Error syncing health goal:', err));
    }
  };

  const syncAppointments = async (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('alephra.carePlan.appointments', JSON.stringify(newAppointments));
    
    if (session?.user) {
      fetch('/api/care-plan/care-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointments[newAppointments.length - 1])
      }).catch(err => console.error('Error syncing appointment:', err));
    }
  };

  const toggleMedicationTaken = async (id: string) => {
    const updatedMeds = medications.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    );
    setMedications(updatedMeds);
    localStorage.setItem('alephra.carePlan.medications', JSON.stringify(updatedMeds));
    
    if (session?.user) {
      fetch(`/api/care-plan/medications?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taken: !medications.find(m => m.id === id)?.taken })
      }).catch(err => console.error('Error updating medication:', err));
    }
  };

  const deleteMedication = async (id: string) => {
    const updatedMeds = medications.filter(med => med.id !== id);
    setMedications(updatedMeds);
    localStorage.setItem('alephra.carePlan.medications', JSON.stringify(updatedMeds));
    
    if (session?.user) {
      fetch(`/api/care-plan/medications?id=${id}`, {
        method: 'DELETE'
      }).catch(err => console.error('Error deleting medication:', err));
    }
  };

  const deleteHealthGoal = async (id: string) => {
    const updatedGoals = healthGoals.filter(goal => goal.id !== id);
    setHealthGoals(updatedGoals);
    localStorage.setItem('alephra.carePlan.healthGoals', JSON.stringify(updatedGoals));
    
    if (session?.user) {
      fetch(`/api/care-plan/health-goals?id=${id}`, {
        method: 'DELETE'
      }).catch(err => console.error('Error deleting health goal:', err));
    }
  };

  const deleteAppointment = async (id: string) => {
    const updatedAppts = appointments.filter(appt => appt.id !== id);
    setAppointments(updatedAppts);
    localStorage.setItem('alephra.carePlan.appointments', JSON.stringify(updatedAppts));
    
    if (session?.user) {
      fetch(`/api/care-plan/care-appointments?id=${id}`, {
        method: 'DELETE'
      }).catch(err => console.error('Error deleting appointment:', err));
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

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimal Header */}
        <div className="py-8 border-b-2 border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-5xl font-bold text-black dark:text-white tracking-tight">
                My Health Space
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-500 mt-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {session && (
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">
                {stat.label}
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
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                  <Pill className="w-4 h-4 text-white dark:text-black" />
                </div>
                <h2 className="text-2xl font-semibold text-black dark:text-white">
                  Today&apos;s Medications
                </h2>
              </div>
              <Button
                onClick={() => setShowMedicationForm(!showMedicationForm)}
                size="sm"
                variant="outline"
                className="border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>

            {showMedicationForm && (
              <div className="p-5 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Medication</h3>
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
                    <Label htmlFor="name" className="text-sm text-gray-700 dark:text-gray-300">Medication Name</Label>
                    <Input id="name" name="name" required className="mt-1" placeholder="e.g., Metformin" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dosage" className="text-sm text-gray-700 dark:text-gray-300">Dosage</Label>
                      <Input id="dosage" name="dosage" required className="mt-1" placeholder="e.g., 500mg" />
                    </div>
                    <div>
                      <Label htmlFor="frequency" className="text-sm text-gray-700 dark:text-gray-300">Frequency</Label>
                      <Input id="frequency" name="frequency" required className="mt-1" placeholder="e.g., Twice daily" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-sm text-gray-700 dark:text-gray-300">Time(s) - comma separated</Label>
                    <Input id="time" name="time" required className="mt-1" placeholder="e.g., 08:00, 20:00" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="startDate" className="text-sm text-gray-700 dark:text-gray-300">Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-sm text-gray-700 dark:text-gray-300">End Date (optional)</Label>
                      <Input id="endDate" name="endDate" type="date" className="mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">Add Medication</Button>
                    <Button type="button" variant="outline" onClick={() => setShowMedicationForm(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.length === 0 && !showMedicationForm && (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  No medications added yet. Click &quot;Add New&quot; to add one.
                </div>
              )}
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:border-black dark:hover:border-white transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-black dark:text-white mb-1">
                        {med.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <span>{med.dosage}</span>
                        <span>•</span>
                        <span>{med.frequency}</span>
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
                  <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getNextDose(med)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Goals Section */}
          <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center">
                      <Target className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Health Goals
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Track your progress
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowGoalForm(!showGoalForm)}
                    size="sm"
                    className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </div>

                {showGoalForm && (
                  <div className="p-5 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Health Goal</h3>
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
                        <Label htmlFor="title" className="text-sm text-gray-700 dark:text-gray-300">Goal Title</Label>
                        <Input id="title" name="title" required className="mt-1" placeholder="e.g., Reduce Blood Pressure" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="current" className="text-sm text-gray-700 dark:text-gray-300">Current Value</Label>
                          <Input id="current" name="current" required className="mt-1" placeholder="e.g., 135/85 mmHg" />
                        </div>
                        <div>
                          <Label htmlFor="target" className="text-sm text-gray-700 dark:text-gray-300">Target Value</Label>
                          <Input id="target" name="target" required className="mt-1" placeholder="e.g., 120/80 mmHg" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="category" className="text-sm text-gray-700 dark:text-gray-300">Category</Label>
                          <select 
                            id="category" 
                            name="category" 
                            required 
                            className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="vitals">Vitals</option>
                            <option value="weight">Weight</option>
                            <option value="exercise">Exercise</option>
                            <option value="diet">Diet</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="deadline" className="text-sm text-gray-700 dark:text-gray-300">Deadline</Label>
                          <Input id="deadline" name="deadline" type="date" required className="mt-1" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1">Add Goal</Button>
                        <Button type="button" variant="outline" onClick={() => setShowGoalForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {healthGoals.length === 0 && !showGoalForm && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No health goals set yet. Click &quot;Add Goal&quot; to create one.
                    </div>
                  )}
                  {healthGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {goal.title}
                            </h3>
                            <Badge className={getCategoryColor(goal.category)}>
                              {goal.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>Current: <strong>{goal.current}</strong></span>
                            <span>→</span>
                            <span>Target: <strong>{goal.target}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {Math.round(calculateProgress(goal.current, goal.target))}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getDaysUntil(goal.deadline)} days left
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteHealthGoal(goal.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                        <div
                          className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Appointments
                      </h2>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showAppointmentForm && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Appointment</h3>
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
                      
                      // Add to care plan appointments
                      await syncAppointments([...appointments, newAppointment]);
                      
                      // Also add to dashboard appointments (sync)
                      const dashboardAppointments = localStorage.getItem('alephra.appointments');
                      const dashboardAppts = dashboardAppointments ? JSON.parse(dashboardAppointments) : [];
                      dashboardAppts.push({
                        id: newAppointment.id,
                        title: `${doctor} - ${newAppointment.specialty}`,
                        date: date,
                        time: time
                      });
                      localStorage.setItem('alephra.appointments', JSON.stringify(dashboardAppts));
                      
                      // Hide form after reset
                      setShowAppointmentForm(false);
                    }} className="space-y-3">
                      <div>
                        <Label htmlFor="doctor" className="text-sm text-gray-700 dark:text-gray-300">Doctor Name</Label>
                        <Input id="doctor" name="doctor" required className="mt-1" placeholder="Dr. John Smith" />
                      </div>
                      <div>
                        <Label htmlFor="specialty" className="text-sm text-gray-700 dark:text-gray-300">Specialty</Label>
                        <Input id="specialty" name="specialty" required className="mt-1" placeholder="Cardiologist" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="date" className="text-sm text-gray-700 dark:text-gray-300">Date</Label>
                          <Input id="date" name="date" type="date" required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="time" className="text-sm text-gray-700 dark:text-gray-300">Time</Label>
                          <Input id="time" name="time" type="time" required className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-sm text-gray-700 dark:text-gray-300">Location</Label>
                        <Input id="location" name="location" required className="mt-1" placeholder="City Hospital, Room 204" />
                      </div>
                      <div>
                        <Label htmlFor="notes" className="text-sm text-gray-700 dark:text-gray-300">Notes (optional)</Label>
                        <Input id="notes" name="notes" className="mt-1" placeholder="Follow-up visit" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1">Add Appointment</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAppointmentForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {appointments.length === 0 && !showAppointmentForm && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No appointments scheduled. Click + to add one.
                    </div>
                  )}
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <Stethoscope className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {apt.doctor}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {apt.specialty}
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
                      <div className="ml-8 space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Calendar className="w-3 h-3" />
                          {new Date(apt.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })} at {apt.time}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
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
