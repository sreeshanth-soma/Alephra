"use client";
import React from 'react'
import { Textarea } from '../ui/textarea'
import { useChat } from '@ai-sdk/react';
import { Button } from '../ui/button';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import Messages from './messages';

type Props = {
  reportData?: string
}

const ChatComponent = ({ reportData }: Props) => {
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, data, error } =
    useChat({
      api: "/api/medichatgemini",
      onError: (error) => {
        console.error("Chat error:", error);
      },
      onFinish: (message) => {
        console.log("Chat finished:", message);
      },
    });
    
  return (
    <div className="h-[500px] bg-white dark:bg-zinc-900 relative flex flex-col rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl">
      <div className="absolute -top-3 left-6 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-gray-200 dark:border-gray-800 shadow-lg">
        <Badge 
          variant="secondary" 
          className={`text-sm font-semibold transition-all duration-200 ${
            reportData 
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" 
              : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          }`}
        >
          {reportData ? "✓ Report Loaded" : "No Report"}
        </Badge>
      </div>
      
      <div className="flex-1 p-6 pt-8 overflow-hidden">
        <Messages messages={messages} isLoading={isLoading} data={data} />
      </div>
      
      <div className="p-6 pt-0">
        <form
          className="relative group"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(event, {
              data: {
                reportData: reportData as string,
              },
            });
          }}
        >
          <div className="relative">
            <Textarea
              value={input ?? ''}
              onChange={(e) => {
                // use hook setter directly to avoid any binding issues
                setInput?.(e.target.value);
                // keep compatibility with older hook shape
                handleInputChange?.(e);
              }}
              placeholder="Ask about your medical report..."
              className="min-h-[52px] max-h-32 resize-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-0 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-12 relative z-10"
            />
            <Button
              disabled={isLoading || !(input ?? '').trim()}
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