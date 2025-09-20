/* eslint-disable react/no-unescaped-entities */

"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SplineBackgroundProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function SplineBackground({ 
  className,
  width = '100%',
  height = '100%'
}: SplineBackgroundProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Remove Spline watermark by injecting CSS
    const removeWatermark = () => {
      if (iframeRef.current) {
        try {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDoc) {
            // Create style element to hide watermark
            const style = iframeDoc.createElement('style');
            style.textContent = `
              .spline-watermark,
              [class*="watermark"],
              [class*="spline-branding"],
              .spline-branding,
              .spline-credit,
              [data-testid="spline-credit"],
              .spline-logo,
              [class*="logo"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
              }
            `;
            iframeDoc.head.appendChild(style);
          }
        } catch (error) {
          // Cross-origin restrictions may prevent this, but we try anyway
          console.log('Could not remove watermark due to cross-origin restrictions');
        }
      }
    };

    // Try to remove watermark after iframe loads
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = removeWatermark;
    }
  }, []);

  return (
    <div className={cn("absolute inset-0 w-full h-full", className)}>
      <iframe
        ref={iframeRef}
        src="https://my.spline.design/voiceinteractionanimation-INMeY9UAdUCcTSLvaLJLFFdE/"
        width={width}
        height={height}
        frameBorder="0"
        className="w-full h-full"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        title="Voice Interaction Animation"
        style={{
          border: 'none',
          outline: 'none',
          pointerEvents: 'auto', // Allow pointer events for face following
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />
      
      {/* Design overlay to cover Spline watermark */}
      <div className="absolute bottom-0 right-0 z-10">
        <div className="bg-black/80 backdrop-blur-sm rounded-tl-3xl p-6">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span className="text-xs font-medium ml-2">AI Voice Assistant</span>
          </div>
        </div>
      </div>
      
      {/* Additional decorative elements */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-gradient-to-bl from-transparent via-blue-500/10 to-transparent w-32 h-32 rounded-bl-full"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 z-10">
        <div className="bg-gradient-to-tr from-transparent via-purple-500/10 to-transparent w-24 h-24 rounded-tr-full"></div>
      </div>
    </div>
  );
}

export default SplineBackground;
