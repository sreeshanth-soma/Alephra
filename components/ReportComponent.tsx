/* eslint-disable react/no-unescaped-entities */

import React, { ChangeEvent, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { prescriptionStorage } from '@/lib/prescription-storage'

type Props = {
    onReportConfirmation: (data: string) => void
}
const ReportComponent = ({ onReportConfirmation }: Props) => {
    const { toast } = useToast()

    const [base64Data, setBase64Data] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");
    
    function handleReportSelection(event: ChangeEvent<HTMLInputElement>): void {
        if (!event.target.files) return;
        const file = event.target.files[0];
        if (file) {
            setUploadedFileName(file.name);
            let isValidImage = false;
            let isValidDoc = false;
            const validImages = ['image/jpeg', 'image/png', 'image/webp'];
            const validDocs = ['application/pdf'];
            if (validImages.includes(file.type)) {
                isValidImage = true;
            }
            if (validDocs.includes(file.type)) {
                isValidDoc = true;
            }
            if (!(isValidImage || isValidDoc)) {
                toast({
                    variant: 'destructive',
                    description: "File type not supported!",
                });
                return;
            }

            if (isValidImage) {
                compressImage(file, (compressedFile) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        setBase64Data(base64String);
                        console.log(base64String);
                    };
                    reader.readAsDataURL(compressedFile);
                });
            }

            if (isValidDoc) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setBase64Data(base64String);
                    console.log(base64String);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    function compressImage(file: File, callback: (compressedFile: File) => void) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx!.drawImage(img, 0, 0);
                const quality = 0.1;
                const dataURL = canvas.toDataURL('image/jpeg', quality);
                const byteString = atob(dataURL.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const compressedFile = new File([ab], file.name, { type: 'image/jpeg' });
                callback(compressedFile);
            };
            img.src = e.target!.result as string;
        };
        reader.readAsDataURL(file);
    }

    async function extractDetails(): Promise<void> {
        if (!base64Data) {
            toast({
                variant: 'destructive',
                description: "Upload a valid report!",
            });
            return;
        }
        
        setIsLoading(true);
        let isCompleted = false;
        
        // Safety cap: ensure analyzing UI doesn't exceed 8 seconds
        const loadingSafetyTimer = setTimeout(() => {
            if (!isCompleted) {
                setIsLoading(false);
                toast({
                    variant: 'destructive',
                    description: "Request timed out. Please try again.",
                });
            }
        }, 8000);

        try {
            const response = await fetch("api/extractreportgemini", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    base64: base64Data,
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Report extraction response:', responseData);
                
                const reportText = responseData.text;
                const reportId = responseData.reportId;
                const vectorStored = responseData.vectorStored;
                
                setReportData(reportText);
                
                // Removed embedding status toast per request
                
                // Save prescription immediately after successful analysis
                if (uploadedFileName) {
                    prescriptionStorage.savePrescription(reportText, reportText, uploadedFileName);
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }));
                toast({
                    variant: 'destructive',
                    description: errorData.error || "Failed to extract report details",
                });
            }
        } catch (error) {
            console.error("Error extracting details:", error);
            toast({
                variant: 'destructive',
                description: "Network error. Please check your connection and try again.",
            });
        } finally {
            // Mark as completed to prevent race condition
            isCompleted = true;
            clearTimeout(loadingSafetyTimer);
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-300 dark:border-gray-700 shadow-2xl p-8">
            <div className="space-y-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-black dark:text-white mb-3 font-playfair">Medical Report Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300">Upload your medical report for AI-powered analysis</p>
                </div>

                <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center transition-all duration-200 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-zinc-800">
                        <Input 
                            type='file'
                            onChange={handleReportSelection}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {uploadedFileName ? (
                            <div className="space-y-2">
                                <div className="mx-auto h-1.5 w-12 rounded-full bg-black dark:bg-white"></div>
                                <p className="text-base font-medium text-gray-700 dark:text-gray-200">✓ File uploaded</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{uploadedFileName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Click to change file</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                <p className="text-base font-medium text-gray-700 dark:text-gray-200">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, PDF</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button 
                    onClick={extractDetails}
                    disabled={!base64Data || isLoading}
                    className="w-full bg-black hover:bg-zinc-900 disabled:bg-gray-300 dark:disabled:bg-zinc-700 transition-all duration-200 shadow-lg font-semibold text-white py-3"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Analyzing Report...</span>
                        </div>
                    ) : (
                        "Analyze Report"
                    )}
                </Button>

                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/70 rounded-2xl border border-gray-300 dark:border-gray-700 flex items-center justify-center z-10">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-black dark:text-white" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">Processing your report...</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-800 dark:text-gray-100">Report Summary</Label>
                    <Textarea
                        value={reportData}
                        onChange={(e) => setReportData(e.target.value)}
                        placeholder="Summary will appear here (You can even add additional information to the summary for better insights)" 
                        className="min-h-48 resize-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-0 transition-all duration-200"
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={() => onReportConfirmation(reportData)}
                    disabled={!reportData.trim()}
                    className="w-full border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 font-semibold py-3"
                >
                    Confirm & Continue
                </Button>


            </div>
        </div>
    )
}

export default ReportComponent