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
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Your comprehensive health journey and insights.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              {total} {total === 1 ? "Report" : "Reports"}
            </Badge>
            <Link href="/analysis">
              <Button variant="outline" className="gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Upload className="w-4 h-4" /> Upload New
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
          <div className="lg:col-span-4 h-full">
            <EnhancedHistoryList
              prescriptions={prescriptions}
              healthScores={new Map()}
              onSelectPrescription={setSelected}
              selectedPrescriptionId={selected?.id}
              onClearAll={handleClearAll}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          </div>

          <div className="lg:col-span-8 h-full">
            {selected ? (
              <Card className="h-full flex flex-col bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                <CardHeader className="flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl text-gray-900 dark:text-white">{selected.fileName}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(selected.uploadedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                            <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</TabButton>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto min-h-0">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Report Information Card */}
                            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <FileText className="h-5 w-5"/>
                                        Report Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 block">File Name</span>
                                                <p className="text-gray-900 dark:text-white font-medium">{selected.fileName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 block">Upload Date</span>
                                                <p className="text-gray-900 dark:text-white font-medium">{selected.uploadedAt.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 block">File Size</span>
                                                <p className="text-gray-900 dark:text-white font-medium">{Math.round(selected.reportData.length / 1024)} KB</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 block">Report Type</span>
                                                <p className="text-gray-900 dark:text-white font-medium">Medical Report</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Summary Card */}
                            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                                <CardHeader className="flex-shrink-0">
                                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Brain className="h-5 w-5"/>
                                        AI Summary
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
                                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Full Report Data</h4>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 custom-scrollbar">
                                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100">
                                        <Markdown text={selected.reportData} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Report Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
                                    <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Report Information</h5>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700 dark:text-blue-400">File Size:</span>
                                            <span className="text-blue-900 dark:text-blue-200 font-medium">{Math.round(selected.reportData.length / 1024)} KB</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700 dark:text-blue-400">Characters:</span>
                                            <span className="text-blue-900 dark:text-blue-200 font-medium">{selected.reportData.length.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700 dark:text-blue-400">Words:</span>
                                            <span className="text-blue-900 dark:text-blue-200 font-medium">{selected.reportData.split(/\s+/).length.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg p-4">
                                    <h5 className="font-semibold text-green-900 dark:text-green-300 mb-2">Processing Status</h5>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <span className="text-green-700 dark:text-green-400">Text Extraction</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <span className="text-green-700 dark:text-green-400">AI Summary Generated</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <span className="text-green-700 dark:text-green-400">Vector Storage</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart3 className="mx-auto h-12 w-12" />
                  <p className="mt-4 font-semibold text-gray-900 dark:text-white">
                    {total > 0 ? "Select a report to view analytics" : "No reports available"}
                  </p>
                  <p className="text-sm">
                    {total === 0 && "Upload a medical report to get started."}
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


