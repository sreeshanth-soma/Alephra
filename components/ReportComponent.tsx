/* eslint-disable react/no-unescaped-entities */

import React, { ChangeEvent, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { prescriptionStorage } from '@/lib/prescription-storage'
import { FileUpload } from '@/components/ui/file-upload'
import { useSession } from 'next-auth/react'
import { SignInPromptModal } from '@/components/ui/signin-prompt-modal'

type Props = {
    onReportConfirmation: (data: string) => void
    onLoadingChange?: (loading: boolean) => void
}
const ReportComponent = ({ onReportConfirmation, onLoadingChange }: Props) => {
    const { toast } = useToast()
    const { data: session } = useSession()

    const [base64Data, setBase64Data] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);
    
    function handleSelectedFiles(files: File[]): void {
        // Check if user is signed in before allowing upload
        if (!session) {
            setShowSignInPrompt(true);
            return;
        }

        const file = files[0];
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
                    };
                    reader.readAsDataURL(compressedFile);
                });
            }

            if (isValidDoc) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setBase64Data(base64String);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    function handleReportSelection(event: ChangeEvent<HTMLInputElement>): void {
        if (!event.target.files) return;
        handleSelectedFiles(Array.from(event.target.files));
    }

    function compressImage(file: File, callback: (compressedFile: File) => void) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            let objectUrl: string | null = null;
            img.onload = () => {
                try {
                    const maxDimension = 2000; // cap very large images to control memory
                    const { width: origW, height: origH } = img;
                    let targetW = origW;
                    let targetH = origH;
                    if (origW > maxDimension || origH > maxDimension) {
                        const scale = Math.min(maxDimension / origW, maxDimension / origH);
                        targetW = Math.round(origW * scale);
                        targetH = Math.round(origH * scale);
                    }

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = targetW;
                    canvas.height = targetH;
                    ctx!.drawImage(img, 0, 0, targetW, targetH);

                    // Adaptive quality: keep medical text readable
                    const sizeMB = file.size / (1024 * 1024);
                    const quality = sizeMB > 8 ? 0.4 : sizeMB > 3 ? 0.55 : 0.7;

                    canvas.toBlob((blob) => {
                        try {
                            if (!blob) {
                                // Fallback: if toBlob failed, use original file
                                callback(file);
                                return;
                            }
                            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
                            callback(compressedFile);
                        } finally {
                            // Cleanup canvas resources
                            canvas.width = 0;
                            canvas.height = 0;
                        }
                    }, 'image/jpeg', quality);
                } finally {
                    // Cleanup image and revoke object URL if used
                    img.onload = null as any;
                    if (objectUrl) URL.revokeObjectURL(objectUrl);
                }
            };
            // Prefer object URL to reduce base64 memory footprint when possible
            if (file && 'createObjectURL' in URL) {
                objectUrl = URL.createObjectURL(file);
                img.src = objectUrl;
            } else {
                img.src = e.target!.result as string;
            }
        };
        reader.readAsArrayBuffer(file);
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
        onLoadingChange?.(true);

        try {
            const response = await fetch("/api/extractreportgemini", {
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
                
                const reportText = responseData.text;
                const reportId = responseData.reportId;
                const vectorStored = responseData.vectorStored;
                
                setReportData(reportText);
                
                // --- NEW: Generate a concise summary ---
                const summaryResponse = await fetch("/api/summarize-report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reportText: reportText }),
                });

                let summaryText = reportText.substring(0, 250) + "..."; // Fallback summary
                if (summaryResponse.ok) {
                    const summaryData = await summaryResponse.json();
                    summaryText = summaryData.summary;
                } else {
                    console.warn("Failed to generate concise summary, using fallback.");
                }
                // --- END NEW ---

                // Save prescription with distinct summary
                if (uploadedFileName) {
                    await prescriptionStorage.savePrescription(
                        reportText, 
                        summaryText, 
                        uploadedFileName,
                        base64Data, // fileUrl
                        uploadedFileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg', // fileType
                        base64Data.length, // approximate fileSize
                        reportText // extractedData
                    );
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }));
                
                // Handle validation errors with more detail
                const errorMessage = errorData.message || errorData.error || "Failed to extract report details";
                
                toast({
                    variant: 'destructive',
                    title: errorData.error || "Error",
                    description: errorMessage,
                    duration: 6000, // Show longer for validation errors
                });
            }
        } catch (error) {
            console.error("Error extracting details:", error);
            toast({
                variant: 'destructive',
                description: "Network error. Please check your connection and try again.",
            });
        } finally {
            setIsLoading(false);
            onLoadingChange?.(false);
        }
    }

    return (
        <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] p-6 h-full">
            <div className="space-y-6 h-full flex flex-col">
                <div className="text-center border-b-2 border-black dark:border-white pb-4">
                    <h3 className="text-2xl font-bold text-black dark:text-white mb-2 font-mono tracking-tight">MEDICAL REPORT ANALYSIS</h3>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400">UPLOAD YOUR MEDICAL REPORT FOR AI-POWERED ANALYSIS</p>
                </div>

                <div className="relative">
                    <FileUpload onChange={handleSelectedFiles} />
                </div>
                
                {/* Template Quick Access */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black dark:bg-white border-2 border-black dark:border-white flex items-center justify-center text-2xl">
                    💡
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-mono text-black dark:text-white">
                      USE TEMPLATES FOR COMMON TESTS
                    </p>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">
                      AUTO-FILL FIELDS FOR CBC, LIPID PANEL, AND MORE
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-lg bg-black dark:bg-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white text-white dark:text-black font-bold font-mono border-2 border-black dark:border-white transition-all"
                    onClick={() => {
                      // Scroll to templates section
                      const templatesBtn = document.querySelector('[data-templates-button]');
                      if (templatesBtn) {
                        (templatesBtn as HTMLElement).click();
                        // Smooth scroll to top
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    OPEN
                  </Button>
                </div>

                <Button 
                    onClick={() => {
                        if (!session) {
                            setShowSignInPrompt(true);
                            return;
                        }
                        extractDetails();
                    }}
                    disabled={!base64Data || isLoading}
                    className="w-full rounded-lg bg-black dark:bg-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:bg-gray-400 disabled:text-gray-600 disabled:border-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 dark:disabled:border-gray-700 transition-all border-2 border-black dark:border-white font-bold font-mono text-white dark:text-black py-3"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />
                            <span>ANALYZING REPORT...</span>
                        </div>
                    ) : (
                        "ANALYZE REPORT"
                    )}
                </Button>


                <div className="space-y-3">
                    <Label className="text-base font-bold font-mono text-black dark:text-white">REPORT SUMMARY</Label>
                    <Textarea
                        value={reportData}
                        onChange={(e) => setReportData(e.target.value)}
                        placeholder="SUMMARY WILL APPEAR HERE (YOU CAN ADD ADDITIONAL INFORMATION FOR BETTER INSIGHTS)" 
                        className="h-32 resize-none rounded-lg border-2 border-black dark:border-white bg-white dark:bg-black font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={() => onReportConfirmation(reportData)}
                    disabled={!reportData.trim()}
                    className="w-full rounded-lg border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 dark:disabled:border-gray-600 transition-all font-bold font-mono py-3"
                >
                    CONFIRM & CONTINUE
                </Button>


            </div>

            {/* Sign-in Prompt Modal */}
            <SignInPromptModal 
                isOpen={showSignInPrompt} 
                onClose={() => setShowSignInPrompt(false)} 
            />
        </div>
    )
}

export default ReportComponent