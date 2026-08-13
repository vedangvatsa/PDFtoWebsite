'use client';

import { useEffect, useState, type FormEvent } from 'react';

export function useReportUnlock(storageKey: string) {
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access')) {
      try {
        localStorage.setItem(storageKey, 'true');
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      setCheckingAccess(false);
      return;
    }
    try {
      if (localStorage.getItem(storageKey) === 'true') setUnlocked(true);
    } catch {
      /* ignore */
    }
    setCheckingAccess(false);
  }, [storageKey]);

  return { unlocked, checkingAccess };
}

export function ReportEmailGate({ report }: { report: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/report-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, report }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center max-w-md mx-auto" id="layoff-gate">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-100 rounded-full mb-5">
          <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-3">Check your inbox</h3>
        <p className="text-sm text-zinc-500 leading-relaxed mb-2">
          We&apos;ve sent a confirmation email to <span className="font-medium text-zinc-700">{email}</span>.
        </p>
        <p className="text-sm text-zinc-500 leading-relaxed">Click the link in the email to access the full report.</p>
        <p className="text-[11px] text-zinc-400 mt-5">Didn&apos;t receive it? Check your spam folder.</p>
      </div>
    );
  }

  return (
    <div className="text-center" id="layoff-gate">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-100 rounded-full mb-5">
        <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Full report</span>
      </div>
      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-3">Enter your email to read the full report</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto leading-relaxed">
        We&apos;ll send you a confirmation link to access all sections, exhibits, and data breakdowns.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400/40 focus:border-zinc-400 transition-all placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-7 py-3.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Sending...' : 'Send confirmation →'}
        </button>
      </form>
      {status === 'error' && <p className="text-xs text-red-500 mt-2">Something went wrong. Please try again.</p>}
      <p className="text-[11px] text-zinc-400 mt-4">
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline hover:text-zinc-600 transition-colors">
          terms
        </a>
        .
      </p>
    </div>
  );
}

export function ReportEmailCapture({ report, position }: { report: string; position: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/report-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, report }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 py-4 px-6 bg-emerald-50 border border-emerald-200 rounded-xl" id={`report-form-${position}`}>
        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <p className="text-sm text-emerald-800 font-medium">Done. Check your inbox.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md" id={`report-form-${position}`}>
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400/40 focus:border-zinc-400 transition-all placeholder:text-zinc-400"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {status === 'loading' ? 'Sending...' : 'Get the report'}
      </button>
      {status === 'error' && <p className="text-xs text-red-500 mt-1">Something went wrong. Try again.</p>}
    </form>
  );
}
