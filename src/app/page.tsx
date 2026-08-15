
"use client";

import { useState, useEffect } from 'react';
import { preload } from 'react-dom';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { LANDING_EVENTS } from '@/lib/posthog-events';
import { Button } from '@/components/ui/button';
import { UploadCloud, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/auth';
import { PLATFORM_JOBS_DISPLAY } from '@/lib/platform-job-count';
import {
  emptyParsedResumeShell,
  persistParsedResume,
  reviewToastCopy,
  storePendingResumeFile,
} from '@/lib/cv-upload-client';
import CvFileOverlay from '@/components/cv-file-overlay';

const LoginDialog = dynamic(
  () => import('@/components/login-dialog').then((m) => ({ default: m.LoginDialog })),
  {
    ssr: false,
    loading: () => (
      <button type="button" className="underline hover:text-primary">
        Sign in
      </button>
    ),
  }
);

const HERO_SRC_360 = '/images/cvinbio-360.webp';
const HERO_SRC_560 = '/images/cvinbio-560.webp';
const HERO_SRCSET = `${HERO_SRC_360} 360w, ${HERO_SRC_560} 560w`;
const HERO_SIZES = '(max-width: 640px) 180px, 280px';

function StepIndicator({ num, label, desc }: { num: number; label: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">{num}</div>
      <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      <span className="text-[11px] text-muted-foreground">{desc}</span>
    </div>
  );
}

function StepDivider() {
  return <div className="h-px flex-1 mx-4 bg-border hidden sm:block" />;
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // If user lands here after OAuth with pending resume data, redirect to editor
  useEffect(() => {
    if (!isUserLoading && user && localStorage.getItem('parsedResume')) {
      router.push('/editor');
    }
  }, [user, isUserLoading, router]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        posthog.capture(LANDING_EVENTS.CV_FILE_TOO_LARGE, { file_size: file.size, file_type: file.type });
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a file under 10MB.' });
        event.target.value = '';
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/x-pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/rtf', 'text/rtf', 'text/plain', 'text/markdown', 'text/csv', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/tif', 'image/heic', 'image/heif', 'application/octet-stream'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|rtf|txt|md|markdown|csv|jpg|jpeg|png|webp|gif|bmp|tif|tiff|heic|heif)$/i)) {
         posthog.capture(LANDING_EVENTS.CV_INVALID_FORMAT, { file_type: file.type, file_name: file.name });
         toast({ variant: 'destructive', title: 'Invalid Format', description: 'Please select a PDF, Word, text, or image file.' });
         event.target.value = '';
         return;
      }

      setIsProcessingFile(true);
      posthog.capture(LANDING_EVENTS.CV_UPLOAD_STARTED, { file_type: file.type, file_size: file.size });
      toast({ title: 'Parsing CV...', description: 'Extracting your details, just a moment.' });

      try {
        const formData = new FormData();
        formData.append('resume', file);
        const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });

        let parsed = emptyParsedResumeShell(file.name);
        if (res.ok) {
          try {
            parsed = await res.json();
          } catch {
            /* keep shell */
          }
        } else {
          // Rate limit / server error — still open editor so we never lose the user
          await storePendingResumeFile(file);
          let errorMsg = 'Auto-fill unavailable right now.';
          try {
            const errData = await res.json();
            if (errData.error) errorMsg = errData.error;
          } catch {
            /* keep default */
          }
          parsed = emptyParsedResumeShell(file.name);
          parsed._parseWarnings = [errorMsg];
        }

        posthog.capture(LANDING_EVENTS.CV_UPLOAD_COMPLETED, {
          file_type: file.type,
          parse_method: parsed._parseMethod || 'ai',
          needs_review: !!parsed._parseNeedsReview,
        });
        persistParsedResume(parsed);
        const copy = reviewToastCopy(parsed);
        toast({ title: copy.title, description: copy.description });
        router.push('/editor');
      } catch (err) {
         // Network disconnect — still land in editor with a shell + pending file for retry
         posthog.capture(LANDING_EVENTS.CV_UPLOAD_FAILED, { error: 'network_error' });
         await storePendingResumeFile(file);
         const shell = emptyParsedResumeShell(file.name);
         shell._parseWarnings = ['Network error during parse — continue in the editor.'];
         persistParsedResume(shell);
         toast({
           title: 'Continue in the editor',
           description: 'We could not reach the parser. Fill in details manually or try uploading again shortly.',
         });
         router.push('/editor');
      } finally {
        event.target.value = '';
        setIsProcessingFile(false);
      }
    }
  };


  // Skip /_next/image for LCP — static WebP at display size, no optimizer hop.
  preload(HERO_SRC_360, {
    as: 'image',
    imageSrcSet: HERO_SRCSET,
    imageSizes: HERO_SIZES,
    fetchPriority: 'high',
  });

  return (
    <div className="flex h-screen flex-col overflow-x-hidden">
      <Header />
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 text-center">
          <div className="rounded-2xl p-2 sm:p-4">
            <img
              src={HERO_SRC_560}
              srcSet={HERO_SRCSET}
              sizes={HERO_SIZES}
              alt="CVin.Bio | Turn your CV into a website"
              width={300}
              height={300}
              fetchPriority="high"
              decoding="async"
              className="mb-0 w-[180px] h-[180px] sm:w-[280px] sm:h-[280px]"
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-balance">
              Upload your CV. See matching jobs.
            </h1>
            <Link href="/discover" className="inline-block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors">
              Get an AI-ready profile and auto-match with {PLATFORM_JOBS_DISPLAY} jobs
            </Link>
          </div>

          <div className="w-full max-w-[600px] min-h-[320px] flex flex-col justify-center">
            {!mounted ? (
              <div className="w-full h-full" />
            ) : user ? (
              <div className="w-full flex flex-col items-center justify-center">
                  <Button size="lg" className="w-full mt-2" asChild>
                      <Link href="/editor">Go to Your Editor</Link>
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                      Welcome, <span className="break-all">{user.user_metadata?.full_name?.split(' ')[0] || user.email}</span>!
                  </p>
              </div>
            ) : (
              <>
                <div className="w-full space-y-3">
                  <label htmlFor="resume-upload" className={`relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-accent ${isProcessingFile ? 'cursor-wait pointer-events-none' : ''}`}>
                      {isProcessingFile ? (
                          <>
                              <Loader2 className="mr-3 h-6 w-6 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Processing file...</span>
                          </>
                      ) : (
                         <>
                              <UploadCloud className="mr-3 h-6 w-6 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                  Upload your CV
                              </span>
                         </>
                      )}
                      <CvFileOverlay id="resume-upload" onChange={handleFileChange} disabled={isProcessingFile} />
                  </label>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground uppercase">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link href="/editor">
                      <Edit className="mr-2 h-4 w-4" />
                      Enter details manually
                    </Link>
                  </Button>

                  <p className="text-sm text-muted-foreground text-center pb-2">
                    Already have an account?{' '}
                    <LoginDialog />
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start w-full text-muted-foreground pt-4 px-2">
                  <StepIndicator num={1} label="Drop your CV" desc="Any format" />
                  <span className="text-muted-foreground/30 text-lg mt-1 text-center">→</span>
                  <StepIndicator num={2} label="Get a webpage" desc="Ready to share" />
                  <span className="text-muted-foreground/30 text-lg mt-1 text-center">→</span>
                  <StepIndicator num={3} label="Get matched" desc={`${PLATFORM_JOBS_DISPLAY} jobs`} />
                </div>
              </>
            )}
          </div>

        </div>
      </main>
      <MicroFooter />
    </div>
  );
}
