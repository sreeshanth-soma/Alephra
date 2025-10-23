"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
        >
          <div
            className={`
              flex items-center gap-3 px-6 py-3 rounded-full shadow-lg backdrop-blur-lg
              ${isOnline 
                ? "bg-green-500/90 text-white" 
                : "bg-red-500/90 text-white"
              }
            `}
          >
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5" />
                <span className="font-medium">Back online!</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5" />
                <span className="font-medium">No internet connection</span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Persistent indicator when offline */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-20 md:bottom-4 right-4 z-50"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/90 text-white shadow-lg backdrop-blur-lg">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Offline</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
