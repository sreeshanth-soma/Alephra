"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base64DecodeUnicode } from '@/lib/export-utils';

export default function SharedHealthData() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decodeData = async () => {
      try {
        const encoded = params.id as string;
        
        if (!encoded) {
          setError('No share ID provided in the URL.');
          setLoading(false);
          return;
        }
        
        let decoded;
        
        // Try the new Unicode-safe decoder first
        try {
          const decodedString = base64DecodeUnicode(encoded);
          decoded = JSON.parse(decodedString);
        } catch (unicodeErr) {
          // Fallback to standard atob for backwards compatibility
          console.warn('Unicode decode failed, trying standard atob:', unicodeErr);
          try {
            const decodedString = atob(encoded);
            decoded = JSON.parse(decodedString);
          } catch (atobErr) {
            console.error('Both decode methods failed:', atobErr);
            throw new Error('Unable to decode share link');
          }
        }
        
        // Validate decoded data structure
        if (!decoded || !decoded.data) {
          setError('Share link contains invalid data structure.');
          setLoading(false);
          return;
        }
        
        // Check if link has expired
        if (decoded.expiresAt && Date.now() > decoded.expiresAt) {
          setError('This shared link has expired. Shared links are valid for 7 days.');
          setLoading(false);
          return;
        }

        setData(decoded.data);
        setLoading(false);
      } catch (err) {
        console.error('Error decoding shared data:', err);
        setError(`Unable to load shared data. ${err instanceof Error ? err.message : 'Please request a new link.'}`);
        setLoading(false);
      }
    };

    decodeData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Data</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { vitals = [], labs = [], healthScore = 0, generatedAt } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Shared Health Data</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Generated on {new Date(generatedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <Badge variant="outline" className="mt-2">
            <Calendar className="w-3 h-3 mr-1" />
            Valid for 7 days
          </Badge>
        </div>

        {/* Health Score */}
        {healthScore > 0 && (
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Activity className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Overall Health Score</h3>
                  <p className="text-white/90">Based on vitals & lab results</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">{healthScore}</span>
                <span className="text-2xl">/100</span>
              </div>
            </div>
          </Card>
        )}

        {/* Vitals Chart */}
        {vitals.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vitals Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitals}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hr" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Heart Rate"
                      dot={{ fill: '#ef4444', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="spo2" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="SpO2"
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lab Results */}
        {labs.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lab Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labs.map((lab: any, index: number) => {
                  const isNormal = lab.value >= lab.normalRange.min && lab.value <= lab.normalRange.max;
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">{lab.name}</p>
                        <Badge variant={isNormal ? "default" : "destructive"}>
                          {isNormal ? "Normal" : "Abnormal"}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {lab.value} <span className="text-sm text-gray-600 dark:text-gray-400">{lab.unit}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Normal: {lab.normalRange.min} - {lab.normalRange.max}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {lab.date}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>This is a secure, read-only view of shared health data.</p>
          <p className="mt-1">Generated by Alephra - AI-Powered Healthcare Analytics</p>
        </div>
      </div>
    </div>
  );
}
