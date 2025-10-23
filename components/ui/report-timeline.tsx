"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Minus, Filter, Download, Eye } from 'lucide-react';
import { PrescriptionRecord } from '@/lib/prescription-storage';
import { extractMetricsFromReport, HealthMetric } from '@/lib/health-analytics';

interface ReportTimelineProps {
  prescriptions: PrescriptionRecord[];
  onReportSelect?: (prescription: PrescriptionRecord) => void;
}

type TestCategory = 'All' | 'Blood Test' | 'Lipid Panel' | 'Metabolic' | 'Complete Blood Count' | 'Other';

export const ReportTimeline: React.FC<ReportTimelineProps> = ({ prescriptions, onReportSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<TestCategory>('All');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'chart'>('timeline');

  // Categories for filtering
  const categories: TestCategory[] = ['All', 'Blood Test', 'Lipid Panel', 'Metabolic', 'Complete Blood Count', 'Other'];

  // Extract and organize metrics from all reports
  const timelineData = useMemo(() => {
    return prescriptions
      .map(p => {
        const metrics = extractMetricsFromReport(p.reportData);
        return {
          id: p.id,
          fileName: p.fileName,
          date: p.uploadedAt,
          metrics: metrics,
          summary: p.summary,
          category: categorizeReport(p.fileName, p.summary)
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [prescriptions]);

  // Filter by category
  const filteredData = useMemo(() => {
    if (selectedCategory === 'All') return timelineData;
    return timelineData.filter(d => d.category === selectedCategory);
  }, [timelineData, selectedCategory]);

  // Get unique metrics across all reports
  const availableMetrics = useMemo(() => {
    const metricsSet = new Set<string>();
    filteredData.forEach(report => {
      report.metrics.forEach(m => metricsSet.add(m.name));
    });
    return Array.from(metricsSet);
  }, [filteredData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredData.map(report => {
      const dataPoint: any = {
        date: report.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: report.date.getTime()
      };
      
      report.metrics.forEach(metric => {
        dataPoint[metric.name] = metric.value;
      });
      
      return dataPoint;
    });
  }, [filteredData]);

  // Calculate trend for a metric
  const calculateTrend = (metricName: string, reportIndex: number): 'up' | 'down' | 'stable' => {
    if (reportIndex === 0) return 'stable';
    
    const currentReport = filteredData[reportIndex];
    const previousReport = filteredData[reportIndex - 1];
    
    const currentMetric = currentReport.metrics.find(m => m.name === metricName);
    const previousMetric = previousReport.metrics.find(m => m.name === metricName);
    
    if (!currentMetric || !previousMetric) return 'stable';
    
    const diff = currentMetric.value - previousMetric.value;
    if (Math.abs(diff) < 0.01) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  // Get metric color based on status
  const getMetricColor = (metric: HealthMetric): string => {
    if (metric.status === 'normal') return 'text-green-600 dark:text-green-400';
    if (metric.status === 'abnormal') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Export timeline data
  const exportTimeline = () => {
    const csvContent = [
      ['Date', 'Report', ...availableMetrics].join(','),
      ...filteredData.map(report => {
        const row = [
          report.date.toLocaleDateString(),
          report.fileName,
          ...availableMetrics.map(metricName => {
            const metric = report.metrics.find(m => m.name === metricName);
            return metric ? metric.value.toString() : '';
          })
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Lab Result Timeline</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your health metrics over time across {filteredData.length} reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'timeline' ? 'chart' : 'timeline')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'timeline' ? 'Chart View' : 'Timeline View'}
          </button>
          <button
            onClick={exportTimeline}
            className="p-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Export timeline"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Metric filter for chart view */}
      {viewMode === 'chart' && availableMetrics.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">Show metric:</span>
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedMetric === 'all'
                ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Metrics
          </button>
          {availableMetrics.map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedMetric === metric
                  ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'timeline' ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500" />

            <div className="space-y-6">
              {filteredData.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-4 border-cyan-500 shadow-lg" />

                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => onReportSelect?.(prescriptions.find(p => p.id === report.id)!)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-black dark:text-white">
                              {report.fileName}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {report.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {report.date.toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReportSelect?.(prescriptions.find(p => p.id === report.id)!);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {report.metrics.slice(0, 8).map((metric, metricIndex) => {
                          const trend = calculateTrend(metric.name, index);
                          return (
                            <div
                              key={metricIndex}
                              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {metric.name}
                                </span>
                                {trend !== 'stable' && (
                                  <span className={trend === 'up' ? 'text-red-500' : 'text-green-500'}>
                                    {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                  </span>
                                )}
                              </div>
                              <div className={`text-lg font-bold ${getMetricColor(metric)}`}>
                                {metric.value} <span className="text-xs font-normal">{metric.unit}</span>
                              </div>
                              {metric.normalRange && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Normal: {metric.normalRange.min}-{metric.normalRange.max}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {report.metrics.length > 8 && (
                        <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          +{report.metrics.length - 8} more metrics
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      {(selectedMetric === 'all' ? availableMetrics : [selectedMetric]).map((metric, idx) => (
                        <Line
                          key={metric}
                          type="monotone"
                          dataKey={metric}
                          stroke={getLineColor(idx)}
                          strokeWidth={2}
                          dot={{ fill: getLineColor(idx), strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No reports in this category
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Upload more reports or select a different category
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to categorize reports
function categorizeReport(fileName: string, summary: string): TestCategory {
  const content = `${fileName} ${summary}`.toLowerCase();
  
  if (content.includes('lipid') || content.includes('cholesterol') || content.includes('hdl') || content.includes('ldl')) {
    return 'Lipid Panel';
  }
  if (content.includes('glucose') || content.includes('hba1c') || content.includes('diabetes')) {
    return 'Metabolic';
  }
  if (content.includes('cbc') || content.includes('complete blood') || content.includes('hemoglobin') || content.includes('wbc')) {
    return 'Complete Blood Count';
  }
  if (content.includes('blood')) {
    return 'Blood Test';
  }
  return 'Other';
}

// Helper function to get line colors
function getLineColor(index: number): string {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  return colors[index % colors.length];
}
