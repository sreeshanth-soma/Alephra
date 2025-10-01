"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface LoadingState {
  text: string;
}

interface MultiStepLoaderProps {
  loadingStates: LoadingState[];
  loading: boolean;
  duration?: number; // total duration in ms (approx)
  onClose?: () => void; // Optional close handler
}

export function MultiStepLoader({ loadingStates, loading, duration = 2000, onClose }: MultiStepLoaderProps) {
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      return;
    }
    const steps = loadingStates.length;
    const perStep = Math.max(200, Math.floor(duration / Math.max(1, steps)));

    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= steps) return prev; // stop at last
        return next;
      });
    }, perStep);
    return () => clearInterval(interval);
  }, [loading, duration, loadingStates.length]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div
            className="relative mx-auto w-full max-w-xl p-0 text-white"
            initial={{ scale: 0.96, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 8, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
          >
            <div className="space-y-4 w-fit mx-auto">
              {loadingStates.map((state, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    {index <= stepIndex ? (
                      <motion.div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${index === stepIndex ? 'bg-lime-500' : 'bg-gray-300'}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      >
                        <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-transparent"></div>
                    )}
                  </div>
                  <span className={`text-lg md:text-xl ${index === stepIndex ? 'text-lime-400' : index < stepIndex ? 'text-gray-100' : 'text-gray-400'}`}>
                    {state.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Close button */}
          {onClose && (
            <button
              className="fixed top-4 right-4 text-black dark:text-white z-[120]"
              onClick={onClose}
            >
              <X className="h-10 w-10" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MultiStepLoader;


