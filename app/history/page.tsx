/* eslint-disable react/no-unescaped-entities */

"use client";

import { useEffect, useState } from "react";
import PrescriptionHistory from "@/components/PrescriptionHistory";
import { PrescriptionRecord, prescriptionStorage } from "@/lib/prescription-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, Upload } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [selected, setSelected] = useState<PrescriptionRecord | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    // If nothing selected, preselect the most recent if available
    if (!selected) {
      const all = prescriptionStorage.getAllPrescriptions();
      if (all.length > 0) setSelected(all[0]);
    }
  }, [refresh, selected]);

  const handleSelect = (p: PrescriptionRecord) => setSelected(p);

  const handleDelete = () => {
    if (!selected) return;
    prescriptionStorage.deletePrescription(selected.id);
    setSelected(null);
    setRefresh((n) => n + 1);
  };

  const handleExport = () => {
    if (!selected) return;
    const data = {
      fileName: selected.fileName,
      summary: selected.summary,
      uploadedAt: selected.uploadedAt.toISOString(),
      reportData: selected.reportData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.fileName}_${selected.uploadedAt.toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const total = prescriptionStorage.getPrescriptionsCount();

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Report History</h1>
            <p className="text-gray-600 dark:text-gray-400">View, manage, and export your uploaded reports</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {total} {total === 1 ? "Report" : "Reports"}
            </Badge>
            <Link href="/analysis">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Upload New
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <PrescriptionHistory
              onSelectPrescription={handleSelect}
              selectedPrescriptionId={selected?.id || ""}
              refreshTrigger={refresh}
            />
          </div>

          <div className="lg:col-span-7">
            <Card className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Details</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={!selected}>
                      <Download className="w-4 h-4" /> Export
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete} disabled={!selected}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selected ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(selected.uploadedAt).toLocaleString()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selected.fileName}
                      </Badge>
                    </div>
                    {selected.summary && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Summary</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selected.summary}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Report Content</h3>
                      <div className="max-h-[50vh] overflow-auto rounded-md border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {selected.reportData}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Select a report from the list to view details.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


