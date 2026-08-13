"use client";

import { Loader2, UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ResumeUploadPrompt({
  onFileChange,
  isGenerating,
}: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isGenerating: boolean;
}) {
  return (
    <label htmlFor="resume-upload" className={`flex w-full items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 py-4 px-6 text-center transition-colors mb-4 ${isGenerating ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}>
      {isGenerating ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /><span className="text-sm font-medium text-primary">Generating your profile...</span></>
      ) : (
        <><UploadCloud className="mr-2 h-4 w-4 text-primary" /><span className="text-sm font-medium text-primary">Upload your CV to automatically fill details</span></>
      )}
      <Input id="resume-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.rtf,.txt,.md,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.heic,.heif,image/*,application/pdf" onChange={onFileChange} disabled={isGenerating} />
    </label>
  );
}
