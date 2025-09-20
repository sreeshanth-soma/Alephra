/* eslint-disable react/no-unescaped-entities */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Trash2, FileText, Calendar, Clock, Download } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { prescriptionStorage, PrescriptionRecord } from '@/lib/prescription-storage';

interface Props {
  onSelectPrescription: (prescription: PrescriptionRecord) => void;
  selectedPrescriptionId?: string;
  refreshTrigger?: number; // Add this to trigger refresh
}

const PrescriptionHistory = ({ onSelectPrescription, selectedPrescriptionId, refreshTrigger }: Props) => {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, [refreshTrigger]); // Refresh when refreshTrigger changes

  const loadPrescriptions = () => {
    const stored = prescriptionStorage.getAllPrescriptions();
    setPrescriptions(stored);
  };

  const handleDelete = (id: string) => {
    prescriptionStorage.deletePrescription(id);
    loadPrescriptions();
    toast({
      description: "Prescription deleted successfully",
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all prescriptions? This action cannot be undone.')) {
      prescriptionStorage.clearAllPrescriptions();
      loadPrescriptions();
      toast({
        description: "All prescriptions cleared",
      });
    }
  };

  const handleExport = (prescription: PrescriptionRecord) => {
    const data = {
      fileName: prescription.fileName,
      summary: prescription.summary,
      uploadedAt: prescription.uploadedAt.toISOString(),
      reportData: prescription.reportData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prescription.fileName}_${prescription.uploadedAt.toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      description: "Prescription exported successfully",
    });
  };

  const formatDate = (date: Date) => {
    return prescriptionStorage.formatDate(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Prescription History</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} stored
          </p>
        </div>
        {prescriptions.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {prescriptions.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-400 dark:border-gray-600">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No prescriptions yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Upload your first medical report to see it here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {prescriptions.map((prescription) => (
            <Card
              key={prescription.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-300 dark:border-gray-700 ${
                selectedPrescriptionId === prescription.id
                  ? 'ring-2 ring-black dark:ring-white bg-gray-50 dark:bg-zinc-800'
                  : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
              onClick={() => onSelectPrescription(prescription)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-black dark:text-white truncate">
                      {prescription.fileName}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(prescription.uploadedAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeAgo(prescription.uploadedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(prescription);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(prescription.id);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {prescription.summary}
                </div>
                <div className="mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {prescription.reportData.length > 200 ? 'Long Report' : 'Short Report'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionHistory;
