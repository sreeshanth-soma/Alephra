/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button';
import { CornerDownLeft, Loader2, Trash2, FileText, RefreshCw } from 'lucide-react';
import BasicModal from '../ui/modal';
import { Badge } from '../ui/badge';
import Messages from './messages';
import type { UIMessage as Message } from 'ai';
import { prescriptionStorage } from '@/lib/prescription-storage';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { useSession } from 'next-auth/react';
import { SignInPromptModal } from '@/components/ui/signin-prompt-modal';

type Props = {
  reportData?: string
  selectedReportId?: string
  allPrescriptions?: any[]
}

const ChatComponent = ({ reportData, selectedReportId, allPrescriptions }: Props) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(undefined);
  const [allReportsData, setAllReportsData] = useState<string>("");
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [prescriptionCount, setPrescriptionCount] = useState<number>(0);
  const [showSignInPrompt, setShowSignInPrompt] = useState<boolean>(false);
  const [selectedReportName, setSelectedReportName] = useState<string>("");

  // Debug log when props change
  useEffect(() => {
    console.log('ChatComponent props updated:', {
      hasReportData: !!reportData,
      reportDataLength: reportData?.length || 0,
      selectedReportId,
      allPrescriptionsCount: allPrescriptions?.length || 0
    });
  }, [reportData, selectedReportId, allPrescriptions]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('alephra-chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        } else {
          const welcome = { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: 'Hello, how can I help you?' }] } as Message;
          setMessages([welcome]);
        }
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        const welcome = { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: 'Hello, how can I help you?' }] } as Message;
        setMessages([welcome]);
      }
    } else {
      const welcome = { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: 'Hello, how can I help you?' }] } as Message;
      setMessages([welcome]);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('alephra-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Load all reports when no specific report is provided
  useEffect(() => {
    const loadReports = async () => {
      if (!reportData) {
        // Check if a specific report ID is selected (from props only)
        const effectiveReportId = selectedReportId;
        
        const prescriptionsToUse = allPrescriptions || await prescriptionStorage.getAllPrescriptions();
        const count = await prescriptionStorage.getPrescriptionsCount();
        setPrescriptionCount(count);
        
        if (effectiveReportId) {
          // Load only the selected report
          const selectedReport = prescriptionsToUse.find(p => p.id === effectiveReportId);
          if (selectedReport) {
            setAllReportsData(selectedReport.reportData);
            setSelectedReportName(selectedReport.fileName);
            setPrescriptionCount(1); // Show as 1 report loaded
            return;
          }
        }
        
        // If no specific report selected, load all reports
        if (prescriptionsToUse.length > 0) {
          const combinedReports = prescriptionsToUse
            .map((prescription, index) => 
              `**Report ${index + 1} (${prescription.fileName} - ${prescriptionStorage.formatDate(prescription.uploadedAt)}):**\n${prescription.reportData}`
            )
            .join('\n\n---\n\n');
          setAllReportsData(combinedReports);
          setSelectedReportName("");
        }
      } else {
        // If reportData is provided directly, check if we have a selected report name from props
        if (selectedReportId && allPrescriptions) {
          const selectedReport = allPrescriptions.find(p => p.id === selectedReportId);
          if (selectedReport) {
            setSelectedReportName(selectedReport.fileName);
          }
        } else {
          setSelectedReportName("");
        }
      }
    };
    loadReports();
  }, [reportData, selectedReportId, allPrescriptions]);

  // Preserve chat when a new report is selected
  // (Previously cleared messages on report change.)

  // Clear chat function
  const clearChat = () => {
    const welcome = { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: 'Hello, how can I help you?' }] } as Message;
    setMessages([welcome]);
    localStorage.removeItem('alephra-chat-messages');
    setShowClearModal(false);
  };
    
  return (
    <div className="h-[500px] sm:h-[620px] bg-white dark:bg-black relative flex flex-col rounded-xl border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
      {/* New Prominent Header */}
      <div className="border-b-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-3 sm:p-4 rounded-t-lg flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-3 sm:mr-4">
          <div className="bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-700 p-2 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 shadow-sm">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-0.5">
              Current Context
            </p>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-black dark:text-white leading-tight truncate font-mono">
              {selectedReportName 
                ? selectedReportName
                : reportData || (allReportsData && prescriptionCount === 1) 
                  ? "Report Loaded" 
                  : allReportsData 
                    ? `All Reports (${prescriptionCount})` 
                    : "No Report Selected"}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="h-8 sm:h-9 px-2 sm:px-4 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono text-xs uppercase tracking-wide shadow-sm hover:shadow-md active:translate-y-[1px] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:mr-2" />
            <span className="hidden sm:inline">Change</span>
          </Button>
          
          {messages.length > 0 && (
            <Button
              onClick={() => setShowClearModal(true)}
              size="sm"
              variant="ghost"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 px-3 sm:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4 overflow-y-auto">
        <Messages messages={messages} isLoading={isLoading} data={data} />
      </div>
      
      <div className="px-6 pb-6 pt-4">
        <PlaceholdersAndVanishInput
          placeholders={[
            "What do my lab results mean?",
            "Explain my blood pressure readings",
            "Are there any concerning values?",
            "What should I discuss with my doctor?",
            "Summarize my health status",
            "What lifestyle changes should I make?",
            "Explain my cholesterol levels",
            "What do these test results indicate?"
          ]}
          onChange={(e) => {
            const next = e.target.value;
            setInput(next);
          }}
          onSubmit={(event) => {
            event.preventDefault();
            
            // Check if user is signed in
            if (!session) {
              setShowSignInPrompt(true);
              return;
            }
            
            const msg = input.trim();
            if (!msg) return;
            const nextMessages: Message[] = [...messages, { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text: msg }] }];
            setMessages(nextMessages);
            setInput("");
            setIsLoading(true);
            
            // Get the effective report data to send
            const effectiveReportData = reportData || allReportsData;
            console.log('Sending to API:', {
              hasReportData: !!reportData,
              reportDataLength: reportData?.length || 0,
              hasAllReportsData: !!allReportsData,
              allReportsDataLength: allReportsData?.length || 0,
              effectiveDataLength: effectiveReportData?.length || 0,
              selectedReportName
            });
            
            fetch('/api/medichatgemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                messages: nextMessages, 
                reportData: effectiveReportData 
              }),
            })
              .then(async (res) => {
                const json = await res.json().catch(() => ({}));
                setData(json);
                const assistantText = typeof json === 'string' ? json : (json?.text ?? json?.message ?? '');
                if (assistantText) {
                  setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: assistantText }] }]);
                }
              })
              .catch((err) => {
                console.error('Chat error:', err);
              })
              .finally(() => setIsLoading(false));
          }}
        />
      </div>

      {/* Clear Chat Confirmation Modal */}
      <BasicModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="CLEAR CHAT HISTORY"
      >
        <div className="space-y-4">
          <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
            ARE YOU SURE YOU WANT TO CLEAR ALL CHAT MESSAGES? THIS ACTION CANNOT BE UNDONE.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
              className="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold font-mono"
            >
              CANCEL
            </Button>
            <Button
              onClick={clearChat}
              className="bg-red-600 hover:bg-white hover:text-red-600 text-white border-2 border-red-600 font-bold font-mono"
            >
              CLEAR CHAT
            </Button>
          </div>
        </div>
      </BasicModal>

      {/* Sign-in Prompt Modal */}
      <SignInPromptModal 
        isOpen={showSignInPrompt} 
        onClose={() => setShowSignInPrompt(false)} 
      />
    </div>
  )
}

export default ChatComponent