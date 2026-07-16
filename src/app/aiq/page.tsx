'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { PAGE_CONTAINER, PAGE_SUBTITLE, PAGE_TITLE, cn } from '@/lib/utils';
import {
 ArrowLeft,
 Search,
 BookOpen,
 Copy,
 Check,
 ChevronDown,
 ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROLES_DATA, type Question } from '@/data/ai-interview-questions';

export default function AIInterviewPage() {
 const [selectedRoleId, setSelectedRoleId] = useState(ROLES_DATA[0].id);
 const [selectedDifficulty, setSelectedDifficulty] = useState<
 'Foundation' | 'Advanced'
 >('Foundation');
 const [expandedIds, setExpandedIds] = useState<string[]>([]);
 const [copiedId, setCopiedId] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState('');

 const activeRole =
 ROLES_DATA.find((r) => r.id === selectedRoleId) || ROLES_DATA[0];

 const toggleAccordion = (id: string) => {
 setExpandedIds((prev) =>
 prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
 );
 };

 const copyQAndA = (q: Question) => {
 const formattedText = `Question: ${q.question}\n\nAnswer:\n${q.idealAnswer.coreIdea}\n\nKey points:\n${q.idealAnswer.keyPoints.map((p) => `- ${p}`).join('\n')}${q.idealAnswer.example ? `\n\nExample:\n${q.idealAnswer.example}` : ''}`;
 navigator.clipboard.writeText(formattedText);
 setCopiedId(q.id);
 setTimeout(() => setCopiedId(null), 2000);
 };

 const getFilteredQuestions = (difficulty: 'Foundation' | 'Advanced') => {
 const questions = activeRole.questions[difficulty] || [];
 if (!searchQuery.trim()) return questions;
 const q = searchQuery.toLowerCase();
 return questions.filter((item) => {
 const hay = (
 item.question +
 ' ' +
 item.idealAnswer.coreIdea +
 ' ' +
 item.idealAnswer.keyPoints.join(' ')
 ).toLowerCase();
 return hay.includes(q);
 });
 };

 const visible = getFilteredQuestions(selectedDifficulty);

 return (
 <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
 <Header />

 <main id="main-content" className={PAGE_CONTAINER}>
 <Link
 href="/resources"
 className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Back to Resources
 </Link>

 <div className="mb-10">
 <h1 className={PAGE_TITLE}>AI Interview Question Bank</h1>
 <p className={PAGE_SUBTITLE}>
 120 interview questions for AI engineering roles. Short answers, pitfalls, and scoring notes.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
 {/* Role list */}
 <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
 <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
 Role
 </h2>
 <nav className="border border-zinc-200 bg-white rounded-lg overflow-hidden">
 {ROLES_DATA.map((role) => {
 const selected = selectedRoleId === role.id;
 const count =
 (role.questions.Foundation?.length || 0) +
 (role.questions.Advanced?.length || 0);
 return (
 <button
 key={role.id}
 type="button"
 onClick={() => {
 setSelectedRoleId(role.id);
 setExpandedIds([]);
 }}
 className={cn(
 'w-full text-left px-3 py-2.5 text-xs font-semibold border-b border-zinc-100 last:border-b-0 transition-colors',
 selected
 ? 'bg-zinc-900 text-white'
 : 'bg-white text-zinc-700 hover:bg-zinc-50'
 )}
 >
 <span className="block leading-snug">{role.role}</span>
 <span
 className={cn(
 'text-[10px] font-medium',
 selected ? 'text-zinc-300' : 'text-zinc-400'
 )}
 >
 {count} questions
 </span>
 </button>
 );
 })}
 </nav>

 <div className="hidden lg:block border border-zinc-200 bg-white rounded-lg p-4">
 <p className="text-xs font-bold text-zinc-900 tracking-tight mb-1.5">
 Get a CV website
 </p>
 <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
 Turn your PDF CV into a live profile page you can share with
 recruiters.
 </p>
 <Button
 asChild
 className="w-full h-9 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
 >
 <Link href="/">Convert CV to web</Link>
 </Button>
 </div>
 </aside>

 {/* Questions */}
 <div className="lg:col-span-8 space-y-5 min-w-0">
 <div className="border border-zinc-200 bg-white rounded-lg p-4 sm:p-5">
 <h2 className="text-lg sm:text-xl font-extrabold tracking-tighter text-zinc-900 mb-2">
 {activeRole.role}
 </h2>
 <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-4">
 {activeRole.snapshot}
 </p>
 <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
 Skills tested
 </p>
 <div className="flex flex-wrap gap-1.5">
 {activeRole.coreCompetencies.map((comp) => (
 <span
 key={comp}
 className="text-[10px] font-medium px-2 py-1 border border-zinc-200 bg-zinc-50 text-zinc-600 rounded"
 >
 {comp}
 </span>
 ))}
 </div>
 </div>

 <div className="space-y-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
 <Input
 type="search"
 placeholder="Search questions…"
 className="pl-10 h-10 bg-white border-zinc-200 rounded-md text-xs"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>

 <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 border border-zinc-200 rounded-md max-w-md">
 {(['Foundation', 'Advanced'] as const).map((diff) => {
 const count = getFilteredQuestions(diff).length;
 const selected = selectedDifficulty === diff;
 return (
 <button
 key={diff}
 type="button"
 onClick={() => {
 setSelectedDifficulty(diff);
 setExpandedIds([]);
 }}
 className={cn(
 'py-2 px-2 rounded text-xs font-semibold transition-colors',
 selected
 ? 'bg-white text-zinc-900 border border-zinc-200'
 : 'text-zinc-500 hover:text-zinc-800 border border-transparent'
 )}
 >
 {diff}{' '}
 <span className="text-[10px] text-zinc-400">({count})</span>
 </button>
 );
 })}
 </div>
 </div>

 <div className="space-y-2">
 {visible.length > 0 ? (
 visible.map((q) => {
 const isExpanded = expandedIds.includes(q.id);
 return (
 <article
 key={q.id}
 className={cn(
 'border bg-white rounded-lg',
 isExpanded ? 'border-zinc-900' : 'border-zinc-200'
 )}
 >
 <button
 type="button"
 onClick={() => toggleAccordion(q.id)}
 className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left"
 >
 <h3 className="text-sm font-bold text-zinc-900 tracking-tight leading-snug">
 {q.question}
 </h3>
 <span className="shrink-0 w-7 h-7 border border-zinc-200 rounded flex items-center justify-center text-zinc-500">
 {isExpanded ? (
 <ChevronUp className="w-4 h-4" />
 ) : (
 <ChevronDown className="w-4 h-4" />
 )}
 </span>
 </button>

 {isExpanded && (
 <div className="px-4 sm:px-5 pb-5 space-y-5 border-t border-zinc-100">
 <div className="pt-4 space-y-2">
 <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
 Answer
 </p>
 <p className="text-sm font-semibold text-zinc-900 leading-relaxed">
 {q.idealAnswer.coreIdea}
 </p>
 <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-600 leading-relaxed">
 {q.idealAnswer.keyPoints.map((point, index) => (
 <li key={index} className="flex gap-2">
 <span className="text-zinc-900 shrink-0">•</span>
 <span>{point}</span>
 </li>
 ))}
 </ul>
 </div>

 {q.idealAnswer.example && (
 <div className="rounded-md border border-zinc-200 overflow-hidden">
 <div className="px-3 py-1.5 border-b border-zinc-200 bg-zinc-50">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
 {q.idealAnswer.exampleLanguage || 'example'}
 </span>
 </div>
 <pre className="p-3 text-[11px] sm:text-xs text-zinc-800 font-mono leading-relaxed overflow-x-auto max-h-64 bg-white">
 <code>{q.idealAnswer.example}</code>
 </pre>
 </div>
 )}

 {(q.commonPitfalls?.length > 0 ||
 q.whyThisMatters?.length > 0) && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600">
 {q.whyThisMatters?.length > 0 && (
 <div>
 <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
 Why it matters
 </p>
 <ul className="space-y-1">
 {q.whyThisMatters.map((item, i) => (
 <li key={i}>• {item}</li>
 ))}
 </ul>
 </div>
 )}
 {q.commonPitfalls?.length > 0 && (
 <div>
 <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
 Common mistakes
 </p>
 <ul className="space-y-1">
 {q.commonPitfalls.map((item, i) => (
 <li key={i}>• {item}</li>
 ))}
 </ul>
 </div>
 )}
 </div>
 )}

 <div className="pt-2 border-t border-zinc-100">
 <Button
 type="button"
 variant="outline"
 size="sm"
 className="h-8 text-xs font-semibold border-zinc-200 rounded-md"
 onClick={() => copyQAndA(q)}
 >
 {copiedId === q.id ? (
 <span className="inline-flex items-center gap-1.5">
 <Check className="w-3.5 h-3.5" />
 Copied
 </span>
 ) : (
 <span className="inline-flex items-center gap-1.5">
 <Copy className="w-3.5 h-3.5" />
 Copy Q&amp;A
 </span>
 )}
 </Button>
 </div>
 </div>
 )}
 </article>
 );
 })
 ) : (
 <div className="text-center py-14 bg-white rounded-lg border border-zinc-200 px-6">
 <BookOpen className="w-7 h-7 text-zinc-300 mx-auto mb-3" />
 <p className="text-sm font-bold text-zinc-800">
 No matching questions
 </p>
 <p className="text-xs text-zinc-500 mt-1">
 Try different keywords or switch Foundation / Advanced.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Mobile CTA */}
 <div className="lg:hidden mt-8 border border-zinc-200 bg-white rounded-lg p-4">
 <p className="text-xs font-bold text-zinc-900 mb-1">Get a CV website</p>
 <p className="text-[11px] text-zinc-500 mb-3">
 Turn your PDF CV into a live profile page.
 </p>
 <Button
 asChild
 className="w-full h-9 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
 >
 <Link href="/">Convert CV to web</Link>
 </Button>
 </div>

 <div className="mt-16 pt-6 border-t border-zinc-200">
 <p className="text-[10px] text-zinc-400 leading-relaxed">
 Focused on production AI systems. Last updated July 2026.
 </p>
 </div>
 </main>

 <MicroFooter />
 <TelegramJobPopup />
 </div>
 );
}
