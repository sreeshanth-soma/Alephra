"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
  isRecording: boolean;
  isPlaying: boolean;
  isProcessing: boolean;
  className?: string;
}

export function VoiceVisualizer({ isRecording, isPlaying, isProcessing, className }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Initialize audio context
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyserNode = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          
          analyserNode.fftSize = 256;
          const bufferLength = analyserNode.frequencyBinCount;
          const dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
          
          source.connect(analyserNode);
          setAudioContext(audioCtx);
          setAnalyser(analyserNode);
          setDataArray(dataArray);
        } catch (error) {
          console.log('Audio context not available');
        }
      };

      initAudio();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (audioContext) {
          audioContext.close();
        }
      };
    }
  }, [isRecording, audioContext]);

  useEffect(() => {
    if (analyser && dataArray && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray as any);
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const barWidth = (canvas.width / dataArray.length) * 2.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < dataArray.length; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height;
            
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
            gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
          }
        }
        
        animationRef.current = requestAnimationFrame(draw);
      };

      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, dataArray, isRecording]);

  return (
    <div className={`relative ${className}`}>
      {/* Animated background circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isRecording && (
          <>
            <motion.div
              className="absolute w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-24 h-24 border-2 border-gray-400 dark:border-gray-500 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <motion.div
              className="absolute w-16 h-16 border-2 border-gray-500 dark:border-gray-400 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </>
        )}
      </div>

      {/* Voice visualization canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isRecording ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Processing animation */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-8 bg-gray-400 dark:bg-gray-500 rounded-full"
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Playing animation */}
      {isPlaying && !isRecording && !isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-16 h-16 border-4 border-gray-300 dark:border-gray-600 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )}
    </div>
  );
}
