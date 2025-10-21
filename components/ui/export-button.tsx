"use client";

import React, { useState } from "react";
import { Download, FileText, FileSpreadsheet, Share2, Check } from "lucide-react";

interface ExportButtonProps {
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onShare?: () => Promise<string>;
  className?: string;
  variant?: "full" | "compact";
}

export function ExportButton({
  onExportPDF,
  onExportCSV,
  onShare,
  className = "",
  variant = "full"
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!onShare) return;
    setLoading(true);
    try {
      const link = await onShare();
      setCopied(true);
      
      // Log success message
      console.log('✅ Share link copied to clipboard:', link);
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('❌ Share failed:', error);
      if (typeof window !== 'undefined') {
        alert('Failed to generate share link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200
            shadow-md hover:shadow-lg
            ${className}
          `}
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              {onExportPDF && (
                <button
                  onClick={() => {
                    onExportPDF();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Export as PDF
                  </span>
                </button>
              )}

              {onExportCSV && (
                <button
                  onClick={() => {
                    onExportCSV();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-200 dark:border-gray-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Export as CSV
                  </span>
                </button>
              )}

              {onShare && (
                <button
                  onClick={() => {
                    handleShare();
                    setShowMenu(false);
                  }}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Share2 className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {copied ? "Link Copied!" : loading ? "Generating..." : "Share Link"}
                  </span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full variant with separate buttons
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {onExportPDF && (
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </button>
      )}

      {onExportCSV && (
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export CSV
        </button>
      )}

      {onShare && (
        <button
          onClick={handleShare}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Link Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              {loading ? "Generating..." : "Share"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
