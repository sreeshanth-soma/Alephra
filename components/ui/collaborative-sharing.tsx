"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { 
  Share2, 
  Link2, 
  Copy, 
  Check, 
  Clock, 
  Eye, 
  EyeOff,
  Mail,
  Users,
  Shield,
  X,
  ExternalLink
} from 'lucide-react';
import { PrescriptionRecord } from '@/lib/prescription-storage';

interface ShareLink {
  id: string;
  reportId: string;
  url: string;
  expiresAt: Date;
  viewCount: number;
  maxViews?: number;
  password?: string;
  createdAt: Date;
  accessLog: AccessLog[];
}

interface AccessLog {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

interface CollaborativeSharingProps {
  prescription: PrescriptionRecord;
  onClose: () => void;
  onShareActivity?: () => void;
}

export const CollaborativeSharing: React.FC<CollaborativeSharingProps> = ({ 
  prescription,
  onClose,
  onShareActivity
}) => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [maxViews, setMaxViews] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string>('');
  const [showAccessLog, setShowAccessLog] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Generate a shareable link via API
  const generateShareLink = async () => {
    setLoading(true);
    setError('');
    try {
      // Get full report data
      const { prescriptionStorage } = await import('@/lib/prescription-storage');
      prescriptionStorage.invalidateCache();
      const fullReport = await prescriptionStorage.getPrescriptionById(prescription.id);
      
      if (!fullReport) {
        throw new Error('Report not found');
      }

      const response = await fetch('/api/share-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: prescription.id,
          fileName: fullReport.fileName,
          reportData: fullReport.reportData,
          summary: fullReport.summary,
          uploadedAt: fullReport.uploadedAt,
          expiryHours,
          maxViews,
          password: password || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share link');
      }

      const data = await response.json();
      const newLink: ShareLink = {
        id: data.shareLink.shareId,
        reportId: prescription.id,
        url: data.shareLink.url,
        expiresAt: new Date(data.shareLink.expiresAt),
        viewCount: data.shareLink.viewCount,
        maxViews: data.shareLink.maxViews,
        password: data.shareLink.hasPassword ? password : undefined,
        createdAt: new Date(data.shareLink.createdAt),
        accessLog: []
      };

      setShareLinks((prev) => [...prev, newLink]);
      onShareActivity?.();
      setPassword(''); // Clear password field
      setMaxViews(undefined); // Reset max views
    } catch (err) {
      console.error('Error creating share link:', err);
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async (link: ShareLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Delete a share link via API
  const deleteShareLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/share-links?shareId=${linkId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete share link');
      }

      setShareLinks((prev) => prev.filter(l => l.id !== linkId));
      onShareActivity?.();
    } catch (err) {
      console.error('Error deleting share link:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete share link');
    }
  };

  // Share via email
  const shareViaEmail = (link: ShareLink) => {
    const subject = encodeURIComponent(`Shared Medical Report: ${prescription.fileName}`);
    const body = encodeURIComponent(
      `I'm sharing a medical report with you.\n\n` +
      `Report: ${prescription.fileName}\n` +
      `Date: ${prescription.uploadedAt.toLocaleDateString()}\n\n` +
      `View the report here: ${link.url}\n\n` +
      (link.password ? `Password: ${link.password}\n\n` : '') +
      `This link expires on ${link.expiresAt.toLocaleString()}.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  // Load existing links on mount from API
  React.useEffect(() => {
    const loadShareLinks = async () => {
      try {
        const response = await fetch(`/api/share-links?reportId=${prescription.id}`);
        if (response.ok) {
          const data = await response.json();
          const reportLinks: ShareLink[] = data.shareLinks.map((l: any) => ({
            id: l.shareId,
            reportId: l.reportId,
            url: l.url,
            expiresAt: new Date(l.expiresAt),
            viewCount: l.viewCount,
            maxViews: l.maxViews,
            password: l.hasPassword ? undefined : undefined, // Don't expose password
            createdAt: new Date(l.createdAt),
            accessLog: l.accessLog || []
          }));
          setShareLinks(reportLinks);
        }
      } catch (err) {
        console.error('Error loading share links:', err);
      }
    };
    loadShareLinks();
  }, [prescription.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white dark:bg-black border-4 border-black dark:border-white rounded-[32px] shadow-[20px_20px_0_rgba(0,0,0,0.25)] dark:shadow-[20px_20px_0_rgba(255,255,255,0.15)] text-black dark:text-white">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-black dark:border-white bg-black dark:bg-white flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0_rgba(255,255,255,0.15)]">
                  <Share2 className="h-6 w-6 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight uppercase">
                    Share Report
                  </h2>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 uppercase tracking-[0.2em]">
                    {prescription.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 border-2 border-black dark:border-white rounded-xl text-black dark:text-white hover:-translate-y-0.5 transition-all shadow-[4px_4px_0_rgba(0,0,0,0.25)] dark:shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Create New Share Link */}
            <div className="mb-6 p-5 bg-white dark:bg-black rounded-2xl border-2 border-black dark:border-white shadow-[8px_8px_0_rgba(0,0,0,0.15)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.1)]">
              <h3 className="text-lg font-black text-black dark:text-white mb-4 uppercase tracking-[0.2em]">
                Create Share Link
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Expires in (hours)
                    </label>
                    <Input
                      type="number"
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      min={1}
                      max={720}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Eye className="h-4 w-4 inline mr-1" />
                      Max Views (optional)
                    </label>
                    <Input
                      type="number"
                      value={maxViews || ''}
                      onChange={(e) => setMaxViews(e.target.value ? Number(e.target.value) : undefined)}
                      min={1}
                      placeholder="Unlimited"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Password Protection (optional)
                  </label>
                  <Input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}
                <Button
                  onClick={generateShareLink}
                  disabled={loading}
                  className="w-full border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black uppercase font-semibold tracking-[0.2em] hover:-translate-y-0.5 transition-all disabled:opacity-40 rounded-2xl"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Generate Share Link'}
                </Button>
              </div>
            </div>

            {/* Existing Share Links */}
            {shareLinks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Active Share Links ({shareLinks.length})
                </h3>
                
                <div className="space-y-3">
                  {shareLinks.map((link) => {
                    const isExpired = new Date() > link.expiresAt;
                    const isMaxViewsReached = !!(link.maxViews && link.viewCount >= link.maxViews);
                    const isDisabled = isExpired || isMaxViewsReached;
                    
                    return (
                      <div
                        key={link.id}
                        className={`p-4 rounded-2xl border-2 ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-900 border-black/10 dark:border-white/10 opacity-60'
                            : 'bg-white dark:bg-black border-black dark:border-white shadow-[6px_6px_0_rgba(0,0,0,0.15)] dark:shadow-[6px_6px_0_rgba(255,255,255,0.12)]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs bg-white dark:bg-black px-2 py-1 rounded text-gray-900 dark:text-gray-100 truncate border border-black dark:border-white">
                                {link.url}
                              </code>
                              {isDisabled && (
                                <Badge variant="destructive" className="text-xs">
                                  {isExpired ? 'Expired' : 'Max views reached'}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-900 dark:text-gray-100 font-mono">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {link.viewCount} {link.maxViews ? `/ ${link.maxViews}` : ''} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeRemaining(link.expiresAt)}
                              </span>
                              {link.password && (
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  Protected
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(link)}
                              disabled={isDisabled}
                              className="p-2 border-2 border-black dark:border-white text-black dark:text-white rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Copy link"
                            >
                              {copiedId === link.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => shareViaEmail(link)}
                              disabled={isDisabled}
                              className="p-2 border-2 border-black dark:border-white text-black dark:text-white rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Share via email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => setShowAccessLog(showAccessLog === link.id ? '' : link.id)}
                              className="p-2 border-2 border-black dark:border-white text-black dark:text-white rounded-xl hover:-translate-y-0.5 transition-all"
                              title="View access log"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => deleteShareLink(link.id)}
                              className="p-2 border-2 border-black dark:border-white text-red-600 dark:text-red-300 rounded-xl hover:-translate-y-0.5 transition-all"
                              title="Delete link"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Access Log */}
                        <AnimatePresence>
                          {showAccessLog === link.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t-4 border-black dark:border-white"
                            >
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Access Log ({link.accessLog.length})
                              </h4>
                              {link.accessLog.length > 0 ? (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {link.accessLog.map((log, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between"
                                    >
                                      <span>{log.timestamp.toLocaleString()}</span>
                                      <span className="text-gray-500">{log.ipAddress}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  No access yet
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-white dark:bg-black rounded-2xl border-2 border-black dark:border-white shadow-[6px_6px_0_rgba(0,0,0,0.12)] dark:shadow-[6px_6px_0_rgba(255,255,255,0.12)]">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-black dark:text-white mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-black dark:text-white mb-1 uppercase tracking-[0.2em]">
                    Privacy & Security
                  </h4>
                  <p className="text-xs text-gray-800 dark:text-gray-200">
                    Share links are secure and can be revoked at any time. Recipients can only view the report, not edit or download it. All access is logged for your security.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
