"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface BasicModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
  full: "max-w-4xl",
}

export default function BasicModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: BasicModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null
      if (!isOpen) return
      if (modalRef.current && target && !modalRef.current.contains(target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [isOpen, onClose])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (black) */}
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-40 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === overlayRef.current) onClose()
            }}
          />

          {/* Modal container */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "basic-modal-title" : undefined}
              className={`${modalSizes[size]} relative mx-auto w-full rounded-xl border border-gray-200 dark:border-gray-400 bg-white dark:bg-black p-4 text-gray-900 dark:text-white shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 sm:p-6`}
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between gap-2">
                {title && (
                  <h3 id="basic-modal-title" className="text-xl font-medium leading-6">
                    {title}
                  </h3>
                )}
              </div>

              {/* Content */}
              <div className="relative">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (!mounted) return null
  const target = typeof window !== 'undefined' ? document.body : null
  return target ? createPortal(content, target) : null
}
