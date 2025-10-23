"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  title: string
  description: string
  targetElement?: string
  image?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingTourProps {
  steps: OnboardingStep[]
  onComplete: () => void
  onSkip: () => void
  storageKey?: string
}

export function OnboardingTour({ 
  steps, 
  onComplete, 
  onSkip,
  storageKey = "onboarding-completed" 
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(storageKey)
    if (!completed) {
      setIsVisible(true)
    }
  }, [storageKey])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true")
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem(storageKey, "true")
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      >
        {/* Highlight target element */}
        {step.targetElement && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Add spotlight effect here if needed */}
          </div>
        )}

        {/* Onboarding card */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="relative w-full max-w-lg bg-white dark:bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-900">
              <motion.div
                className="h-full bg-black dark:bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="p-8 pt-12">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-black dark:bg-white">
                  <Sparkles className="h-8 w-8 text-white dark:text-black" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">
                  {step.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Image or illustration */}
              {step.image && (
                <div className="mb-6 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 h-48 flex items-center justify-center">
                  <div className="text-gray-400 dark:text-gray-600">
                    {/* Image placeholder - use Next/Image when needed */}
                    <Sparkles className="h-16 w-16" />
                  </div>
                </div>
              )}

              {/* Custom action button */}
              {step.action && (
                <div className="mb-6">
                  <Button
                    onClick={step.action.onClick}
                    className="w-full"
                    size="lg"
                  >
                    {step.action.label}
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={cn(
                    "flex-1",
                    currentStep === 0 && "invisible"
                  )}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {/* Step indicators */}
                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentStep 
                          ? "bg-black dark:bg-white w-6" 
                          : "bg-gray-300 dark:bg-gray-700"
                      )}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  className="flex-1"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Get Started
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip link */}
              <div className="text-center mt-4">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  Skip tutorial
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Feature tooltip component
interface FeatureTooltipProps {
  title: string
  description: string
  position?: "top" | "bottom" | "left" | "right"
  onDismiss: () => void
}

export function FeatureTooltip({ 
  title, 
  description, 
  position = "top",
  onDismiss 
}: FeatureTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "absolute z-50 max-w-xs p-4 bg-black text-white rounded-lg shadow-xl",
        position === "top" && "bottom-full mb-2",
        position === "bottom" && "top-full mt-2",
        position === "left" && "right-full mr-2",
        position === "right" && "left-full ml-2"
      )}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
      
      <div className="pr-6">
        <h3 className="font-semibold mb-1 text-sm">{title}</h3>
        <p className="text-xs text-gray-300">{description}</p>
      </div>

      {/* Arrow */}
      <div
        className={cn(
          "absolute w-2 h-2 bg-black rotate-45",
          position === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
          position === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
          position === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
          position === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
        )}
      />
    </motion.div>
  )
}
