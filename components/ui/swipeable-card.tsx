"use client"

import { useState, useRef, useEffect } from "react"
import { motion, PanInfo, useAnimation } from "framer-motion"
import { Trash2, Archive, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SwipeAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bgColor: string
  onAction: () => void
}

interface SwipeableCardProps {
  children: React.ReactNode
  onDelete?: () => void
  onArchive?: () => void
  onShare?: () => void
  className?: string
  disabled?: boolean
}

export function SwipeableCard({ 
  children, 
  onDelete, 
  onArchive,
  onShare,
  className,
  disabled = false 
}: SwipeableCardProps) {
  const [dragState, setDragState] = useState<"idle" | "left" | "right">("idle")
  const constraintsRef = useRef(null)
  const controls = useAnimation()
  
  const leftActions: SwipeAction[] = []
  const rightActions: SwipeAction[] = []
  
  // Configure actions based on props
  if (onArchive) {
    leftActions.push({
      icon: Archive,
      label: "Archive",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      onAction: onArchive
    })
  }
  
  if (onShare) {
    leftActions.push({
      icon: Share2,
      label: "Share",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      onAction: onShare
    })
  }
  
  if (onDelete) {
    rightActions.push({
      icon: Trash2,
      label: "Delete",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      onAction: onDelete
    })
  }

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.x
    
    // Right swipe (show left actions)
    if (info.offset.x > threshold || velocity > 500) {
      if (leftActions.length > 0) {
        setDragState("left")
        await controls.start({ x: 120 })
      } else {
        await controls.start({ x: 0 })
      }
    }
    // Left swipe (show right actions)
    else if (info.offset.x < -threshold || velocity < -500) {
      if (rightActions.length > 0) {
        setDragState("right")
        await controls.start({ x: -120 })
      } else {
        await controls.start({ x: 0 })
      }
    }
    // Return to center
    else {
      setDragState("idle")
      await controls.start({ x: 0 })
    }
  }

  const handleActionClick = async (action: SwipeAction) => {
    await controls.start({ x: 0 })
    setDragState("idle")
    action.onAction()
  }

  // Reset on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dragState !== "idle") {
        controls.start({ x: 0 })
        setDragState("idle")
      }
    }
    
    if (dragState !== "idle") {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [dragState, controls])

  if (disabled || (leftActions.length === 0 && rightActions.length === 0)) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      {/* Left actions (Archive, Share) */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center gap-2 pl-4">
          {leftActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                onClick={() => handleActionClick(action)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium touch-manipulation",
                  action.bgColor,
                  action.color
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: dragState === "left" ? 1 : 0,
                  scale: dragState === "left" ? 1 : 0.8
                }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </motion.button>
            )
          })}
        </div>
      )}
      
      {/* Right actions (Delete) */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4">
          {rightActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                onClick={() => handleActionClick(action)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium touch-manipulation",
                  action.bgColor,
                  action.color
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: dragState === "right" ? 1 : 0,
                  scale: dragState === "right" ? 1 : 0.8
                }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </motion.button>
            )
          })}
        </div>
      )}
      
      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={cn(
          "relative touch-pan-y bg-white dark:bg-black",
          className
        )}
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </div>
  )
}
