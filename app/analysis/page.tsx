/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast"
import ReportComponent from "@/components/ReportComponent";
import ChatComponent from "@/components/chat/chatcomponent";
import EnhancedHistoryList from "@/components/EnhancedHistory";
import { PrescriptionRecord, prescriptionStorage } from "@/lib/prescription-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Upload, BarChart3, Share2, FileStack, Calendar } from "lucide-react";
import Link from "next/link";
import { HoverButton } from "@/components/ui/hover-button";
import { Squares } from "@/components/ui/squares-background";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { ReportTimeline } from "@/components/ui/report-timeline";
import { ReportCategories, ReportTemplate } from "@/components/ui/report-categories";
import { CollaborativeSharing } from "@/components/ui/collaborative-sharing";
import BasicModal from "@/components/ui/modal";
import { 
  extractMetricsFromReport, 
  calculateHealthScore, 
  generateInsights, 
  compareReports,
  HealthScore,
  ReportInsight,
  ReportComparison,
  HealthMetric
} from "@/lib/health-analytics";
import { useMemo } from "react";

const AnalysisPage = () => {
  const { toast } = useToast()
  const [reportData, setreportData] = useState("");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>("");
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New states for enhanced features
  const [showTimeline, setShowTimeline] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [reportToShare, setReportToShare] = useState<PrescriptionRecord | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Memoized analytics data
  const analytics = useMemo(() => {
    const healthScores = new Map<string, HealthScore>();
    const insights = new Map<string, ReportInsight[]>();
    const comparisons = new Map<string, ReportComparison>();
    const metrics = new Map<string, HealthMetric[]>();

    const sortedPrescriptions = [...prescriptions].sort((a,b) => a.uploadedAt.getTime() - b.uploadedAt.getTime());

    for (let i = 0; i < sortedPrescriptions.length; i++) {
      const p = sortedPrescriptions[i];
      const currentMetrics = extractMetricsFromReport(p.reportData);
      const score = calculateHealthScore(currentMetrics);
      const reportInsights = generateInsights(currentMetrics);

      metrics.set(p.id, currentMetrics);
      healthScores.set(p.id, score);
      insights.set(p.id, reportInsights);
      
      if (i > 0) {
        const prev = sortedPrescriptions[i-1];
        const prevMetrics = metrics.get(prev.id) || [];
        const comp = compareReports(currentMetrics, prevMetrics);
        comparisons.set(p.id, comp);
      }
    }
    return { healthScores, insights, comparisons, metrics };
  }, [prescriptions]);

  // Filter prescriptions based on search term
  const filteredPrescriptions = useMemo(() => {
    if (!searchTerm) return prescriptions;
    return prescriptions.filter(p => 
      p.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prescriptions, searchTerm]);

  // Load prescriptions on component mount
  useEffect(() => {
    const loadPrescriptions = async () => {
      // Force fresh fetch to get reportText
      prescriptionStorage.invalidateCache();
      const all = await prescriptionStorage.getAllPrescriptions();
      const sorted = all.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      setPrescriptions(sorted);
    };
    loadPrescriptions();
  }, [historyRefreshTrigger]);

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

  const handlePrescriptionSelect = async (prescription: PrescriptionRecord) => {
    // Toggle selection: if already selected, deselect it
    if (selectedPrescriptionId === prescription.id) {
      setSelectedPrescriptionId("");
      setreportData("");
      console.log('Report deselected');
      toast({
        description: "Report deselected"
      });
    } else {
      // Fetch full report data lazily
      toast({
        description: `Loading ${prescription.fileName}...`
      });
      
      try {
        const fullReport = await prescriptionStorage.getPrescriptionById(prescription.id);
        
        if (fullReport && fullReport.reportData) {
          console.log('Loaded full report:', {
            fileName: fullReport.fileName,
            reportDataLength: fullReport.reportData.length,
            hasReportData: !!fullReport.reportData
          });
          setreportData(fullReport.reportData);
          setSelectedPrescriptionId(prescription.id);
          toast({
            description: `✓ Loaded: ${prescription.fileName}`
          });
        } else {
          throw new Error('Report data not found');
        }
      } catch (error) {
        console.error('Error loading report:', error);
        toast({
          variant: 'destructive',
          description: `Failed to load ${prescription.fileName}`
        });
      }
    }
  }

  const handleDelete = async (id: string) => {
    await prescriptionStorage.deletePrescription(id);
    const all = await prescriptionStorage.getAllPrescriptions();
    const sorted = all.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    setPrescriptions(sorted);
    if (selectedPrescriptionId === id) {
      setSelectedPrescriptionId("");
      setreportData("");
    }
    toast({
      description: "Report deleted successfully",
    });
  };

  const handleClearAll = () => {
    prescriptionStorage.clearAllPrescriptions();
    setPrescriptions([]);
    setSelectedPrescriptionId("");
    setreportData("");
    setShowClearModal(false);
    toast({
      description: "All reports cleared",
    });
  };

  const handleExport = (prescription: PrescriptionRecord) => {
    const data = {
      ...prescription,
      analytics: {
        healthScore: analytics.healthScores.get(prescription.id),
        insights: analytics.insights.get(prescription.id),
        comparison: analytics.comparisons.get(prescription.id)
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prescription.fileName}_enhanced_${prescription.uploadedAt.toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      description: "Report exported successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative pt-20">
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
      
      
      
      <div className="container mx-auto px-4 pt-6 pb-6 relative z-10">
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
        
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-2 font-playfair">
            Alephra
          </h1>
          <p className="text-base md:text-lg text-black dark:text-gray-300 font-medium mb-4">
            AI-powered medical report analysis
          </p>
          
          {/* Quick Actions - Enhanced User-Friendly Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mt-4">
            <HoverButton
              onClick={() => {
                setShowTimeline(!showTimeline);
                if (!showTimeline) setShowTemplates(false);
              }}
              className={`px-5 py-2.5 text-sm font-medium ${
                showTimeline
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : ''
              }`}
              title="View your reports in chronological order"
            >
              {showTimeline ? (
                <>
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Close Timeline</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2 inline" />
                  <span>Report Timeline</span>
                </>
              )}
            </HoverButton>
            
            <HoverButton
              data-templates-button
              onClick={() => {
                setShowTemplates(!showTemplates);
                if (!showTemplates) setShowTimeline(false);
              }}
              className={`px-5 py-2.5 text-sm font-medium ${
                showTemplates
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : ''
              }`}
              title="Use pre-filled templates for common medical tests"
            >
              {showTemplates ? (
                <>
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Close Templates</span>
                </>
              ) : (
                <>
                  <FileStack className="h-4 w-4 mr-2 inline" />
                  <span>Quick Templates</span>
                </>
              )}
            </HoverButton>
            
            <a href="#history">
              <HoverButton
                className="px-5 py-2.5 text-sm font-medium"
                title="View and manage all your uploaded reports"
              >
                <BarChart3 className="h-4 w-4 mr-2 inline" />
                <span>My Reports</span>
              </HoverButton>
            </a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Timeline Section */}
          {showTimeline && (
            <div className="mb-8">
              <ReportTimeline 
                prescriptions={prescriptions} 
                onReportSelect={(prescription) => {
                  // Toggle: if clicking the same report, deselect it
                  if (selectedPrescriptionId === prescription.id) {
                    setreportData("");
                    setSelectedPrescriptionId("");
                    toast({
                      description: "Report deselected"
                    });
                  } else {
                    // Select new report
                    setreportData(prescription.reportData);
                    setSelectedPrescriptionId(prescription.id);
                    toast({
                      description: `Loaded: ${prescription.fileName}`
                    });
                  }
                }}
              />
            </div>
          )}

          {/* Templates Section */}
          {showTemplates && (
            <div className="mb-8">
              <ReportCategories
                onSelectTemplate={(template: ReportTemplate) => {
                  toast({
                    description: `Selected template: ${template.name}`,
                  });
                  setShowTemplates(false);
                }}
                onCreateCustom={() => {
                  toast({
                    description: "Custom template creation coming soon!",
                  });
                }}
              />
            </div>
          )}

          <div id="upload" className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-220px)]">
            <div className="space-y-4 h-full">
              <ReportComponent onReportConfirmation={onReportConfirmation} onLoadingChange={handleLoadingChange} />
            </div>
            <div className="space-y-4 h-full">
              <div className="h-full">
                <ChatComponent 
                  reportData={reportData} 
                  selectedReportId={selectedPrescriptionId}
                  allPrescriptions={prescriptions}
                />
              </div>
            </div>
          </div>
          <div id="history" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                Your Reports
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select a report to analyze or upload a new one
              </p>
            </div>
            
            <div className="w-full">
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Report History ({filteredPrescriptions.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Link 
                        href="/history"
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Link>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {filteredPrescriptions.length === 0 ? (
                    <div className="text-center py-12">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? "No matching reports" : "No reports yet"}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchTerm ? "Try a different search term" : "Upload your first medical report to get started"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPrescriptions.map((prescription) => (
                        <div
                          key={prescription.id}
                          onClick={() => handlePrescriptionSelect(prescription)}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                            selectedPrescriptionId === prescription.id 
                              ? 'bg-primary/10 border-l-4 border-primary shadow-sm' 
                              : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/80'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {prescription.fileName}
                                </h4>
                                {selectedPrescriptionId === prescription.id && (
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {prescription.summary}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{prescription.uploadedAt.toLocaleDateString()}</span>
                                <span>{prescription.uploadedAt.toLocaleTimeString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportToShare(prescription);
                                  setShowSharing(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-cyan-600 transition-colors"
                                title="Share report"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(prescription);
                                }}
                                className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                title="Export report"
                              >
                                <Upload className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(prescription.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete report"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {prescriptions.length > 0 && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="w-full text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition-colors"
                    >
                      Clear All Reports
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborative Sharing Modal */}
      {showSharing && reportToShare && (
        <CollaborativeSharing
          prescription={reportToShare}
          onClose={() => {
            setShowSharing(false);
            setReportToShare(null);
          }}
        />
      )}

      {/* Clear All Reports Confirmation Modal */}
      <BasicModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Reports"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete all {prescriptions.length} report{prescriptions.length !== 1 ? 's' : ''}? 
            This action cannot be undone and all your medical reports will be permanently removed.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All Reports
            </Button>
          </div>
        </div>
      </BasicModal>
    </div>
  );
};

export default AnalysisPage;


