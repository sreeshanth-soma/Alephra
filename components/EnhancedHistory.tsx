/* eslint-disable react/no-unescaped-entities */

import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Trash2, 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  AlertTriangle, 
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Minus
} from 'lucide-react';
import { useToast } from './ui/use-toast';
import { prescriptionStorage, PrescriptionRecord } from '@/lib/prescription-storage';
import { HealthScore } from '@/lib/health-analytics';
import BasicModal from './ui/modal';

interface Props {
  prescriptions: PrescriptionRecord[];
  healthScores: Map<string, HealthScore>;
  onSelectPrescription: (prescription: PrescriptionRecord) => void;
  selectedPrescriptionId?: string;
  onClearAll: () => void;
  onDelete: (id: string) => void;
  onExport: (prescription: PrescriptionRecord) => void;
}

const HealthScoreBadge = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 80) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };
  const getLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Poor';
  }
  return <Badge className={`text-xs font-semibold ${getColor()}`}>{getLabel()}</Badge>;
};


const EnhancedHistoryList = ({ 
  prescriptions, 
  healthScores,
  onSelectPrescription, 
  selectedPrescriptionId,
  onClearAll,
  onDelete,
  onExport
}: Props) => {
  const { toast } = useToast();
  const [showClearModal, setShowClearModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'file_name'>('date');

  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptions.filter(p => 
      p.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'file_name':
          return a.fileName.localeCompare(b.fileName);
        case 'date':
        default:
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      }
    });

    return filtered;
  }, [prescriptions, healthScores, searchTerm, sortBy]);


  const confirmClearAll = () => {
    onClearAll();
    setShowClearModal(false);
    toast({ description: "All reports have been cleared." });
  };
  
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.round(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.round(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.round(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="h-full flex flex-col bg-black border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Report History</CardTitle>
        <div className="flex items-center gap-2 pt-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search reports..." 
              className="pl-8 w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 h-10 border border-gray-600 rounded-md bg-gray-800 text-white text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="file_name">Sort by Name</option>
                  </select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pr-3">
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <FileText className="mx-auto h-12 w-12" />
            <p className="mt-4 font-semibold text-white">No Reports Found</p>
            <p className="text-sm text-gray-400">
              {searchTerm ? "Try a different search term." : "Upload a report to get started."}
            </p>
          </div>
        ) : (
          filteredPrescriptions.map((p) => {
            const score = healthScores.get(p.id)?.overall;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPrescription(p)}
                        className={`p-3 rounded-lg border border-gray-700 cursor-pointer transition-all ${selectedPrescriptionId === p.id ? 'bg-gray-800 border-gray-500' : 'hover:bg-gray-800'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow truncate">
                    <p className="font-semibold truncate text-white">{p.fileName}</p>
                    <p className="text-sm text-gray-400 line-clamp-2">{p.summary}</p>
                  </div>
                  {score && (
                    <div className="ml-4 text-right flex-shrink-0">
                      <p className="font-bold text-lg text-white">{score}</p>
                      <HealthScoreBadge score={score} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>{getTimeAgo(p.uploadedAt)}</span>
                  <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); onExport(p); }} className="hover:text-white"><Download className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      {prescriptions.length > 0 && (
          <div className="p-4 border-t">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowClearModal(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
              </Button>
          </div>
      )}

      <BasicModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Reports"
        size="md"
      >
        <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Are you absolutely sure?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete all {prescriptions.length} reports and their associated health data.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="outline" onClick={() => setShowClearModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmClearAll}>Yes, delete all</Button>
            </div>
        </div>
      </BasicModal>
    </Card>
  );
};

export default EnhancedHistoryList;
