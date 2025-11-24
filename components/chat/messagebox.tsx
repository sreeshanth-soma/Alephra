import React from 'react'
import Markdown from '../markdown'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn("flex max-w-[95%] sm:max-w-[85%] gap-2 sm:gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar/Icon */}
        <div className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden border border-black dark:border-white",
          isUser 
            ? "bg-black dark:bg-white hidden" // Hide user avatar
            : "bg-white dark:bg-black"
        )}>
          {isUser ? (
            <div className="w-2 h-2 bg-white dark:bg-black rounded-full" />
          ) : (
            <div className="relative w-full h-full">
               <Image 
                 src="/logo.jpg" 
                 alt="Bot" 
                 fill
                 className="object-cover"
               />
            </div>
          )}
        </div>

        <div
          className={cn(
            'px-3 py-2.5 sm:px-5 sm:py-3.5 shadow-sm text-xs sm:text-sm leading-relaxed border-2',
            isUser
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white rounded-2xl rounded-tr-sm'
              : 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white rounded-2xl rounded-tl-sm'
          )}
        >
          <Markdown text={displayContent} />
          {!isUser && displayContent && displayContent.length > 20 && !displayContent.toLowerCase().includes("you're welcome") && !displayContent.toLowerCase().includes('hello') && (
            <div className="mt-2 sm:mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              Medical advice is for informational purposes only.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBox