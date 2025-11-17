"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Calendar, AlertTriangle, FileText, Lock, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base64DecodeUnicode } from '@/lib/export-utils';
import { prescriptionStorage } from '@/lib/prescription-storage';
import Markdown from '@/components/markdown';

export default function SharedHealthData() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [shareType, setShareType] = useState<'health' | 'report'>('health');
  const [shareLink, setShareLink] = useState<any>(null);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const decodeData = async () => {
      try {
        const encoded = params.id as string;
        
        if (!encoded) {
          setError('No share ID provided in the URL.');
          setLoading(false);
          return;
        }
        
        // Check if this is a collaborative sharing link (starts with "share-")
        if (encoded.startsWith('share-')) {
          try {
            // Look up the share link in localStorage
            const shareLinks = JSON.parse(localStorage.getItem('medscan-share-links') || '[]');
            const shareLink = shareLinks.find((link: any) => link.id === encoded);
            
            if (!shareLink) {
              setError('Share link not found. It may have been deleted or expired.');
              setLoading(false);
              return;
            }
            
            // Check if link has expired
            const expiresAt = new Date(shareLink.expiresAt).getTime();
            if (Date.now() > expiresAt) {
              setError('This shared link has expired.');
              setLoading(false);
              return;
            }
            
            // Check max views if set
            if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
              setError('This shared link has reached its maximum view limit.');
              setLoading(false);
              return;
            }
            
            // Store shareLink for password check
            setShareLink(shareLink);
            
            // Check if password is required
            if (shareLink.password) {
              // Don't load report yet - wait for password
              setShareType('report');
              setLoading(false);
              return;
            }
            
            // No password required, load the report immediately
            await loadReport(shareLink);
            setShareType('report');
            setLoading(false);
            return;
          } catch (localStorageErr) {
            console.error('Error loading from localStorage:', localStorageErr);
            setError('Unable to load shared report. The link may be invalid.');
            setLoading(false);
            return;
          }
        }
        
        // Otherwise, try to decode as base64 (health data format)
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
        setShareType('health');
        setLoading(false);
      } catch (err) {
        console.error('Error decoding shared data:', err);
        setError(`Unable to load shared data. ${err instanceof Error ? err.message : 'Please request a new link.'}`);
        setLoading(false);
      }
    };

    decodeData();
  }, [params.id]);

  // Function to load report after password verification
  const loadReport = async (link: any) => {
    try {
      const allPrescriptions = await prescriptionStorage.getAllPrescriptions();
      const report = allPrescriptions.find((p: any) => p.id === link.reportId);
      
      if (!report) {
        setError('The shared report could not be found. It may have been deleted.');
        return;
      }
      
      // Increment view count
      link.viewCount = (link.viewCount || 0) + 1;
      link.accessLog = link.accessLog || [];
      link.accessLog.push({
        timestamp: new Date(),
        ipAddress: 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });
      
      // Update localStorage
      const shareLinks = JSON.parse(localStorage.getItem('medscan-share-links') || '[]');
      const updatedLinks = shareLinks.map((l: any) => 
        l.id === link.id ? link : l
      );
      localStorage.setItem('medscan-share-links', JSON.stringify(updatedLinks));
      
      // Set report data
      setData({
        type: 'report',
        report: {
          fileName: report.fileName,
          summary: report.summary,
          reportData: report.reportData,
          uploadedAt: report.uploadedAt
        }
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Unable to load the report. Please try again.');
    }
  };

  // Handle password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!shareLink) {
      setPasswordError('Share link information is missing.');
      return;
    }
    
    if (password.trim() === '') {
      setPasswordError('Please enter the password.');
      return;
    }
    
    if (password.trim() !== shareLink.password) {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
      return;
    }
    
    // Password is correct, load the report
    await loadReport(shareLink);
  };

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

  // Render password prompt if required
  if (shareType === 'report' && shareLink?.password && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Protected</h2>
              <p className="text-gray-600 dark:text-gray-400">
                This shared report is protected with a password. Please enter the password to view it.
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter password"
                    className={`pr-10 ${passwordError ? 'border-red-500' : ''}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                <Lock className="w-4 h-4 mr-2" />
                Unlock Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render report view (with or without password)
  if (shareType === 'report' && data?.report && (isAuthenticated || !shareLink?.password)) {
    const { report } = data;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Card className="mb-6 border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {report.fileName}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploaded on {new Date(report.uploadedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {shareLink?.password && (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                    <Lock className="w-3 h-3 mr-1" />
                    Protected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report Summary */}
          {report.summary && (
            <Card className="mb-6 border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  AI Summary
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100">
                  <Markdown text={report.summary} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Report */}
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Full Report Content
              </h3>
              <div className="max-h-[70vh] overflow-y-auto p-6 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900">
                  <Markdown text={report.reportData} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>This is a secure, read-only view of a shared medical report.</p>
            <p className="mt-1">Generated by Alephra - AI-Powered Healthcare Analytics</p>
          </div>
        </div>
      </div>
    );
  }

  // Render health data view (existing format)
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
            Generated on {generatedAt ? new Date(generatedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Unknown date'}
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
