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
// Removed health analytics - replaced with simple report management
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-black text-white' : 'hover:bg-gray-800'}`}
  >
    {children}
  </button>
);


export default function HistoryPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [selected, setSelected] = useState<PrescriptionRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');


  useEffect(() => {
    const all = prescriptionStorage.getAllPrescriptions();
    const sorted = all.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    setPrescriptions(sorted);
    if (sorted.length > 0) {
      setSelected(sorted[0]);
    }
  }, []);

  const refreshData = () => {
    const all = prescriptionStorage.getAllPrescriptions();
    const sorted = all.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    setPrescriptions(sorted);
    // If selected report was deleted, select the newest one
    if (selected && !all.find(p => p.id === selected.id)) {
        setSelected(sorted.length > 0 ? sorted[0] : null);
    }
  };

  const handleDelete = (id: string) => {
    prescriptionStorage.deletePrescription(id);
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
    <div className="min-h-[100dvh] bg-black">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Health Analytics</h1>
            <p className="text-gray-400">Your comprehensive health journey and insights.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm border-gray-600 text-gray-300">
              {total} {total === 1 ? "Report" : "Reports"}
            </Badge>
            <Link href="/analysis">
              <Button variant="outline" className="gap-2 border-gray-600 text-gray-300 hover:bg-gray-800">
                <Upload className="w-4 h-4" /> Upload New
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
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
              <Card className="h-full flex flex-col bg-black border-gray-700">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl text-white">{selected.fileName}</CardTitle>
                            <p className="text-sm text-gray-400">{new Date(selected.uploadedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                            <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</TabButton>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <Card className="bg-black border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <FileText className="h-5 w-5"/>
                                        Report Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">File Name:</span>
                                                <p className="text-white font-medium">{selected.fileName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Upload Date:</span>
                                                <p className="text-white font-medium">{selected.uploadedAt.toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">File Size:</span>
                                                <p className="text-white font-medium">{Math.round(selected.reportData.length / 1024)} KB</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Report Type:</span>
                                                <p className="text-white font-medium">Medical Report</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-700 pt-4">
                                            <h4 className="text-white font-semibold mb-3">AI Summary</h4>
                                            <div className="text-gray-300 text-sm leading-relaxed">
                                                <p className="line-clamp-4">
                                                    {selected.summary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                                                <h4 className="text-yellow-300 font-semibold">Important Notice</h4>
                                            </div>
                                            <p className="text-yellow-200 text-sm">
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
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-white mb-3">Full Report Data</h4>
                                <div className="max-h-[60vh] overflow-y-auto p-4 border border-gray-700 rounded-lg whitespace-pre-wrap text-sm bg-gray-900 text-gray-300 font-mono">
                                    {selected.reportData}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-black border-gray-700">
                <div className="text-center text-gray-400">
                  <BarChart3 className="mx-auto h-12 w-12" />
                  <p className="mt-4 font-semibold text-white">
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


