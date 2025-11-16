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
    if (score >= 90) return 'bg-green-600 text-white dark:bg-green-400 dark:text-black border-green-600 dark:border-green-400';
    if (score >= 80) return 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white';
    if (score >= 70) return 'bg-yellow-600 text-white dark:bg-yellow-400 dark:text-black border-yellow-600 dark:border-yellow-400';
    return 'bg-red-600 text-white dark:bg-red-400 dark:text-black border-red-600 dark:border-red-400';
  };
  const getLabel = () => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 70) return 'FAIR';
    return 'POOR';
  }
  return <Badge className={`text-xs font-bold font-mono border-2 rounded-lg ${getColor()}`}>{getLabel()}</Badge>;
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
  }, [prescriptions, searchTerm, sortBy]);


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
    <Card className="h-full flex flex-col bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
      <CardHeader className="pb-4 border-b-2 border-black dark:border-white">
        <CardTitle className="text-base font-bold font-mono text-black dark:text-white">REPORT HISTORY</CardTitle>
        <div className="flex items-center gap-2 pt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black dark:text-white" strokeWidth={2.5} />
            <Input 
              placeholder="SEARCH REPORTS..." 
              className="pl-8 w-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 h-10 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-xs font-bold font-mono"
                  >
                    <option value="date">SORT BY DATE</option>
                    <option value="file_name">SORT BY NAME</option>
                  </select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pr-3">
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-black dark:text-white" strokeWidth={2.5} />
            <p className="mt-4 font-bold font-mono text-black dark:text-white">NO REPORTS FOUND</p>
            <p className="text-sm font-mono text-black dark:text-white opacity-70 mt-2">
              {searchTerm ? "TRY A DIFFERENT SEARCH TERM." : "UPLOAD A REPORT TO GET STARTED."}
            </p>
          </div>
        ) : (
          filteredPrescriptions.map((p) => {
            const score = healthScores.get(p.id)?.overall;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPrescription(p)}
                        className={`p-3 border-2 border-black dark:border-white bg-white dark:bg-black cursor-pointer transition-all ${selectedPrescriptionId === p.id ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]' : 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow truncate">
                    <p className="font-bold font-mono truncate text-black dark:text-white uppercase">{p.fileName}</p>
                    <p className="text-sm font-mono text-black dark:text-white opacity-70 line-clamp-2 mt-1">{p.summary}</p>
                  </div>
                  {score && (
                    <div className="ml-4 text-right flex-shrink-0">
                      <p className="font-bold text-lg font-mono text-black dark:text-white">{score}</p>
                      <HealthScoreBadge score={score} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-mono text-black dark:text-white opacity-60">
                  <span className="uppercase">{getTimeAgo(p.uploadedAt)}</span>
                  <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); onExport(p); }} className="hover:opacity-100 text-black dark:text-white"><Download className="h-4 w-4" strokeWidth={2.5} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="hover:opacity-100 text-black dark:text-white"><Trash2 className="h-4 w-4" strokeWidth={2.5} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      {prescriptions.length > 0 && (
          <div className="p-4 border-t-2 border-black dark:border-white">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-10 px-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold font-mono hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition border-2 border-black dark:border-white rounded-lg"
                onClick={() => setShowClearModal(true)}
              >
                  <Trash2 className="h-4 w-4 mr-2" strokeWidth={2.5} />
                  CLEAR ALL HISTORY
              </Button>
          </div>
      )}

      <BasicModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="CLEAR ALL REPORTS"
        size="md"
      >
        <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" strokeWidth={2.5} />
            <h3 className="mt-4 text-lg font-bold font-mono text-black dark:text-white">ARE YOU ABSOLUTELY SURE?</h3>
            <p className="mt-2 text-sm font-mono text-black dark:text-white opacity-70">
              THIS ACTION CANNOT BE UNDONE. THIS WILL PERMANENTLY DELETE ALL {prescriptions.length} REPORTS AND THEIR ASSOCIATED HEALTH DATA.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-xs font-bold font-mono border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition rounded-lg"
              >
                CANCEL
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmClearAll}
                className="px-4 py-2 text-xs font-bold font-mono border-2 border-red-600 text-red-600 bg-white dark:bg-black hover:bg-red-600 hover:text-white transition rounded-lg"
              >
                YES, DELETE ALL
              </Button>
            </div>
        </div>
      </BasicModal>
    </Card>
  );
};

export default EnhancedHistoryList;
