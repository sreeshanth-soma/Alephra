"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Calendar, AlertTriangle, FileText, Lock, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base64DecodeUnicode } from '@/lib/export-utils';
import Markdown from '@/components/markdown';
import { Squares } from '@/components/ui/squares-background';

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
            // Fetch share link from API
            const response = await fetch(`/api/share-links/${encoded}`);
            
            if (!response.ok) {
              const errorData = await response.json();
              setError(errorData.error || 'Share link not found. It may have been deleted or expired.');
              setLoading(false);
              return;
            }
            
            const data = await response.json();
            const shareLinkData = data.shareLink;
            
            // Store shareLink for password check
            const shareLink = {
              id: shareLinkData.shareId,
              shareId: shareLinkData.shareId,
              reportId: shareLinkData.reportId,
              hasPassword: shareLinkData.hasPassword,
              expiresAt: new Date(shareLinkData.expiresAt),
              maxViews: shareLinkData.maxViews,
              viewCount: shareLinkData.viewCount
            };
            setShareLink(shareLink);
            
            // Check if password is required
            if (shareLinkData.hasPassword) {
              // Don't load report yet - wait for password
              setShareType('report');
              setIsAuthenticated(false); // Ensure not authenticated
              setData(null); // Don't set any data
              setLoading(false);
              return;
            }
            
            // No password required, load the report immediately
            if (shareLinkData.reportData) {
              setData({
                type: 'report',
                report: {
                  fileName: shareLinkData.fileName,
                  summary: shareLinkData.summary,
                  reportData: shareLinkData.reportData,
                  uploadedAt: new Date(shareLinkData.uploadedAt)
                }
              });
              setIsAuthenticated(true);
            } else {
              setError('Report data not available.');
            }
            setShareType('report');
            setLoading(false);
            return;
          } catch (apiErr) {
            console.error('Error loading from API:', apiErr);
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
      // Verify password via API (POST to the same route)
      const response = await fetch(`/api/share-links/${link.shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to verify password';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON (e.g., 404 HTML page)
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        setPasswordError(errorMessage);
        return;
      }
      
      const data = await response.json();
      const shareLinkData = data.shareLink;
      
      // Set report data
      setData({
        type: 'report',
        report: {
          fileName: shareLinkData.fileName,
          summary: shareLinkData.summary,
          reportData: shareLinkData.reportData || '',
          uploadedAt: new Date(shareLinkData.uploadedAt)
        }
      });
      setIsAuthenticated(true);
      setPasswordError('');
    } catch (err) {
      console.error('Error loading report:', err);
      setPasswordError('Unable to load the report. Please try again.');
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
    
    // Verify password and load the report via API
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
  if (shareType === 'report' && shareLink?.hasPassword && !isAuthenticated) {
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
  if (shareType === 'report' && data?.report && (isAuthenticated || !shareLink?.hasPassword)) {
    const { report } = data;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black relative pt-12 md:pt-16">
        {/* Squares Background */}
        <div className="absolute inset-0 z-0">
          <Squares 
            direction="diagonal"
            speed={0.5}
            squareSize={40}
            borderColor="#666"
            hoverFillColor="#2a2a2a"
          />
        </div>
        
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 z-5 bg-white/40 dark:bg-black/0" />
        
        <div className="container mx-auto px-4 pt-6 pb-6 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <Card className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-black dark:bg-white border-2 border-black dark:border-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-white dark:text-black" strokeWidth={2.5} />
                </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-2xl font-bold font-mono text-black dark:text-white tracking-tight">
                        {report.fileName.toUpperCase()}
                  </h1>
                      {shareLink?.hasPassword && (
                        <Badge className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-3 py-1 font-bold font-mono text-xs">
                          <Lock className="w-3 h-3 mr-1.5" />
                          PROTECTED
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono text-black dark:text-white opacity-70 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" strokeWidth={2.5} />
                        <span>
                          {new Date(report.uploadedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                            day: 'numeric'
                          }).toUpperCase()}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4" strokeWidth={2.5} />
                        <span>MEDICAL REPORT</span>
                      </div>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Main Content Area */}
            <div className="space-y-6">
              {/* AI Summary Section */}
          {report.summary && (
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
              <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black dark:border-white">
                      <div className="w-10 h-10 bg-black dark:bg-white border-2 border-black dark:border-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-white dark:text-black" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-mono text-black dark:text-white">AI SUMMARY</h2>
                        <p className="text-xs font-mono text-black dark:text-white opacity-60 uppercase">Key Insights & Findings</p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert 
                      prose-headings:text-black dark:prose-headings:text-white 
                      prose-headings:font-bold prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-tight
                      prose-headings:mt-6 prose-headings:mb-3
                      prose-p:text-black dark:prose-p:text-white prose-p:leading-relaxed prose-p:mb-4
                      prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
                      prose-ul:text-black dark:prose-ul:text-white prose-ul:my-4 prose-ul:pl-6
                      prose-ol:text-black dark:prose-ol:text-white prose-ol:my-4 prose-ol:pl-6
                      prose-li:my-2 prose-li:marker:text-black dark:prose-li:marker:text-white">
                  <Markdown text={report.summary} />
                </div>
              </CardContent>
            </Card>
          )}

              {/* Full Report Section */}
              <Card className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black dark:border-white">
                    <div className="w-10 h-10 bg-black dark:bg-white border-2 border-black dark:border-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white dark:text-black" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-mono text-black dark:text-white">FULL REPORT DATA</h2>
                      <p className="text-xs font-mono text-black dark:text-white opacity-60 uppercase">Complete Medical Report Content</p>
                    </div>
                  </div>
                  {report.reportData && report.reportData.trim() !== '' ? (
                    <div className="p-6 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg">
                      <div className="prose prose-sm max-w-none dark:prose-invert 
                        prose-headings:text-black dark:prose-headings:text-white 
                        prose-headings:font-bold prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-tight
                        prose-headings:mt-6 prose-headings:mb-3
                        prose-p:text-black dark:prose-p:text-white prose-p:leading-relaxed prose-p:mb-4
                        prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
                        prose-code:text-black dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-black dark:prose-code:border-white
                        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:border-2 prose-pre:border-black dark:prose-pre:border-white prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                        prose-ul:text-black dark:prose-ul:text-white prose-ul:my-4 prose-ul:pl-6
                        prose-ol:text-black dark:prose-ol:text-white prose-ol:my-4 prose-ol:pl-6
                        prose-li:my-2 prose-li:marker:text-black dark:prose-li:marker:text-white
                        prose-table:w-full prose-table:my-6 prose-table:border-collapse prose-table:border-2 prose-table:border-black dark:prose-table:border-white
                        prose-th:border-2 prose-th:border-black dark:prose-th:border-white prose-th:bg-black dark:prose-th:bg-white prose-th:text-white dark:prose-th:text-black prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-bold prose-th:font-mono prose-th:uppercase
                        prose-td:border-2 prose-td:border-black dark:prose-td:border-white prose-td:px-4 prose-td:py-2">
                  <Markdown text={report.reportData} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center border-2 border-dashed border-black dark:border-white rounded-lg bg-white dark:bg-black">
                      <FileText className="w-12 h-12 text-black dark:text-white mx-auto mb-3" strokeWidth={2.5} />
                      <p className="text-black dark:text-white font-mono text-sm font-bold">REPORT DATA NOT AVAILABLE</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-black dark:border-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm font-bold font-mono text-black dark:text-white mb-1 uppercase">Alephra Healthcare Analytics</p>
                <p className="text-xs font-mono text-black dark:text-white opacity-60 uppercase">AI-Powered Medical Report Analysis Platform</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-black dark:text-white opacity-60 uppercase">
                <Shield className="w-4 h-4" strokeWidth={2.5} />
                <span>Encrypted • Secure</span>
              </div>
            </div>
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
