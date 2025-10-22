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
  
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: ['08:00', '20:00'],
      startDate: '2025-10-01',
      taken: false
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      time: ['09:00'],
      startDate: '2025-10-01',
      taken: true
    }
  ]);

  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([
    {
      id: '1',
      title: 'Reduce Blood Pressure',
      target: '120/80 mmHg',
      current: '135/85 mmHg',
      progress: 60,
      deadline: '2025-12-31',
      category: 'vitals'
    },
    {
      id: '2',
      title: 'Weight Loss',
      target: '75 kg',
      current: '82 kg',
      progress: 45,
      deadline: '2025-11-30',
      category: 'weight'
    },
    {
      id: '3',
      title: 'Daily Walking',
      target: '10,000 steps',
      current: '6,500 steps',
      progress: 65,
      deadline: '2025-10-31',
      category: 'exercise'
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const toggleMedicationTaken = (id: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-4">
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
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {goal.progress}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getDaysUntil(goal.deadline)} days left
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                        <div
                          className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
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
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const newAppointment: Appointment = {
                        id: Date.now().toString(),
                        doctor: formData.get('doctor') as string,
                        specialty: formData.get('specialty') as string,
                        date: formData.get('date') as string,
                        time: formData.get('time') as string,
                        location: formData.get('location') as string,
                        notes: formData.get('notes') as string || undefined,
                      };
                      setAppointments([...appointments, newAppointment]);
                      setShowAppointmentForm(false);
                      e.currentTarget.reset();
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
                      <div className="flex items-start gap-3 mb-2">
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
