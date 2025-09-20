/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import Messages from './messages';
import type { UIMessage as Message } from 'ai';
import { prescriptionStorage } from '@/lib/prescription-storage';

type Props = {
  reportData?: string
}

const ChatComponent = ({ reportData }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(undefined);
  const [allReportsData, setAllReportsData] = useState<string>("");

  // Load all reports when no specific report is provided
  useEffect(() => {
    if (!reportData) {
      const allPrescriptions = prescriptionStorage.getAllPrescriptions();
      if (allPrescriptions.length > 0) {
        const combinedReports = allPrescriptions
          .map((prescription, index) => 
            `**Report ${index + 1} (${prescription.fileName} - ${prescriptionStorage.formatDate(prescription.uploadedAt)}):**\n${prescription.reportData}`
          )
          .join('\n\n---\n\n');
        setAllReportsData(combinedReports);
      }
    }
  }, [reportData]);
    
  return (
    <div className="h-[600px] bg-white dark:bg-zinc-900 relative flex flex-col rounded-3xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="absolute -top-3 left-6 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-gray-300 dark:border-gray-700 shadow-lg">
        <Badge 
          variant="secondary" 
          className={`text-sm font-semibold transition-all duration-200 ${
            reportData || allReportsData
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" 
              : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          }`}
        >
          {reportData ? "✓ Report Loaded" : allReportsData ? `✓ ${prescriptionStorage.getPrescriptionsCount()} Reports Available` : "No Report"}
        </Badge>
      </div>
      
      <div className="flex-1 px-6 pt-6 pb-2 overflow-hidden">
        <Messages messages={messages} isLoading={isLoading} data={data} />
      </div>
      
      <div className="px-6 pb-6 pt-2">
        <form
          className="relative group"
          onSubmit={(event) => {
            event.preventDefault();
            const msg = input.trim();
            if (!msg) return;
            const nextMessages: Message[] = [...messages, { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text: msg }] }];
            setMessages(nextMessages);
            setInput("");
            setIsLoading(true);
            fetch('/api/medichatgemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                messages: nextMessages, 
                reportData: reportData || allReportsData 
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
        >
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => {
                const next = e.target.value;
                setInput(next);
              }}
              placeholder="Ask about your medical report..."
              className="min-h-[52px] max-h-32 resize-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-0 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-12 relative z-10"
            />
            <Button
              disabled={isLoading || !input.trim()}
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-black hover:bg-zinc-900 disabled:bg-gray-300 dark:disabled:bg-zinc-700 transition-all duration-200 shadow-lg z-20"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <CornerDownLeft className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatComponent