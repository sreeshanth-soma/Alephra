/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast"
import ReportComponent from "@/components/ReportComponent";
import ChatComponent from "@/components/chat/chatcomponent";
import EnhancedHistoryList from "@/components/EnhancedHistory";
import { PrescriptionRecord, prescriptionStorage } from "@/lib/prescription-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart3, Share2, FileStack, Calendar, Shield } from "lucide-react";
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
const formatRelativeTime = (input: Date) => {
  const diff = Date.now() - input.getTime();
  if (diff < 60 * 1000) return "just now";
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000));
    return `${mins}m ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  return `${days}d ago`;
};

type ShareStatsMap = Record<
  string,
  {
    count: number;
    lastShared: Date;
  }
>;

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
  const [shareStats, setShareStats] = useState<ShareStatsMap>({});

  const selectedPrescription = useMemo(
    () => prescriptions.find((p) => p.id === selectedPrescriptionId) || null,
    [prescriptions, selectedPrescriptionId]
  );

  const prescriptionIdsKey = useMemo(
    () => prescriptions.map((p) => p.id).sort().join("|"),
    [prescriptions]
  );

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

  const refreshShareStats = useCallback(async () => {
    if (!prescriptions.length) {
      setShareStats({});
      return;
    }

    try {
      const response = await fetch("/api/share-links");
      if (response.status === 401) {
        setShareStats({});
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch share links");
      }

      const data = await response.json();
      const now = Date.now();
      const stats: ShareStatsMap = {};

      if (Array.isArray(data.shareLinks)) {
        data.shareLinks.forEach((link: any) => {
          if (!link.reportId) return;
          const expiresAt = new Date(link.expiresAt);
          const createdAt = new Date(link.createdAt);
          const isExpired = expiresAt.getTime() < now;
          const isMaxed =
            typeof link.maxViews === "number" &&
            link.maxViews > 0 &&
            link.viewCount >= link.maxViews;
          if (isExpired || isMaxed) {
            return;
          }

          if (!stats[link.reportId]) {
            stats[link.reportId] = {
              count: 1,
              lastShared: createdAt,
            };
          } else {
            stats[link.reportId].count += 1;
            if (createdAt > stats[link.reportId].lastShared) {
              stats[link.reportId].lastShared = createdAt;
            }
          }
        });
      }

      setShareStats(stats);
    } catch (error) {
      console.error("Failed to load share stats:", error);
    }
  }, [prescriptions.length]);

  useEffect(() => {
    refreshShareStats();
  }, [refreshShareStats]);

  const onReportConfirmation = (data: string) => {
    setreportData(data);
    setHistoryRefreshTrigger(prev => prev + 1);
    toast({
      description: "Report loaded successfully! You can now ask questions about it."
    });
  };

  const handleShareCallout = () => {
    if (selectedPrescription) {
      setReportToShare(selectedPrescription);
      setShowSharing(true);
      return;
    }

    if (prescriptions.length === 0) {
      toast({
        description: "Upload a report first to create a secure share link.",
        variant: "destructive",
      });
      return;
    }

    toast({
      description: "Select a report from the list below, then tap Share.",
    });
  };

  const handleLoadingChange = (loading: boolean) => {
    setLoading(loading);
  }

  const handlePrescriptionSelect = async (prescription: PrescriptionRecord) => {
    // Toggle selection: if already selected, deselect it
    if (selectedPrescriptionId === prescription.id) {
      setSelectedPrescriptionId("");
      setreportData("");
      localStorage.removeItem('selectedReportId'); // Clear from localStorage to switch back to All Reports
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
    refreshShareStats();
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
    refreshShareStats();
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
    <div className="min-h-screen bg-gray-50 dark:bg-black relative pt-12 md:pt-16">
      {/* Squares Background */}
      <div className="absolute inset-0 z-0">
        <Squares 
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="#333333" 
          hoverFillColor="#0f766e"
        />
      </div>
      
      {/* Overlay for better contrast and spotlight effect */}
      <div className="absolute inset-0 z-5 bg-gradient-to-b from-white/0 via-white/50 to-white dark:from-black/0 dark:via-black/50 dark:to-black pointer-events-none" />
      
      
      
      <div className="w-full max-w-[80%] mx-auto px-4 pt-6 pb-6 relative z-10">
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
          <p className="text-base md:text-lg text-slate-900 dark:text-slate-400 uppercase tracking-widest font-medium">
            AI-POWERED MEDICAL REPORT ANALYSIS
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
                    ? 'bg-black text-white dark:bg-white dark:text-black'
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
                    ? 'bg-black text-white dark:bg-white dark:text-black'
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
        
        
        {/* Top-Right Share Feature Highlight - Compact Horizontal */}
        {prescriptions.length > 0 && (
          <div className="absolute top-6 right-8 z-40">
            <button
              onClick={() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex items-center gap-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg px-4 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
            >
              <div className="h-8 w-8 rounded border-2 border-black dark:border-white bg-blue-500 flex items-center justify-center shrink-0">
                <Share2 className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wide leading-tight">
                  Share Reports
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-mono">
                  Secure Links
                </p>
              </div>
            </button>
          </div>
        )}
        
        
        <div className="w-full space-y-6">
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

          <div id="upload" className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-start">
            <div className="w-full lg:col-span-5">
              <ReportComponent onReportConfirmation={onReportConfirmation} onLoadingChange={handleLoadingChange} />
            </div>
            <div className="w-full lg:col-span-6 sticky top-6">
              <ChatComponent 
                reportData={reportData} 
                selectedReportId={selectedPrescriptionId}
                allPrescriptions={prescriptions}
              />
            </div>
          </div>
          <div id="history" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-mono text-black dark:text-white tracking-tight">
                YOUR REPORTS
              </h2>
            </div>
            
            {prescriptions.length > 0 && (

              <div className="bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-[12px_12px_0px_rgba(15,118,110,0.1)] dark:shadow-[12px_12px_0px_rgba(255,255,255,0.05)]">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <Share2 className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-black dark:text-white uppercase tracking-[0.2em] mb-1">
                      SECURE REPORT SHARING
                    </p>
                    <p className="text-sm md:text-base text-black dark:text-white leading-relaxed">
                      Instantly generate a password-protected link for your doctor or caregiver. Select a report below and click the Share icon—or use the button to jump right in.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleShareCallout}
                  className="group inline-flex items-center gap-3 rounded-2xl border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-black px-5 py-2 text-sm font-semibold tracking-wide uppercase transition-all hover:-translate-y-0.5 hover:shadow-lg hover:bg-teal-700 dark:hover:bg-teal-400 border-transparent"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/40 dark:border-black/40 text-xs font-bold">
                    ↗
                  </span>
                  {selectedPrescription ? "Share selected report" : "Share a report"}
                </button>
              </div>
            )}
            <div className="w-full">
              <div className="bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-[8px_8px_0px_0px_rgba(15,118,110,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
                <div className="p-6 border-b-2 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-white tracking-tight font-mono">
                        REPORT HISTORY · {filteredPrescriptions.length}
                      </h3>
                    </div>

                    <div className="flex-shrink-0">
                      <Link 
                        href="/history"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold font-mono bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 dark:hover:bg-teal-500 dark:hover:text-black transition-all"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        ANALYTICS
                      </Link>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="SEARCH REPORTS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto bg-white dark:bg-black">
                  {filteredPrescriptions.length === 0 ? (
                    <div className="text-center py-16 border-t-2 border-black dark:border-white">
                      <div className="relative inline-block mb-6">
                        <BarChart3 className="mx-auto h-16 w-16 text-black dark:text-white" strokeWidth={2.5} />
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                      <h4 className="text-lg font-bold font-mono text-black dark:text-white mb-2">
                        {searchTerm ? "No Matching Reports" : "Get Started"}
                      </h4>
                      <p className="text-sm font-mono text-black dark:text-white opacity-70 mb-6">
                        {searchTerm ? "Try a different search term" : "Upload your first medical report above"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => {
                            document.getElementById("upload")?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-semibold text-sm uppercase tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_8px_20px_rgba(255,255,255,0.25)]"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Report
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPrescriptions.map((prescription) => (
                        <div
                          key={prescription.id}
                          onClick={() => handlePrescriptionSelect(prescription)}
                          className={`group p-5 cursor-pointer transition-all duration-300 border-2 rounded-lg ${
                            selectedPrescriptionId === prescription.id 
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-lg scale-[1.02]' 
                              : 'border-black dark:border-white hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-md hover:scale-[1.01] hover:border-black dark:hover:border-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <FileStack className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
                                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full ${
                                  selectedPrescriptionId === prescription.id
                                    ? 'bg-white text-black dark:bg-black dark:text-white border border-white dark:border-black'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                }`}>
                                  REPORT
                                </span>
                                <h4 className={`text-base font-bold font-mono truncate ${
                                  selectedPrescriptionId === prescription.id 
                                    ? 'text-white dark:text-black' 
                                    : 'text-black dark:text-white'
                                }`}>
                                  {prescription.fileName}
                                </h4>
                                {shareStats[prescription.id] && (
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReportToShare(prescription);
                                      setShowSharing(true);
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-full border border-emerald-500 text-emerald-600 dark:text-emerald-300 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-1"
                                    title="Manage share links"
                                  >
                                    Shared {shareStats[prescription.id].count > 0 && `(${shareStats[prescription.id].count})`}
                                  </span>
                                )}
                                {selectedPrescriptionId === prescription.id && (
                                  <span className="px-2 py-0.5 text-[10px] font-black uppercase border border-white dark:border-black rounded-full">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm font-mono mt-2 line-clamp-2 ${
                                selectedPrescriptionId === prescription.id 
                                  ? 'text-white dark:text-black opacity-70' 
                                  : 'text-black dark:text-white opacity-70'
                              }`}>
                                {prescription.summary}
                              </p>
                              <div className={`flex items-center gap-4 mt-3 text-xs font-mono font-bold ${
                                selectedPrescriptionId === prescription.id 
                                  ? 'text-gray-400 dark:text-gray-600' 
                                  : 'text-gray-500 dark:text-gray-500'
                              }`}>
                    <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {prescription.uploadedAt.toLocaleDateString()}
                                </span>
                                <span>{prescription.uploadedAt.toLocaleTimeString()}</span>
                                {shareStats[prescription.id] ? (
                                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <Share2 className="h-3 w-3" />
                                    {shareStats[prescription.id].count} active
                                    {shareStats[prescription.id].count > 1 ? " shares" : " share"}
                                    <span className="hidden sm:inline">
                                      · {formatRelativeTime(shareStats[prescription.id].lastShared)}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                    <Share2 className="h-3 w-3" />
                                    Not shared
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportToShare(prescription);
                                  setShowSharing(true);
                                }}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  selectedPrescriptionId === prescription.id
                                    ? 'border-white/20 dark:border-black/20 hover:bg-white hover:text-teal-700 dark:hover:bg-black dark:hover:text-teal-400'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:hover:text-teal-400'
                                }`}
                                title={shareStats[prescription.id] ? "Manage share links" : "Share report"}
                              >
                                <Share2 className="h-4 w-4" strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(prescription);
                                }}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  selectedPrescriptionId === prescription.id
                                    ? 'border-white/20 dark:border-black/20 hover:bg-white hover:text-blue-700 dark:hover:bg-black dark:hover:text-blue-400'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:hover:text-blue-400'
                                }`}
                                title="Export report"
                              >
                                <Upload className="h-4 w-4" strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(prescription.id);
                                }}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  selectedPrescriptionId === prescription.id
                                    ? 'border-white/20 dark:border-black/20 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:hover:text-red-400'
                                }`}
                                title="Delete report"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  <div className="p-4 border-t-2 border-black dark:border-white bg-white dark:bg-black">
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="w-full py-3 text-sm font-bold font-mono bg-red-600 text-white border-2 border-red-600 hover:bg-white hover:text-red-600 dark:hover:bg-black dark:hover:text-red-600 transition-all"
                    >
                      CLEAR ALL REPORTS
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
          onShareActivity={refreshShareStats}
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


