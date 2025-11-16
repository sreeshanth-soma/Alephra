/* eslint-disable react/no-unescaped-entities */

import type { UIMessage as Message } from 'ai';
import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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
    <div className='flex flex-col gap-4 h-full custom-scrollbar relative'>
      {/* Subtle animated background to match brutalist theme */}
      <motion.div
        className="absolute inset-0 -z-10 bg-white dark:bg-black"
      />
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
              <Card className="max-w-[85%] bg-white dark:bg-black border-2 border-black dark:border-white">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="h-4 w-4 text-black dark:text-white" strokeWidth={2.5} />
                    <span className="font-bold font-mono text-black dark:text-white">
                      {item.message}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-400">
                    QUERY: &quot;{item.query}&quot;
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        
        if (item.type === "pinecone_results") {
          return (
            <div key={`pinecone-${index}`} className="flex justify-start">
              <Card className="max-w-[85%] bg-white dark:bg-black border-2 border-black dark:border-white">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <Database className="h-4 w-4 text-black dark:text-white" strokeWidth={2.5} />
                    <span className="font-bold font-mono text-black dark:text-white">
                      {item.message}
                    </span>
                    <Badge variant="secondary" className="text-xs font-mono bg-black dark:bg-white text-white dark:text-black">
                      {item.matchCount} MATCHES
                    </Badge>
                  </div>
                  {item.retrievals && !item.retrievals.includes("<nomatches>") && (
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto">
                      <div className="font-bold mb-1">RETRIEVED FINDINGS:</div>
                      <div className="space-y-1">
                        {item.retrievals.split("Clinical Finding").slice(1).map((finding: string, idx: number) => (
                          <div key={idx} className="text-xs bg-gray-100 dark:bg-gray-900 p-2 border border-black dark:border-white">
                            FINDING {idx + 1}: {finding.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.retrievals && item.retrievals.includes("<nomatches>") && (
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      NO RELEVANT CLINICAL FINDINGS FOUND IN DATABASE
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
              <Card className="max-w-[85%] bg-white dark:bg-black border-2 border-red-600">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-600" strokeWidth={2.5} />
                    <span className="font-bold font-mono text-red-600">
                      {item.message}
                    </span>
                  </div>
                  {item.error && (
                    <div className="mt-1 text-xs font-mono text-red-600">
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
        <motion.div
          className="flex items-center space-x-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <div className="flex items-center gap-1 px-4 py-3 max-w-[40%] bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-mono font-bold">
            <span className="w-2 h-2 bg-white dark:bg-black animate-pulse"></span>
            <span className="w-2 h-2 bg-white dark:bg-black animate-pulse [animation-delay:200ms]"></span>
            <span className="w-2 h-2 bg-white dark:bg-black animate-pulse [animation-delay:400ms]"></span>
            <span className="ml-2">ALEPHRA IS THINKING...</span>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default Messages