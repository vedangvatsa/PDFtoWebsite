'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  UploadCloud,
  Loader2,
  Target,
  Building2,
  DollarSign,
} from 'lucide-react';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import {
  addJobApplyUtm,
  companyLogoFallback,
  jobTypeLabel,
  timeAgo,
} from '@/lib/job-description';
import { useToast } from '@/hooks/use-toast';
import posthog from 'posthog-js';

export interface JobDetail {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  job_type: string | null;
  salary: string | null;
  tags: string[];
  apply_url: string;
  category: string | null;
  source: string;
  published_at: string | null;
  description_html: string;
  has_description: boolean;
  excerpt: string;
  company_slug?: string | null;
  job_slug?: string | null;
  public_path?: string | null;
}

interface Props {
  job: JobDetail;
  userSkills: string[];
  profileComplete: boolean;
  isAuthenticated: boolean;
}

export default function JobDetailClient({
  job,
  userSkills: initialSkills,
  profileComplete,
  isAuthenticated,
}: Props) {
  const [userSkills] = useState(initialSkills);
  const [isUploading, setIsUploading] = useState(false);
  const [logoSrc, setLogoSrc] = useState(
    companyLogoFallback(job.company, job.company_logo)
  );
  const router = useRouter();
  const { toast } = useToast();

  const applyUrl = addJobApplyUtm(job.apply_url, 'job_detail');
  const typeLabel = jobTypeLabel(job.job_type);

  useEffect(() => {
    posthog.capture('job_detail_viewed', {
      job_id: job.id,
      title: job.title,
      company: job.company,
      source: job.source,
      has_description: job.has_description,
    });
    fetch('/api/jobs/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [job.id], action: 'view' }),
    }).catch(() => {});
  }, [job.id, job.title, job.company, job.source, job.has_description]);

  const trackClick = () => {
    posthog.capture('job_detail_apply_clicked', {
      job_id: job.id,
      title: job.title,
      company: job.company,
      source: job.source,
    });
    fetch('/api/jobs/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [job.id], action: 'click' }),
    }).catch(() => {});
  };

  const parseCv = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Too Large', description: 'Max 10MB.' });
      return;
    }
    setIsUploading(true);
    toast({ title: 'Parsing CV...', description: 'Extracting your details.' });
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: fd });
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Failed', description: 'Could not parse your CV.' });
        return;
      }
      const parsed = await res.json();
      posthog.capture('job_detail_cv_uploaded', { job_id: job.id });
      sessionStorage.setItem('parsedResume', JSON.stringify(parsed));
      try {
        localStorage.setItem('parsedResume', JSON.stringify(parsed));
      } catch {}
      try {
        sessionStorage.setItem('pendingJobApply', applyUrl);
        sessionStorage.setItem('pendingJobId', job.id);
      } catch {}
      router.push('/editor');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Network error.' });
    } finally {
      setIsUploading(false);
    }
  };

  const ApplyButton = ({
    className = '',
    size = 'md',
  }: {
    className?: string;
    size?: 'md' | 'sm';
  }) => (
    <a
      href={applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
      className={`flex items-center justify-center gap-2 w-full rounded-xl bg-black text-white font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md touch-manipulation ${
        size === 'sm' ? 'px-3 py-2.5 text-sm' : 'px-4 py-3 text-sm sm:text-[15px]'
      } ${className}`}
    >
      <span className="truncate">Apply on company site</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </a>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Header />
      <main
        id="main-content"
        className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14 lg:py-16 pb-28 flex-1 min-w-0"
      >
        <Link
          href={job.company_slug ? `/${job.company_slug}` : '/jobs'}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4 sm:mb-6 min-h-[44px] sm:min-h-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[70vw] sm:max-w-none">
            {job.company_slug ? `${job.company} careers` : 'All jobs'}
          </span>
        </Link>

        <article className="bg-white border border-zinc-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm min-w-0 overflow-hidden">
          <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={`${job.company} logo`}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl object-cover border border-zinc-100 shrink-0"
              onLoad={(e) => {
                const el = e.target as HTMLImageElement;
                if (!job.company_logo && el.naturalWidth <= 16) {
                  setLogoSrc(
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random&color=fff&size=128&bold=true`
                  );
                }
              }}
              onError={() => {
                setLogoSrc(
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random&color=fff&size=128&bold=true`
                );
              }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 leading-snug sm:leading-tight break-words">
                {job.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1.5 gap-x-3 mt-2 text-[13px] sm:text-sm text-zinc-600">
                <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-800 min-w-0">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{job.company}</span>
                </span>
                {job.location && (
                  <span className="inline-flex items-start gap-1.5 min-w-0">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="break-words">{job.location}</span>
                  </span>
                )}
                {typeLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    {typeLabel}
                  </span>
                )}
                {job.published_at && (
                  <span className="inline-flex items-center gap-1.5 text-zinc-400">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {timeAgo(job.published_at)}
                  </span>
                )}
              </div>
              {job.salary && (
                <p className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-emerald-700 break-words">
                  <DollarSign className="h-3.5 w-3.5 shrink-0" />
                  {job.salary}
                </p>
              )}
            </div>
          </div>

          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5 sm:mb-6">
              {job.tags.slice(0, 12).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 max-w-full truncate"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Single-column apply (all breakpoints) */}
          <div className="mb-5 sm:mb-6 space-y-3">
            <ApplyButton />
            <p className="text-[11px] text-center text-zinc-400">
              Opens the official application on the company site
            </p>

            {userSkills.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Optional: upload your CV for matches on similar roles.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor="jd-cv-upload"
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-800 font-medium text-xs cursor-pointer hover:bg-zinc-100 transition-colors touch-manipulation min-h-[40px] ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-3.5 w-3.5" />
                    )}
                    {isUploading ? 'Parsing...' : 'Upload CV'}
                    <input
                      id="jd-cv-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.rtf,.txt,.jpg,.jpeg,.png,.webp,.heic"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await parseCv(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {!isAuthenticated && (
                    <Link
                      href="/signup"
                      className="text-[11px] text-zinc-500 hover:text-zinc-800 whitespace-nowrap"
                      onClick={() =>
                        posthog.capture('job_detail_signup_clicked', { job_id: job.id })
                      }
                    >
                      Sign up
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-2">
                <Target className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 text-xs text-emerald-900 leading-relaxed">
                  <span className="font-semibold">
                    {profileComplete ? 'Profile ready' : 'Skills on file'}
                  </span>
                  {userSkills.slice(0, 4).length > 0 && (
                    <span className="text-emerald-800/80">
                      {' '}
                      · {userSkills.slice(0, 4).join(', ')}
                      {userSkills.length > 4 ? '…' : ''}
                    </span>
                  )}
                  {!profileComplete && (
                    <Link
                      href="/editor"
                      className="block mt-1 font-semibold text-emerald-700 hover:underline"
                    >
                      Complete profile for better matches →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-100 pt-5 sm:pt-6 min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3 sm:mb-4">
              Job description
            </h2>
            {job.has_description ? (
              <div
                className="job-description text-[13px] sm:text-[14px] leading-relaxed text-zinc-600 min-w-0 max-w-full overflow-x-auto
                  break-words [overflow-wrap:anywhere]
                  [&_*]:max-w-full
                  [&_img]:h-auto [&_img]:max-w-full
                  [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto
                  [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap
                  [&_h2]:text-[15px] sm:[&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-zinc-900 [&_h2]:mt-5 sm:[&_h2]:mt-6 [&_h2]:mb-2
                  [&_h3]:text-[14px] sm:[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-zinc-900 [&_h3]:mt-4 sm:[&_h3]:mt-5 [&_h3]:mb-2
                  [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-zinc-800 [&_h4]:mt-4 [&_h4]:mb-1.5
                  [&_p]:mb-3 [&_p]:leading-relaxed
                  [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                  [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                  [&_li]:text-zinc-600
                  [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_a]:break-all
                  [&_strong]:font-semibold [&_strong]:text-zinc-800
                  [&_b]:font-semibold [&_b]:text-zinc-800
                  [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-zinc-500"
                dangerouslySetInnerHTML={{ __html: job.description_html }}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 sm:px-5 py-6 sm:py-8 text-center">
                <Briefcase className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm text-zinc-600 font-medium">
                  Full description is on the company careers page.
                </p>
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackClick}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:underline min-h-[44px]"
                >
                  View full listing
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          <div className="mt-8 sm:mt-10 pt-5 border-t border-zinc-100">
            <ApplyButton />
          </div>

          <p className="mt-4 text-[11px] text-zinc-400 leading-relaxed text-center">
            Listing on CVin.Bio. You apply on the employer&apos;s site.
          </p>
        </article>
      </main>

      {/* Sticky mobile apply bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <ApplyButton size="sm" />
      </div>

      <div className="sm:pb-0 pb-2">
        <MicroFooter />
      </div>
    </div>
  );
}
