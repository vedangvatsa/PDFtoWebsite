'use client';

import type { ReactNode } from 'react';

import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { PAGE_CONTAINER, PAGE_SUBTITLE, PAGE_TITLE } from '@/lib/utils';
import { ArrowLeft, ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react';

export function NomadPageShell({
  title,
  subtitle,
  children,
  loading = false,
  footer,
  overlay,
  outerClassName = 'min-h-screen bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col',
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  footer?: ReactNode;
  overlay?: ReactNode;
  outerClassName?: string;
}) {
  return (
    <div className={outerClassName}>
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <div className="mb-10">
          <h1 className={PAGE_TITLE}>{title}</h1>
          {typeof subtitle === 'string' ? <p className={PAGE_SUBTITLE}>{subtitle}</p> : subtitle}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          children
        )}
        {footer}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
      {overlay}
    </div>
  );
}

export function NomadSortHeader<T extends string>({
  label,
  field,
  sortKey,
  sortDir,
  onToggle,
  className = '',
}: {
  label: string;
  field: T;
  sortKey: T;
  sortDir: 'asc' | 'desc';
  onToggle: (field: T) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => onToggle(field)}
      className={`group inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-700 transition-colors ${className}`}
    >
      {label}
      {sortKey === field ? (
        sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-zinc-900" /> : <ArrowDown className="h-3 w-3 text-zinc-900" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );
}
