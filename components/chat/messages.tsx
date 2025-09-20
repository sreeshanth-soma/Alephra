/* eslint-disable react/no-unescaped-entities */

import type { UIMessage as Message } from 'ai';
import React, { useEffect, useRef } from 'react'
import MessageBox from './messagebox';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Database, Zap, AlertCircle } from 'lucide-react';

type Props = {
  messages: Message[];
  isLoading: boolean;
  data?: any[];
}

const Messages = ({ messages, isLoading, data }: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  // Normalize possible data shapes from API
  let parsedObject: any | null = null;
  if (data && !Array.isArray(data)) {
    if (typeof data === 'string') {
      try { parsedObject = JSON.parse(data); } catch { parsedObject = null; }
    } else if (typeof data === 'object') {
      parsedObject = data as any;
    }
  }

  return (
    <div className='flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar max-h-[500px]'>
      {messages.map((m, index) => {
        // Extract content from parts array or fallback to content string
        let messageContent = '';
        if (m.parts && m.parts.length > 0) {
          messageContent = m.parts.map(part => ('text' in part && typeof part.text === 'string') ? part.text : '').join('');
        }
        
        return <MessageBox key={index} role={m.role} content={messageContent} />
      })}
      
      {/* Assistant reply is appended to messages by the client handler; avoid duplicate rendering from data */}

      {/* Display streaming/extra data if array */}
      {Array.isArray(data) && data.map((item, index) => {
        if (item.type === "vector_conversion") {
          return (
            <div key={`vector-${index}`} className="flex justify-start">
              <Card className="max-w-[85%] bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {item.message}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                    Query: &quot;{item.query}&quot;
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        
        if (item.type === "pinecone_results") {
          return (
            <div key={`pinecone-${index}`} className="flex justify-start">
              <Card className="max-w-[85%] bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {item.message}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.matchCount} matches
                    </Badge>
                  </div>
                  {item.retrievals && !item.retrievals.includes("<nomatches>") && (
                    <div className="text-xs text-green-600 dark:text-green-300 max-h-20 overflow-y-auto">
                      <div className="font-medium mb-1">Retrieved findings:</div>
                      <div className="space-y-1">
                        {item.retrievals.split("Clinical Finding").slice(1).map((finding: string, idx: number) => (
                          <div key={idx} className="text-xs bg-green-100 dark:bg-green-800/30 p-2 rounded">
                            Finding {idx + 1}: {finding.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.retrievals && item.retrievals.includes("<nomatches>") && (
                    <div className="text-xs text-yellow-600 dark:text-yellow-300">
                      No relevant clinical findings found in database
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        }
        
        if (item.type === "error") {
          return (
            <div key={`error-${index}`} className="flex justify-start">
              <Card className="max-w-[85%] bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-200">
                      {item.message}
                    </span>
                  </div>
                  {item.error && (
                    <div className="mt-1 text-xs text-red-600 dark:text-red-300">
                      {item.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        }
        
        return null;
      })}
      
      {isLoading && (
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>MedScan is thinking...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default Messages