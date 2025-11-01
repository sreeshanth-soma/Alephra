/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button';
import { CornerDownLeft, Loader2, Trash2 } from 'lucide-react';
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
        // Check if a specific report ID is selected (from props or localStorage)
        const storedReportId = localStorage.getItem('selectedReportId');
        const effectiveReportId = selectedReportId || storedReportId;
        
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
    <div className="h-[600px] bg-white dark:bg-zinc-900 relative flex flex-col rounded-3xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="absolute -top-3 left-6 z-20 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-gray-300 dark:border-gray-700 shadow-lg">
        <Badge 
          variant="secondary" 
          className={`text-sm font-semibold transition-all duration-200 cursor-pointer ${
            reportData || allReportsData
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" 
              : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          }`}
          onClick={() => {
            if (localStorage.getItem('selectedReportId') || selectedReportId) {
              localStorage.removeItem('selectedReportId');
              window.location.reload();
            }
          }}
        >
          {selectedReportName 
            ? `✓ ${selectedReportName}` 
            : reportData || (allReportsData && prescriptionCount === 1) 
              ? "✓ Report Loaded" 
              : allReportsData 
                ? `✓ ${prescriptionCount} ${prescriptionCount === 1 ? 'Report' : 'Reports'} Available` 
                : "No Report"}
        </Badge>
      </div>
      
      {/* Clear Chat Button */}
      {messages.length > 0 && (
        <div className="absolute -top-3 right-6 z-10">
          <Button
            onClick={() => setShowClearModal(true)}
            size="sm"
            variant="outline"
            className="h-8 px-3 bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 shadow-sm rounded-full"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
      
      <div className="flex-1 px-6 pt-16 pb-2 overflow-hidden">
        <Messages messages={messages} isLoading={isLoading} data={data} />
      </div>
      
      <div className="px-6 pb-6 pt-2">
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
        title="Clear Chat History"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to clear all chat messages? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={clearChat}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Chat
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