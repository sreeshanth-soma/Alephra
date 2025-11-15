"use client";

import { Mic, MicOff, Volume2, VolumeX, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SplineBackground } from "./SplineBackground";

interface VoiceChatInteractiveProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onStopAudio?: () => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
  demoMode?: boolean;
  isRecording?: boolean;
  isProcessing?: boolean;
  isPlaying?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
}

export function VoiceChatInteractive({
  onStart,
  onStop,
  onStopAudio,
  onVolumeChange,
  className,
  demoMode = true,
  isRecording: externalIsRecording = false,
  isProcessing: externalIsProcessing = false,
  isPlaying: externalIsPlaying = false
}: VoiceChatInteractiveProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>(Array(32).fill(0));
  const intervalRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();

  // Use external state when not in demo mode
  const actualIsListening = demoMode ? isListening : externalIsRecording;
  const actualIsProcessing = demoMode ? isProcessing : externalIsProcessing;
  const actualIsSpeaking = demoMode ? isSpeaking : externalIsPlaying;

  // Generate particles for ambient effect
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 400,
          y: Math.random() * 400,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
          }
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.velocity.x + 400) % 400,
        y: (particle.y + particle.velocity.y + 400) % 400,
        opacity: particle.opacity + (Math.random() - 0.5) * 0.02
      })));
      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animationRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Timer and waveform simulation
  useEffect(() => {
    const shouldAnimate = demoMode ? isListening : actualIsListening;
    
    if (shouldAnimate) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
        
        // Simulate audio waveform
        const newWaveform = Array(32).fill(0).map(() => 
          Math.random() * (shouldAnimate ? 100 : 20)
        );
        setWaveformData(newWaveform);
        
        // Simulate volume changes
        const newVolume = Math.random() * 100;
        setVolume(newVolume);
        onVolumeChange?.(newVolume);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setWaveformData(Array(32).fill(0));
      setVolume(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isListening, actualIsListening, demoMode, onVolumeChange]);

  // Demo mode simulation
  useEffect(() => {
    if (!demoMode) return;

    const demoSequence = async () => {
      // Start listening
      setIsListening(true);
      onStart?.();
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stop listening and start processing
      setIsListening(false);
      setIsProcessing(true);
      onStop?.(duration);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start speaking response
      setIsProcessing(false);
      setIsSpeaking(true);
      
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Reset
      setIsSpeaking(false);
      setDuration(0);
      
      // Repeat demo
      setTimeout(demoSequence, 2000);
    };

    const timeout = setTimeout(demoSequence, 1000);
    return () => clearTimeout(timeout);
  }, [demoMode, onStart, onStop, duration]);

  const handleToggleListening = () => {
    if (demoMode) return;
    
    if (actualIsListening) {
      onStop?.(duration);
      setDuration(0);
    } else {
      onStart?.();
    }
  };

  // Sync with external state changes
  useEffect(() => {
    if (!demoMode) {
      // Sync internal state with external state
      setIsListening(externalIsRecording);
      setIsProcessing(externalIsProcessing);
      setIsSpeaking(externalIsPlaying);
    }
  }, [externalIsRecording, externalIsProcessing, externalIsPlaying, demoMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    if (actualIsListening) return "Listening...";
    if (actualIsProcessing) return "Processing...";
    if (actualIsSpeaking) return "Speaking...";
    return "Tap to speak";
  };

  const getStatusColor = () => {
    if (actualIsListening) return "text-blue-400";
    if (actualIsProcessing) return "text-yellow-400";
    if (actualIsSpeaking) return "text-green-400";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Spline Animation - Top layer for pointer interaction */}
      <SplineBackground className="absolute top-8 left-0 right-0 bottom-0 z-20" />

      {/* Subtle overlay for better contrast */}
      <div className="absolute inset-0 z-25 bg-black/5" />

      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity
            }}
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Voice Controls - Positioned at top middle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        {/* Main voice button - centered */}
        <motion.div
          className="relative inline-block"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.button
            onClick={handleToggleListening}
            className={cn(
              "relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-white/95 backdrop-blur-sm border-2 shadow-lg",
              actualIsListening ? "border-blue-500 shadow-blue-500/25" :
              actualIsProcessing ? "border-yellow-500 shadow-yellow-500/25" :
              actualIsSpeaking ? "border-green-500 shadow-green-500/25" :
              "border-gray-600 hover:border-primary/50"
            )}
            animate={{
              boxShadow: actualIsListening 
                ? ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 20px rgba(59, 130, 246, 0)"]
                : undefined
            }}
            transition={{
              duration: 1.5,
              repeat: actualIsListening ? Infinity : 0
            }}
          >
            <AnimatePresence mode="wait">
              {actualIsProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
                </motion.div>
              ) : actualIsSpeaking ? (
                <motion.div
                  key="speaking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Volume2 className="w-16 h-16 text-green-500" />
                </motion.div>
              ) : actualIsListening ? (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Mic className="w-16 h-16 text-blue-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Mic className="w-16 h-16 text-gray-600" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status text inside button */}
            <AnimatePresence mode="wait">
              {(actualIsListening || actualIsProcessing || actualIsSpeaking) && (
                <motion.p
                  key="status-text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-4 text-sm font-semibold"
                >
                  {getStatusText()}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pulse rings */}
          <AnimatePresence>
            {actualIsListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500/20"
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Original Status text, now only for idle state - positioned to the right of mic */}
        {!actualIsListening && !actualIsProcessing && !actualIsSpeaking && (
          <motion.p
            key="idle-status-text"
            className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap bg-blue-600 text-white shadow-md"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            Tap to speak
          </motion.p>
        )}

        {/* Stop button - only show when speaking, positioned to the right */}
        <AnimatePresence>
          {actualIsSpeaking && (
            <motion.div
              className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={onStopAudio}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors duration-200 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <VolumeX className="w-8 h-8" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Waveform visualizer - positioned higher up */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 flex items-center justify-center space-x-1 h-12">
        {waveformData.map((height, index) => (
          <motion.div
            key={index}
            className={cn(
              "w-1 rounded-full transition-colors duration-300",
              actualIsListening ? "bg-blue-500" :
              actualIsProcessing ? "bg-yellow-500" :
              actualIsSpeaking ? "bg-green-500" :
              "bg-gray-400"
            )}
            animate={{
              height: `${Math.max(4, height * 0.6)}px`,
              opacity: actualIsListening || actualIsSpeaking ? 1 : 0.3
            }}
            transition={{
              duration: 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* AI indicator - positioned at bottom right */}
      <motion.div
        className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-white bg-black px-3 py-2 rounded-lg shadow-lg border border-gray-700"
        style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Sparkles className="w-3 h-3 text-yellow-400" />
        <span className="font-medium">AI Voice Assistant</span>
      </motion.div>
    </div>
  );
}

export default VoiceChatInteractive;
