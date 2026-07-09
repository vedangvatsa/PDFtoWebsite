'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { PAGE_CONTAINER, PAGE_SUBTITLE, PAGE_TITLE } from '@/lib/utils';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Brain,
  Database,
  Network,
  Settings,
  Sparkles,
  Award,
  Clock,
  AlertTriangle,
  HelpCircle,
  Shield,
  ShieldAlert,
  ThumbsUp,
  Layers,
  Eye,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

/* ------------------------------------------------------------------ */
/*  Data Source & Icons                                               */
/* ------------------------------------------------------------------ */

import { ROLES_DATA, type Question } from '@/data/ai-interview-questions';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  'ai-agent-engineer': <Cpu className="w-4 h-4" />,
  'prompt-architect': <Brain className="w-4 h-4" />,
  'llm-tuning-engineer': <Network className="w-4 h-4" />,
  'mlops-engineer': <Settings className="w-4 h-4" />,
  'ai-pm': <LineChartIcon className="w-4 h-4" />,
  'ai-data-engineer': <Database className="w-4 h-4" />,
  'computer-vision-engineer': <Eye className="w-4 h-4" />,
  'ai-safety-engineer': <Shield className="w-4 h-4" />,
  'research-scientist': <Layers className="w-4 h-4" />,
  'ai-architect': <Lock className="w-4 h-4" />,
};

// Fallback helper in case LineChart wasn't imported
function LineChartIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                   */
/* ------------------------------------------------------------------ */

export default function AIInterviewPage() {
  const [selectedRoleId, setSelectedRoleId] = useState(ROLES_DATA[0].id);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Foundation' | 'Intermediate' | 'Advanced' | 'Expert'>('Foundation');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Find active role
  const activeRole = ROLES_DATA.find((r) => r.id === selectedRoleId) || ROLES_DATA[0];

  // Helper to toggle accordion items
  const toggleAccordion = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((item) => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  // Helper to copy Q&A text to clipboard
  const copyQAndA = (q: Question) => {
    const formattedText = `Question: ${q.question}\n\nIdeal Answer:\n- Core Idea: ${q.idealAnswer.coreIdea}\n- Key Points:\n${q.idealAnswer.keyPoints.map(p => `  * ${p}`).join('\n')}${q.idealAnswer.example ? `\n\nCode Example:\n${q.idealAnswer.example}` : ''}\n\nCommon Pitfalls:\n${q.commonPitfalls.map(p => `  * ${p}`).join('\n')}\n\nRed Flags:\n${q.redFlags.map(r => `  * ${r}`).join('\n')}`;
    navigator.clipboard.writeText(formattedText);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter questions based on search query
  const getFilteredQuestions = (difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Expert') => {
    const questions = activeRole.questions[difficulty] || [];
    if (!searchQuery.trim()) return questions;

    return questions.filter((q) => {
      const matchText = (
        q.question + ' ' + 
        q.idealAnswer.coreIdea + ' ' + 
        q.idealAnswer.keyPoints.join(' ') + ' ' +
        q.commonPitfalls.join(' ') + ' ' +
        q.whyThisMatters.join(' ')
      ).toLowerCase();
      return matchText.includes(searchQuery.toLowerCase());
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-zinc-200 transition-colors duration-200 flex flex-col relative overflow-hidden">
      {/* Subtle tech background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(24,24,27,0.03),transparent)] pointer-events-none -z-10" />
      
      <Header />
      
      <main id="main-content" className={PAGE_CONTAINER}>
        {/* Back Link */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Resources
        </Link>

        {/* Hero Section - Premium Mesh Grid Look */}
        <div className="relative mb-12 p-8 md:p-10 rounded-3xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_40px_-10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-zinc-50 rounded-full blur-3xl pointer-events-none -z-10" />
          
          <div className="relative z-10 max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-zinc-50 border-zinc-200 text-zinc-500 font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-md">
              AI Careers & Prep
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 mb-4 leading-none bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-700 bg-clip-text text-transparent">
              AI Interview Question Bank
            </h1>
            <p className="text-sm md:text-base text-zinc-500 leading-relaxed font-normal">
              An extensive, curated library of highly technical interview questions, key evaluation criteria, common pitfalls, and answers tailored to modern engineering and product teams.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sidebar: Roles Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-2.5">
              Select AI Role
            </h2>
            <div className="space-y-1 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-zinc-200/50 shadow-sm">
              {ROLES_DATA.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setExpandedIds([]);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-md shadow-zinc-950/10'
                        : 'border-transparent bg-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-zinc-800 border-zinc-700 text-white' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}>
                      {ROLE_ICONS[role.id]}
                    </span>
                    <span className="truncate tracking-tight">{role.role}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick CV Helper - Polished Card */}
            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hidden lg:block">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-zinc-500/5 to-transparent rounded-full blur-xl pointer-events-none" />
              <h3 className="text-xs font-bold text-zinc-900 tracking-tight flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                Build an AI Resume
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed mb-4 font-normal">
                Optimize your CV with semantic keyword integration for vector search and ATS systems. Convert your PDF CV into a website.
              </p>
              <Button asChild className="w-full h-8 text-[11px] font-bold bg-zinc-950 text-white hover:bg-zinc-900 rounded-xl transition-all shadow-sm">
                <Link href="/">
                  Convert CV to Web
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Active Role Meta Card - Glassmorphism style */}
            <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-[0_1.5px_4px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-50 rounded-full blur-3xl pointer-events-none -z-10 opacity-50" />
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">
                {activeRole.role}
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-normal">
                {activeRole.snapshot}
              </p>
              
              {/* Competency Badges */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Core Competencies Tested
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeRole.coreCompetencies.map((comp) => (
                    <Badge
                      key={comp}
                      variant="secondary"
                      className="text-[10px] font-bold px-2.5 py-1 bg-zinc-100/60 hover:bg-zinc-100 border border-zinc-200/40 text-zinc-600 rounded-lg tracking-tight transition-colors"
                    >
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter controls: Search and Segmented Difficulty Tabs */}
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder={`Search questions inside ${activeRole.role}...`}
                  className="pl-10 h-11 bg-white border-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 rounded-xl text-xs shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-xs text-zinc-400 hover:text-zinc-900 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Segmented control style difficulty tabs */}
              <div className="flex p-1 gap-1 bg-zinc-100/80 border border-zinc-200/50 rounded-2xl w-full max-w-xl">
                {(['Foundation', 'Intermediate', 'Advanced', 'Expert'] as const).map((diff) => {
                  const count = getFilteredQuestions(diff).length;
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        setSelectedDifficulty(diff);
                        setExpandedIds([]);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50'
                          : 'text-zinc-500 hover:text-zinc-900 border border-transparent'
                      }`}
                    >
                      {diff}
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-200/60 text-zinc-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {getFilteredQuestions(selectedDifficulty).length > 0 ? (
                getFilteredQuestions(selectedDifficulty).map((q) => {
                  const isExpanded = expandedIds.includes(q.id);
                  return (
                    <article
                      key={q.id}
                      className={`group rounded-2xl border bg-white transition-all duration-300 ${
                        isExpanded 
                          ? 'border-zinc-950 ring-1 ring-zinc-950/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]' 
                          : 'border-zinc-200 hover:border-zinc-400 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      {/* Card Header (Toggle Action) */}
                      <div
                        onClick={() => toggleAccordion(q.id)}
                        className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[9px] font-mono font-extrabold bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded">
                              {q.id}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                              {q.category}
                            </span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              {q.expectedTime}
                            </span>
                          </div>
                          <h3 className="text-sm md:text-base font-extrabold text-zinc-900 tracking-tight leading-snug group-hover:text-zinc-950 transition-colors">
                            {q.question}
                          </h3>
                        </div>
                        <div className="shrink-0 w-8 h-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 group-hover:text-zinc-900 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Card Body (Expanded Content with Smooth Slide-in details) */}
                      {isExpanded && (
                        <div className="px-5 pb-6 pt-1 border-t border-zinc-100 space-y-6">
                          
                          {/* Ideal Answer Section */}
                          <div className="space-y-3 mt-4">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-zinc-900" />
                              Ideal Response Strategy
                            </h4>
                            <div className="pl-4 border-l-2 border-zinc-950 space-y-3">
                              <p className="text-xs md:text-sm font-bold text-zinc-800 leading-relaxed">
                                {q.idealAnswer.coreIdea}
                              </p>
                              <ul className="space-y-2 list-none p-0 m-0 text-xs md:text-sm text-zinc-500 leading-relaxed font-normal">
                                {q.idealAnswer.keyPoints.map((point, index) => (
                                  <li key={index} className="flex gap-2">
                                    <span className="text-zinc-950 font-bold">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Code Example (styled as high-end editor window) */}
                          {q.idealAnswer.example && (
                            <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-950 p-4">
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/50">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-zinc-700" />
                                  <span className="w-2 h-2 rounded-full bg-zinc-700" />
                                  <span className="w-2 h-2 rounded-full bg-zinc-700" />
                                </div>
                                <span className="text-[9px] font-mono text-zinc-500 tracking-wider font-extrabold">
                                  {q.idealAnswer.exampleLanguage?.toUpperCase()} EXAMPLE
                                </span>
                              </div>
                              <div className="p-4 overflow-x-auto select-text">
                                <pre className="text-xs text-zinc-200 font-mono leading-relaxed max-h-72">
                                  <code>{q.idealAnswer.example}</code>
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Why This Matters / Common Pitfalls Split Columns */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2.5 p-4 rounded-xl border border-emerald-100 bg-emerald-50/20">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                                Why This Matters
                              </h4>
                              <ul className="space-y-2 list-none p-0 m-0 text-xs text-zinc-600 leading-relaxed font-normal">
                                {q.whyThisMatters.map((item, idx) => (
                                  <li key={idx} className="flex gap-2">
                                    <span className="text-emerald-600 font-extrabold">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2.5 p-4 rounded-xl border border-amber-100 bg-amber-50/20">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                Common Pitfalls
                              </h4>
                              <ul className="space-y-2 list-none p-0 m-0 text-xs text-zinc-600 leading-relaxed font-normal">
                                {q.commonPitfalls.map((item, idx) => (
                                  <li key={idx} className="flex gap-2">
                                    <span className="text-amber-600 font-extrabold">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Recruiter Evaluation Panel: Follow-ups & Red Flags */}
                          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/50 space-y-4">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                              Evaluation Guide for Interviewers
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Follow ups */}
                              <div className="space-y-2.5">
                                <h5 className="text-[10px] font-extrabold text-zinc-600 uppercase flex items-center gap-1.5 tracking-wider">
                                  <HelpCircle className="w-3 h-3 text-zinc-400" />
                                  Suggested Follow-ups
                                </h5>
                                <ul className="space-y-1.5 list-none p-0 m-0 text-xs text-zinc-500 leading-relaxed font-normal">
                                  {q.followUps.map((item, idx) => (
                                    <li key={idx} className="flex gap-1.5">
                                      <span className="text-zinc-400">→</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Red flags */}
                              <div className="space-y-2.5">
                                <h5 className="text-[10px] font-extrabold text-zinc-600 uppercase flex items-center gap-1.5 tracking-wider">
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                                  Red Flags to Spot
                                </h5>
                                <ul className="space-y-1.5 list-none p-0 m-0 text-xs text-zinc-500 leading-relaxed font-normal">
                                  {q.redFlags.map((item, idx) => (
                                    <li key={idx} className="flex gap-1.5">
                                      <span className="text-red-500 font-bold">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Scoring Rubric Grid */}
                            <div className="pt-4 border-t border-zinc-200 space-y-3">
                              <h5 className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-wider">
                                Scoring Rubric
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-xl bg-white border border-red-100 text-[11px] leading-relaxed font-normal">
                                  <span className="font-extrabold text-red-600 block mb-1">Score 1 (Poor)</span>
                                  <span className="text-zinc-500">{q.scoringRubric[1]}</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-white border border-amber-100 text-[11px] leading-relaxed font-normal">
                                  <span className="font-extrabold text-amber-600 block mb-1">Score 3 (Average)</span>
                                  <span className="text-zinc-500">{q.scoringRubric[3]}</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-white border border-emerald-100 text-[11px] leading-relaxed font-normal">
                                  <span className="font-extrabold text-emerald-600 block mb-1">Score 5 (Excellent)</span>
                                  <span className="text-zinc-500">{q.scoringRubric[5]}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Utility actions */}
                          <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-bold border-zinc-200 hover:bg-zinc-50 rounded-lg"
                              onClick={() => copyQAndA(q)}
                            >
                              {copiedId === q.id ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                  <Check className="w-3.5 h-3.5" />
                                  Copied!
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5">
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy full Q&A
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
                <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
                  <BookOpen className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-zinc-800">No questions found matching your search</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto font-normal">
                    Try searching for different keywords or checking another difficulty tier.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Disclaimer footer - full width (w-full) matching the layout update policy */}
        <div className="mt-20 pt-8 border-t border-zinc-200">
          <p className="text-[10px] text-zinc-400 leading-relaxed w-full font-normal">
            This interview question bank is updated continuously to align with modern production systems, models, and engineering architectures. Last updated June 2026.
          </p>
        </div>
      </main>
      
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
