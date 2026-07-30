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
  X,
  Target,
  Building2,
  DollarSign,
} from 'lucide-react';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { PAGE_CONTAINER } from '@/lib/utils';
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
  /** Company URL segment, e.g. google */
  company_slug?: string | null;
  /** Short job slug when curated, e.g. mkt */
  job_slug?: string | null;
  /** Canonical path e.g. /google/mkt */
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
  const [showCta, setShowCta] = useState(false);
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
      soft_cta: userSkills.length === 0,
    });
    fetch('/api/jobs/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [job.id], action: 'click' }),
    }).catch(() => {});
  };

  const handleApply = (e?: React.MouseEvent) => {
    trackClick();
    // Soft conversion: if no skills on profile, show CV interstitial first
    if (userSkills.length === 0) {
      e?.preventDefault();
      posthog.capture('job_detail_soft_cta_shown', {
        job_id: job.id,
        company: job.company,
      });
      setShowCta(true);
      return;
    }
    // Has skills → open apply URL directly
  };

  const openApply = () => {
    posthog.capture('job_detail_soft_cta_continue', {
      job_id: job.id,
      company: job.company,
    });
    setShowCta(false);
    window.open(applyUrl, '_blank', 'noopener,noreferrer');
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
      // Remember where they were applying so editor/signup can return later if needed
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

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/10 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        {/* Back: company page when on /google/..., else jobs board */}
        <Link
          href={job.company_slug ? `/${job.company_slug}` : '/jobs'}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {job.company_slug ? `${job.company} careers` : 'All jobs'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Main column */}
          <article className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={`${job.company} logo`}
                className="h-12 w-12 rounded-xl object-cover border border-zinc-100 shrink-0"
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
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-zinc-600">
                  <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                    {job.company}
                  </span>
                  {job.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      {job.location}
                    </span>
                  )}
                  {typeLabel && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                      {typeLabel}
                    </span>
                  )}
                  {job.published_at && (
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      {timeAgo(job.published_at)}
                    </span>
                  )}
                </div>
                {job.salary && (
                  <p className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-emerald-700">
                    <DollarSign className="h-3.5 w-3.5" />
                    {job.salary}
                  </p>
                )}
              </div>
            </div>

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {job.tags.slice(0, 12).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Mobile apply */}
            <div className="lg:hidden mb-6">
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApply}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-black text-white font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
              >
                Apply on company site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Description */}
            <div className="border-t border-zinc-100 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Job description
              </h2>
              {job.has_description ? (
                <div
                  className="job-description text-[14px] leading-relaxed text-zinc-600
                    [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-zinc-900 [&_h2]:mt-6 [&_h2]:mb-2
                    [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-zinc-900 [&_h3]:mt-5 [&_h3]:mb-2
                    [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-zinc-800 [&_h4]:mt-4 [&_h4]:mb-1.5
                    [&_p]:mb-3 [&_p]:leading-relaxed
                    [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                    [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                    [&_li]:text-zinc-600
                    [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline
                    [&_strong]:font-semibold [&_strong]:text-zinc-800
                    [&_b]:font-semibold [&_b]:text-zinc-800
                    [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-zinc-500"
                  dangerouslySetInnerHTML={{ __html: job.description_html }}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center">
                  <Briefcase className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm text-zinc-600 font-medium">
                    Full description is on the company careers page.
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    We&apos;ll send you there to apply. Takes a second.
                  </p>
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleApply}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    View full listing
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>

            <p className="mt-8 text-[11px] text-zinc-400 leading-relaxed">
              You&apos;re viewing a listing on CVin.Bio. Applications are submitted on the
              employer&apos;s site. We may lightly clean formatting for readability.
            </p>
          </article>

          {/* Sidebar: soft conversion + apply */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApply}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-black text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
              >
                Apply on company site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="text-[11px] text-center text-zinc-400 mt-2">
                Opens the official application
              </p>
            </div>

            {/* Soft CV / account CTA */}
            {userSkills.length === 0 ? (
              <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 text-white rounded-2xl p-5 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-semibold">Let jobs find you</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  Upload your CV once. Get matched to roles like this and a public profile
                  recruiters can open.
                </p>
                <label
                  htmlFor="jd-cv-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm cursor-pointer hover:bg-zinc-100 transition-colors ${
                    isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {isUploading ? 'Parsing...' : 'Upload CV (free)'}
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
                    className="block text-center text-xs text-zinc-400 hover:text-white mt-3 transition-colors"
                    onClick={() =>
                      posthog.capture('job_detail_signup_clicked', { job_id: job.id })
                    }
                  >
                    or create a free account →
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-emerald-900">
                    {profileComplete ? 'Profile ready' : 'Skills on file'}
                  </h3>
                </div>
                <p className="text-xs text-emerald-800/80 leading-relaxed">
                  Matching uses your skills
                  {userSkills.slice(0, 4).length > 0
                    ? `: ${userSkills.slice(0, 4).join(', ')}${userSkills.length > 4 ? '...' : ''}`
                    : ''}
                  .
                </p>
                {!profileComplete && (
                  <Link
                    href="/editor"
                    className="inline-block mt-3 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Complete profile for better matches →
                  </Link>
                )}
              </div>
            )}

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-xs text-zinc-500 leading-relaxed">
              <p className="font-semibold text-zinc-700 mb-1">How applying works</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Review the role here on CVin.Bio</li>
                <li>Optionally upload your CV for matches</li>
                <li>Continue to the company site to submit</li>
              </ol>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky mobile apply bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleApply}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-black text-white font-semibold text-sm"
        >
          Apply on company site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Soft interstitial modal before external apply */}
      {showCta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCta(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-center text-zinc-900 mb-2 tracking-tight">
              Before you apply
            </h3>
            <p className="text-sm text-center text-zinc-500 mb-6 max-w-xs mx-auto">
              Drop your CV so we can match you to similar roles. Then we&apos;ll send you to{' '}
              <span className="font-medium text-zinc-700">{job.company}</span>.
            </p>

            <div className="flex flex-col gap-3">
              <label
                htmlFor="jd-modal-cv"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-black text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                {isUploading ? 'Parsing...' : 'Upload CV'}
                <input
                  id="jd-modal-cv"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.rtf,.txt,.jpg,.jpeg,.png,.webp,.heic"
                  disabled={isUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    posthog.capture('job_detail_soft_cta_upload', { job_id: job.id });
                    await parseCv(file);
                    e.target.value = '';
                  }}
                />
              </label>

              <button
                type="button"
                onClick={openApply}
                className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-900 font-medium text-sm transition-colors"
              >
                Skip and apply at {job.company}
              </button>
            </div>
          </div>
        </div>
      )}

      <MicroFooter />
    </div>
  );
}
