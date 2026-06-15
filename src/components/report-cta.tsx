import Link from 'next/link';

interface ReportCTAProps {
  jobCount: string;
  headline?: string;
  subline?: string;
}

export default function ReportCTA({ jobCount, headline, subline }: ReportCTAProps) {
  return (
    <div className="p-10 bg-zinc-900 rounded-2xl text-center">
      {headline && <p className="text-sm text-zinc-400 mb-2">{headline}</p>}
      {subline && <p className="text-lg font-serif font-semibold text-white mb-5">{subline}</p>}
      {!headline && !subline && <p className="text-sm text-zinc-400 mb-5">See which roles are open right now</p>}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-white hover:bg-zinc-100 rounded-lg transition-colors"
        >
          Browse {jobCount} jobs on CVin.Bio
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
        >
          Turn your CV into a website
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </Link>
      </div>
    </div>
  );
}
