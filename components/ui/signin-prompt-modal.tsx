"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, Cloud, Zap, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';
import { signIn } from 'next-auth/react';

interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInPromptModal: React.FC<SignInPromptModalProps> = ({ isOpen, onClose }) => {
  const handleSignIn = () => {
    signIn('google', { callbackUrl: window.location.href });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg pointer-events-auto"
            >
              {/* Subtle glowing background effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-2xl blur-xl opacity-20 animate-pulse" />
              
              {/* Modal content */}
              <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Clean header with icon */}
                <div className="relative h-32 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 dark:from-zinc-800 dark:via-zinc-900 dark:to-black overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-gray-800 via-zinc-900 to-black opacity-60"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 bg-white dark:bg-zinc-100 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-200 dark:border-gray-300"
                    >
                      <Image 
                        src="/logo.jpg" 
                        alt="MedScan Logo" 
                        width={56} 
                        height={56} 
                        className="object-contain rounded-full"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-center mb-2 text-black dark:text-white">
                      Unlock Your Health Hub
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                      Sign in to access powerful features and keep your medical data secure
                    </p>
                  </motion.div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {[
                      { icon: Cloud, text: "Sync reports across all your devices", delay: 0.4 },
                      { icon: Lock, text: "Secure, encrypted storage for your data", delay: 0.5 },
                      { icon: Zap, text: "AI-powered instant report analysis", delay: 0.6 },
                      { icon: CheckCircle2, text: "Never lose your medical history", delay: 0.7 },
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: feature.delay }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
                          <feature.icon className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {feature.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <Button
                      onClick={handleSignIn}
                      className="w-full h-12 text-base font-semibold bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </span>
                    </Button>

                    <button
                      onClick={onClose}
                      className="w-full h-10 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Maybe later
                    </button>
                  </motion.div>

                  {/* Trust badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>HIPAA Compliant</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>256-bit Encrypted</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
