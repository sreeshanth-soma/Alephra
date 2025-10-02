/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast"
import ReportComponent from "@/components/ReportComponent";
import ChatComponent from "@/components/chat/chatcomponent";
import PrescriptionHistory from "@/components/PrescriptionHistory";
import { PrescriptionRecord } from "@/lib/prescription-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import Link from "next/link";
import { Squares } from "@/components/ui/squares-background";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";

const AnalysisPage = () => {
  const { toast } = useToast()
  const [reportData, setreportData] = useState("");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>("");
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const onReportConfirmation = (data: string) => {
    setreportData(data);
    setHistoryRefreshTrigger(prev => prev + 1);
    toast({
      description: "Report loaded successfully! You can now ask questions about it."
    });
  }

  const handleLoadingChange = (loading: boolean) => {
    setLoading(loading);
  }

  const handlePrescriptionSelect = (prescription: PrescriptionRecord) => {
    setreportData(prescription.reportData);
    setSelectedPrescriptionId(prescription.id);
    toast({
      description: `Loaded prescription: ${prescription.fileName}`
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative pt-16">
      {/* Squares Background */}
      <div className="absolute inset-0 z-0">
        <Squares 
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="#666"
          hoverFillColor="#2a2a2a"
        />
      </div>
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 z-5 bg-white/40 dark:bg-black/0" />
      
      
      
      <div className="container mx-auto px-4 pt-4 pb-12 relative z-10">
        <Loader 
          loadingStates={[
            { text: "Uploading report" },
            { text: "Extracting values" },
            { text: "Structuring data" },
            { text: "Analyzing findings" },
            { text: "Preparing insights" },
          ]} 
          loading={loading} 
          duration={2000}
          onClose={() => setLoading(false)}
        />
        
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black dark:text-white mb-6 font-playfair">
            MedScan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            AI-powered medical report analysis
          </p>
        </div>
        
        {/* Medical History Nav - Top Right Overlay */}
        <div className="absolute top-24 right-4 z-30">
          <a 
            href="#history" 
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
          >
            History
          </a>
        </div>
        
        <div className="max-w-7xl mx-auto space-y-12">
          <div id="upload" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <ReportComponent onReportConfirmation={onReportConfirmation} onLoadingChange={handleLoadingChange} />
            </div>
            <div className="space-y-6">
              <ChatComponent reportData={reportData} />
            </div>
          </div>
          <div id="history" className="space-y-6">
            <PrescriptionHistory 
              onSelectPrescription={handlePrescriptionSelect}
              selectedPrescriptionId={selectedPrescriptionId}
              refreshTrigger={historyRefreshTrigger}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;


