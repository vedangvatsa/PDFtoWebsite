"use client";

import { Loader2, UploadCloud } from 'lucide-react';
import CvFileOverlay from '@/components/cv-file-overlay';

export function ResumeUploadPrompt({
  onFileChange,
  isGenerating,
}: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isGenerating: boolean;
}) {
  return (
    <label htmlFor="resume-upload" className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 py-4 px-6 text-center transition-colors mb-4 ${isGenerating ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}>
      {isGenerating ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /><span className="text-sm font-medium text-primary">Generating your profile...</span></>
      ) : (
        <><UploadCloud className="mr-2 h-4 w-4 text-primary" /><span className="text-sm font-medium text-primary pointer-events-none">Upload your CV to automatically fill details</span></>
      )}
      <CvFileOverlay id="resume-upload" onChange={onFileChange} disabled={isGenerating} />
    </label>
  );
}
