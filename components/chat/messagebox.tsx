import React from 'react'
import Markdown from '../markdown'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  role: string,
  content: string
}

const MessageBox = ({ role, content }: Props) => {
  const isUser = role === "user";
  let displayContent = content;
  // If the content is a JSON string like { text: "...", retrievals: "..." }, extract text
  if (!isUser && typeof content === 'string' && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.text === 'string') {
        displayContent = parsed.text;
      }
    } catch {}
  }
  
  return (
    <motion.div
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          'overflow-hidden max-w-[85%] px-4 py-3 rounded-xl shadow-md backdrop-blur-md text-sm border-2',
          isUser
            ? 'bg-white text-black border-gray-500 dark:border-gray-700'
            : 'bg-black text-white border-white/25 dark:border-white/20'
        )}
      >
        <Markdown text={displayContent} />
        {!isUser && displayContent && displayContent.length > 20 && !displayContent.toLowerCase().includes("you're welcome") && !displayContent.toLowerCase().includes('hello') && (
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] opacity-80">
            Disclaimer: Medical advice is for informational purposes only and should not replace professional medical diagnosis.
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MessageBox