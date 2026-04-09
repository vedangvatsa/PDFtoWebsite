"use client";

import { useState } from 'react';
import Link from 'next/link';
import { UploadCloud, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function BlogCTA() {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a file under 10MB.' });
        event.target.value = '';
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/rtf', 'text/rtf', 'text/plain'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|rtf|txt)$/i)) {
         toast({ variant: 'destructive', title: 'Invalid Format', description: 'Please select a PDF, Word, or text file.' });
         event.target.value = '';
         return;
      }

      setIsProcessingFile(true);
      toast({ title: 'Parsing CV...', description: 'Extracting your details, just a moment.' });

      try {
        const formData = new FormData();
        formData.append('resume', file);
        const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
        
        if (!res.ok) {
            let errorMsg = 'Failed to parse CV. Internal Server Error.';
            try {
                const errData = await res.json();
                if (errData.error) errorMsg = errData.error;
            } catch (e) {}
            
            toast({ variant: 'destructive', title: 'Upload Rejected', description: errorMsg });
            setIsProcessingFile(false);
            event.target.value = '';
            return;
        }
        
        const parsed = await res.json();
        sessionStorage.setItem('parsedResume', JSON.stringify(parsed));
        router.push('/editor');
      } catch (err) {
         toast({ variant: 'destructive', title: 'Network Offline', description: 'Could not connect to the parsing server.' });
      } finally {
        event.target.value = '';
        setIsProcessingFile(false);
      }
    }
  };

  return (
    <div className="my-16 p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl transition-colors w-full mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1 tracking-tight">
          Turn Your CV into a Website
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Drop your CV below or build it from scratch.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 max-w-sm mx-auto">
        {/* Dropzone */}
        <div className="relative w-full group">
          <input 
            id="blog-cta-cv-upload"
            type="file" 
            accept=".pdf,.docx,.txt,.rtf" 
            onChange={handleFileChange} 
            disabled={isProcessingFile}
            aria-label="Upload your CV file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
          />
          <div className="w-full h-20 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/80 transition-colors shadow-sm">
            {isProcessingFile ? (
              <div className="flex items-center text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing CV...
              </div>
            ) : (
              <div className="flex items-center text-zinc-600 dark:text-zinc-300 font-medium text-sm">
                <UploadCloud className="w-5 h-5 mr-3 text-zinc-400 dark:text-zinc-500" /> Upload your CV
              </div>
            )}
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center w-full my-1">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        {/* Enter Manually Button */}
        <Link href="/editor" className="w-full flex items-center justify-center h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium text-sm rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
          <Edit className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" /> Enter details manually
        </Link>
      </div>
    </div>
  );
}
