/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useMemo } from "react";
import EnhancedHistoryList from "@/components/EnhancedHistory";
import { PrescriptionRecord, prescriptionStorage } from "@/lib/prescription-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, BarChart3, TrendingUp, Activity, Heart, Shield, Brain, FileText, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Markdown from "@/components/markdown";
// Removed health analytics - replaced with simple report management
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-xs font-bold font-mono border-2 transition-all ${active ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
  >
    {children}
  </button>
);


export default function HistoryPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [selected, setSelected] = useState<PrescriptionRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');


  useEffect(() => {
    const loadData = async () => {
      const all = await prescriptionStorage.getAllPrescriptions();
      const sorted = all.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      setPrescriptions(sorted);
      if (sorted.length > 0) {
        setSelected(sorted[0]);
        // Save the selected report ID to localStorage for chat context
        localStorage.setItem('selectedReportId', sorted[0].id);
      }
    };
    loadData();
  }, []);

  const refreshData = async () => {
    const all = await prescriptionStorage.getAllPrescriptions();
    const sorted = all.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    setPrescriptions(sorted);
    // If selected report was deleted, select the newest one
    if (selected && !all.find(p => p.id === selected.id)) {
        setSelected(sorted.length > 0 ? sorted[0] : null);
    }
  };

  const handleDelete = async (id: string) => {
    await prescriptionStorage.deletePrescription(id);
    refreshData();
  };

  const handleClearAll = () => {
    prescriptionStorage.clearAllPrescriptions();
    setPrescriptions([]);
    setSelected(null);
  };

  const handleExport = (prescription: PrescriptionRecord) => {
    const data = {
      ...prescription,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prescription.fileName}_${prescription.uploadedAt.toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const total = prescriptions.length;

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-mono text-black dark:text-white tracking-tight">HEALTH ANALYTICS</h1>
            <p className="text-base font-mono text-black dark:text-white uppercase tracking-wide opacity-70 mt-2">YOUR COMPREHENSIVE HEALTH JOURNEY AND INSIGHTS</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm font-bold font-mono border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black">
              {total} {total === 1 ? "REPORT" : "REPORTS"}
            </Badge>
            <Link href="/analysis">
              <Button variant="outline" className="gap-2 border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono text-xs">
                <Upload className="w-4 h-4" /> UPLOAD NEW
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
          <div className="lg:col-span-4 h-full">
            <EnhancedHistoryList
              prescriptions={prescriptions}
              healthScores={new Map()}
              onSelectPrescription={(prescription) => {
                setSelected(prescription);
                // Save the selected report ID to localStorage for chat context
                localStorage.setItem('selectedReportId', prescription.id);
              }}
              selectedPrescriptionId={selected?.id}
              onClearAll={handleClearAll}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          </div>

          <div className="lg:col-span-8 h-full">
            {selected ? (
              <Card className="h-full flex flex-col bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
                <CardHeader className="flex-shrink-0 pb-4 border-b-2 border-black dark:border-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-bold font-mono text-black dark:text-white">{selected.fileName.toUpperCase()}</CardTitle>
                            <p className="text-sm font-mono text-black dark:text-white opacity-60 mt-1">{new Date(selected.uploadedAt).toLocaleString().toUpperCase()}</p>
                            <Link href="/dashboard">
                              <Button size="sm" className="mt-2 gap-1 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white font-bold font-mono text-xs" variant="outline">
                                <ArrowRight className="h-3 w-3" />
                                DISCUSS WITH AI
                              </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>OVERVIEW</TabButton>
                            <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>DETAILS</TabButton>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto min-h-0 pt-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Report Information Card */}
                            <Card className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
                                <CardHeader className="pb-4 border-b-2 border-black dark:border-white">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold font-mono text-black dark:text-white">
                                        <FileText className="h-5 w-5"/>
                                        REPORT INFORMATION
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-black dark:text-white opacity-60 block text-xs font-bold font-mono uppercase">FILE NAME</span>
                                                <p className="text-black dark:text-white font-bold font-mono mt-1">{selected.fileName.toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <span className="text-black dark:text-white opacity-60 block text-xs font-bold font-mono uppercase">UPLOAD DATE</span>
                                                <p className="text-black dark:text-white font-bold font-mono mt-1">{selected.uploadedAt.toLocaleDateString().toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-black dark:text-white opacity-60 block text-xs font-bold font-mono uppercase">FILE SIZE</span>
                                                <p className="text-black dark:text-white font-bold font-mono mt-1">{Math.round(selected.reportData.length / 1024)} KB</p>
                                            </div>
                                            <div>
                                                <span className="text-black dark:text-white opacity-60 block text-xs font-bold font-mono uppercase">REPORT TYPE</span>
                                                <p className="text-black dark:text-white font-bold font-mono mt-1">MEDICAL REPORT</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Summary Card */}
                            <Card className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
                                <CardHeader className="flex-shrink-0 pb-4 border-b-2 border-black dark:border-white">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold font-mono text-black dark:text-white">
                                        <Brain className="h-5 w-5"/>
                                        AI SUMMARY
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 line-clamp-6">
                                        <Markdown text={selected.summary} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Important Notice Card */}
                            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/30">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">Important Notice</h4>
                                            <p className="text-yellow-700 dark:text-yellow-200 text-sm leading-relaxed">
                                                This is a medical report viewer only. No health analysis or medical advice is provided. 
                                                Always consult with qualified healthcare professionals for medical interpretation and advice.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="h-5 w-5 text-black dark:text-white" strokeWidth={2.5} />
                                    <h4 className="font-bold font-mono text-black dark:text-white">FULL REPORT DATA</h4>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto p-6 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white custom-scrollbar font-mono text-sm">
                                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100">
                                        <Markdown text={selected.reportData} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Report Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-4">
                                    <h5 className="font-bold font-mono text-black dark:text-white mb-2">REPORT INFORMATION</h5>
                                    <div className="space-y-1 text-sm font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-black dark:text-white opacity-60">FILE SIZE:</span>
                                            <span className="text-black dark:text-white font-bold">{Math.round(selected.reportData.length / 1024)} KB</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-black dark:text-white opacity-60">CHARACTERS:</span>
                                            <span className="text-black dark:text-white font-bold">{selected.reportData.length.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-black dark:text-white opacity-60">WORDS:</span>
                                            <span className="text-black dark:text-white font-bold">{selected.reportData.split(/\s+/).length.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-4">
                                    <h5 className="font-bold font-mono text-black dark:text-white mb-2">PROCESSING STATUS</h5>
                                    <div className="space-y-1 text-sm font-mono">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-black dark:text-white" strokeWidth={2.5} />
                                            <span className="text-black dark:text-white">TEXT EXTRACTION</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-black dark:text-white" strokeWidth={2.5} />
                                            <span className="text-black dark:text-white">AI SUMMARY GENERATED</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-black dark:text-white" strokeWidth={2.5} />
                                            <span className="text-black dark:text-white">VECTOR STORAGE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
                <div className="text-center text-black dark:text-white">
                  <BarChart3 className="mx-auto h-12 w-12" strokeWidth={2.5} />
                  <p className="mt-4 font-bold font-mono text-black dark:text-white">
                    {total > 0 ? "SELECT A REPORT TO VIEW ANALYTICS" : "NO REPORTS AVAILABLE"}
                  </p>
                  <p className="text-sm font-mono text-black dark:text-white opacity-70 mt-2">
                    {total === 0 && "UPLOAD A MEDICAL REPORT TO GET STARTED"}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


