/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
// Removed unused icons after simplifying the details card
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    { 1: true } // Auto-expand AI Analysis (id: 1) on load
  );
  const [viewMode, setViewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true); // Start with rotation enabled
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(1); // Set AI Analysis as active on load
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        // Opening a node
        setActiveNodeId(id);
        // Keep rotation going even when a node is expanded
        setAutoRotate(true);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        // Closing a node
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  // Define functions before using them in useEffect
  const getRelatedItems = useCallback((itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  }, [timelineData]);

  const centerViewOnNode = useCallback((nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(-targetAngle);
  }, [viewMode, timelineData]);

  // Set up client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up initial state for AI Analysis expansion
  useEffect(() => {
    if (!isClient) return;
    
    const relatedItems = getRelatedItems(1); // AI Analysis related items
    const newPulseEffect: Record<number, boolean> = {};
    relatedItems.forEach((relId) => {
      newPulseEffect[relId] = true;
    });
    setPulseEffect(newPulseEffect);
    centerViewOnNode(1);
  }, [isClient, getRelatedItems, centerViewOnNode]);

  useEffect(() => {
    // Always clear the existing timer when autoRotate or viewMode changes
    if (rotationTimerRef.current) {
      clearInterval(rotationTimerRef.current);
      rotationTimerRef.current = null;
    }

    if (autoRotate && viewMode === "orbital") {
      rotationTimerRef.current = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.5) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    // Cleanup function: clear the timer when the component unmounts or effect re-runs
    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
        rotationTimerRef.current = null;
      }
    };
  }, [autoRotate, viewMode]);

  const calculateNodePosition = (index: number, total: number) => {
    const baseAngle = (index / total) * 360;
    const angle = (baseAngle + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, angle, zIndex, opacity };
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-green-600 border-green-600 dark:text-white dark:bg-green-600 dark:border-green-600";
      case "in-progress":
        return "text-white bg-blue-600 border-blue-600 dark:text-white dark:bg-blue-600 dark:border-blue-600";
      case "pending":
        return "text-white bg-gray-600 border-gray-600 dark:text-white dark:bg-gray-600 dark:border-gray-600";
      default:
        return "text-white bg-gray-600 border-gray-600 dark:text-white dark:bg-gray-600 dark:border-gray-600";
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center overflow-hidden -mt-6">
        <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center overflow-hidden -mt-6 relative z-40"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(0px, 0px)`,
          }}
        >
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
            <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70"></div>
            <div
              className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md"></div>
          </div>

          <div className="absolute w-96 h-96 rounded-full border-2 border-black/40 dark:border-white/30"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${Math.round(position.x)}px, ${Math.round(position.y)}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute transition-all duration-700 cursor-pointer relative z-50"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                ></div>

                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    isExpanded
                      ? "bg-white dark:bg-white text-black"
                      : isRelated
                      ? "bg-white/70 dark:bg-white/70 text-black"
                      : "bg-black dark:bg-white text-white dark:text-black"
                  }
                  border-2 
                  ${
                    isExpanded
                      ? "border-black dark:border-white shadow-lg shadow-black/50 dark:shadow-white/50"
                      : isRelated
                      ? "border-black dark:border-white animate-pulse"
                      : "border-black/50 dark:border-white/70"
                  }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-150" : ""}
                `}
                >
                  <Icon size={16} />
                </div>

                <div
                  className={`
                  absolute top-12  whitespace-nowrap
                  text-xs font-bold tracking-wider
                  transition-all duration-300
                  ${isExpanded ? "text-black dark:text-white scale-125" : "text-black dark:text-white"}
                `}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-black/50 dark:border-white/50 shadow-xl shadow-black/20 dark:shadow-white/20 overflow-visible relative z-60">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-black/70 dark:bg-white/70"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={`px-2 text-xs font-semibold ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                            ? "IN PROGRESS"
                            : "PENDING"}
                        </Badge>
                        <span className="text-xs font-mono font-semibold text-black/70 dark:text-white/70">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-sm mt-2 font-bold text-black dark:text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs font-medium text-black dark:text-white">
                      <p>{item.content}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
