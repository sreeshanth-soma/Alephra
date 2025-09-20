/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast"
import ReportComponent from "@/components/ReportComponent";
import ChatComponent from "@/components/chat/chatcomponent";
import PrescriptionHistory from "@/components/PrescriptionHistory";
import { ThemeToggle } from "@/components/theme-toggle";
import { PrescriptionRecord } from "@/lib/prescription-storage";

const ReportPage = () => {
  const { toast } = useToast()
  const [reportData, setreportData] = useState("");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>("");
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const onReportConfirmation = (data: string) => {
    setreportData(data);
    setHistoryRefreshTrigger(prev => prev + 1);
    toast({
      description: "Report loaded successfully! You can now ask questions about it."
    });
  }

  const handlePrescriptionSelect = (prescription: PrescriptionRecord) => {
    setreportData(prescription.reportData);
    setSelectedPrescriptionId(prescription.id);
    toast({
      description: `Loaded prescription: ${prescription.fileName}`
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black dark:text-white mb-6 font-playfair">
            MedScan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            AI-powered medical report analysis
          </p>
        </div>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <ReportComponent onReportConfirmation={onReportConfirmation} />
            </div>
            <div className="space-y-6">
              <ChatComponent reportData={reportData} />
            </div>
          </div>
          <div className="space-y-6">
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

export default ReportPage;


