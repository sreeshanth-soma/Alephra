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
}

export const CollaborativeSharing: React.FC<CollaborativeSharingProps> = ({ 
  prescription,
  onClose
}) => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [maxViews, setMaxViews] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string>('');
  const [showAccessLog, setShowAccessLog] = useState<string>('');

  // Generate a shareable link
  const generateShareLink = () => {
    const linkId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/shared/${linkId}`;
    
    const newLink: ShareLink = {
      id: linkId,
      reportId: prescription.id,
      url: url,
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
      viewCount: 0,
      maxViews: maxViews,
      password: password || undefined,
      createdAt: new Date(),
      accessLog: []
    };

    setShareLinks([...shareLinks, newLink]);
    
    // Store in localStorage
    const existingLinks = JSON.parse(localStorage.getItem('medscan-share-links') || '[]');
    localStorage.setItem('medscan-share-links', JSON.stringify([...existingLinks, newLink]));

    return newLink;
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

  // Delete a share link
  const deleteShareLink = (linkId: string) => {
    const updatedLinks = shareLinks.filter(l => l.id !== linkId);
    setShareLinks(updatedLinks);
    
    const existingLinks = JSON.parse(localStorage.getItem('medscan-share-links') || '[]');
    const filtered = existingLinks.filter((l: ShareLink) => l.id !== linkId);
    localStorage.setItem('medscan-share-links', JSON.stringify(filtered));
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

  // Load existing links on mount
  React.useEffect(() => {
    const existingLinks = JSON.parse(localStorage.getItem('medscan-share-links') || '[]');
    const reportLinks = existingLinks
      .filter((l: ShareLink) => l.reportId === prescription.id)
      .map((l: ShareLink) => ({
        ...l,
        createdAt: new Date(l.createdAt),
        expiresAt: new Date(l.expiresAt),
        accessLog: l.accessLog.map(log => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
      }));
    setShareLinks(reportLinks);
  }, [prescription.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    Share Report
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {prescription.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Create New Share Link */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
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

                <Button
                  onClick={generateShareLink}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Generate Share Link
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
                        className={`p-4 rounded-lg border ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 truncate">
                                {link.url}
                              </code>
                              {isDisabled && (
                                <Badge variant="destructive" className="text-xs">
                                  {isExpired ? 'Expired' : 'Max views reached'}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
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
                              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Share via email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => setShowAccessLog(showAccessLog === link.id ? '' : link.id)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="View access log"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => deleteShareLink(link.id)}
                              className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                              className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
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
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Privacy & Security
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
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
