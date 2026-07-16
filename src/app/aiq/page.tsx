'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Shuffle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROLES_DATA, type Question } from '@/data/ai-interview-questions';

const START_TRACKS = [
  {
    id: 'build',
    title: 'LLM / agent engineer',
    roleId: 'ai-agent-engineer',
    forWho: 'You build chatbots, tools, or RAG apps.',
    youWillDrill: 'ReAct, tool calls, RAG, injection, memory.',
    timeHint: 'About 45 min for a full pass',
  },
  {
    id: 'ship',
    title: 'MLOps / inference engineer',
    roleId: 'mlops-engineer',
    forWho: 'You deploy and run models in production.',
    youWillDrill: 'Latency, vLLM, scaling, monitoring, rollback.',
    timeHint: 'About 45 min for a full pass',
  },
  {
    id: 'product',
    title: 'AI product manager',
    roleId: 'ai-pm',
    forWho: 'You set goals, cost, and quality for AI features.',
    youWillDrill: 'Token cost, hallu metrics, HITL, launch gates.',
    timeHint: 'About 30 min for a full pass',
  },
] as const;

const SEEN_KEY = 'cvin-aiq-seen';

type Mode = 'browse' | 'practice';

function loadSeen(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveSeen(map: Record<string, string[]>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export default function AIInterviewPage() {
  const [selectedRoleId, setSelectedRoleId] = useState(ROLES_DATA[0].id);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'Foundation' | 'Advanced'
  >('Foundation');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<Mode>('browse');
  const [practiceQueue, setPracticeQueue] = useState<Question[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerSec, setTimerSec] = useState<number | null>(null);
  const [seenMap, setSeenMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setSeenMap(loadSeen());
  }, []);

  const activeRole =
    ROLES_DATA.find((r) => r.id === selectedRoleId) || ROLES_DATA[0];

  const roleQuestionCount =
    (activeRole.questions.Foundation?.length || 0) +
    (activeRole.questions.Advanced?.length || 0);

  const seenForRole = seenMap[selectedRoleId] || [];

  const markSeen = useCallback(
    (id: string) => {
      setSeenMap((prev) => {
        const cur = prev[selectedRoleId] || [];
        if (cur.includes(id)) return prev;
        const next = { ...prev, [selectedRoleId]: [...cur, id] };
        saveSeen(next);
        return next;
      });
    },
    [selectedRoleId]
  );

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

  const allForRole = useMemo(() => {
    return [
      ...(activeRole.questions.Foundation || []),
      ...(activeRole.questions.Advanced || []),
    ];
  }, [activeRole]);

  const startPractice = (difficulty?: 'Foundation' | 'Advanced' | 'all') => {
    let pool: Question[] = [];
    if (difficulty === 'Foundation') {
      pool = [...(activeRole.questions.Foundation || [])];
    } else if (difficulty === 'Advanced') {
      pool = [...(activeRole.questions.Advanced || [])];
    } else {
      pool = [...allForRole];
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setPracticeQueue(pool);
    setPracticeIndex(0);
    setShowAnswer(false);
    setTimerSec(null);
    setMode('practice');
    if (pool[0]) markSeen(pool[0].id);
  };

  const practiceQuestion = practiceQueue[practiceIndex] || null;

  useEffect(() => {
    if (timerSec === null || timerSec <= 0 || mode !== 'practice') return;
    const t = window.setTimeout(() => setTimerSec((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [timerSec, mode]);

  const toggleAccordion = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    markSeen(id);
  };

  const copyQAndA = (q: Question) => {
    const formattedText = `Question: ${q.question}\n\nAnswer:\n${q.idealAnswer.coreIdea}\n\nKey points:\n${q.idealAnswer.keyPoints.map((p) => `- ${p}`).join('\n')}${q.idealAnswer.example ? `\n\nExample:\n${q.idealAnswer.example}` : ''}`;
    navigator.clipboard.writeText(formattedText);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectRole = (roleId: string, opts?: { practice?: boolean }) => {
    setSelectedRoleId(roleId);
    setExpandedIds([]);
    setSearchQuery('');
    setSelectedDifficulty('Foundation');
    if (opts?.practice) {
      // startPractice uses activeRole from state; apply after role switch via timeout
      window.setTimeout(() => {
        const role = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];
        const pool = [
          ...(role.questions.Foundation || []),
          ...(role.questions.Advanced || []),
        ];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        setPracticeQueue(pool);
        setPracticeIndex(0);
        setShowAnswer(false);
        setTimerSec(null);
        setMode('practice');
        if (pool[0]) {
          setSeenMap((prev) => {
            const cur = prev[roleId] || [];
            if (cur.includes(pool[0].id)) return prev;
            const next = { ...prev, [roleId]: [...cur, pool[0].id] };
            saveSeen(next);
            return next;
          });
        }
      }, 0);
    } else if (mode === 'practice') {
      setMode('browse');
      setPracticeQueue([]);
    }
  };

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

        <div className="mb-8 flex flex-col gap-3">
          <h1 className={PAGE_TITLE}>AI Interview Question Bank</h1>
          <p className={PAGE_SUBTITLE}>
            Starter questions for GenAI and LLM roles. Agents, RAG, MLOps,
            fine-tuning, and AI PM. Short answers and scoring notes. Not a full
            classic MLE or coding prep.
          </p>
          <p className="text-xs text-zinc-500 max-w-2xl">
            Each role has a focused set of questions. Use this to drill, then do
            mock interviews and real system design on your own.
          </p>
        </div>

        {/* Start here */}
        <div className="mb-10 border border-zinc-200 bg-white rounded-lg p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Pick a track and practice out loud
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
              Choose the job you are interviewing for. We open that role and
              shuffle the questions. Hide the answer, say yours first, then
              check. This is a drill pack, not a full interview course.
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-500">
            <li className="border border-zinc-100 rounded-md px-3 py-2">
              <span className="font-bold text-zinc-900">1.</span> Pick a track
            </li>
            <li className="border border-zinc-100 rounded-md px-3 py-2">
              <span className="font-bold text-zinc-900">2.</span> Answer out loud
              before reveal
            </li>
            <li className="border border-zinc-100 rounded-md px-3 py-2">
              <span className="font-bold text-zinc-900">3.</span> Note gaps, then
              mock with a friend
            </li>
          </ol>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {START_TRACKS.map((track) => {
              const role = ROLES_DATA.find((r) => r.id === track.roleId);
              const count = role
                ? (role.questions.Foundation?.length || 0) +
                  (role.questions.Advanced?.length || 0)
                : 0;
              const selected = selectedRoleId === track.roleId;
              return (
                <div
                  key={track.id}
                  className={cn(
                    'border rounded-lg p-4 bg-[#FAFAFA] flex flex-col gap-3',
                    selected ? 'border-zinc-900' : 'border-zinc-200'
                  )}
                >
                  <div className="flex flex-col gap-1.5 flex-1">
                    <p className="text-sm font-bold text-zinc-900 tracking-tight">
                      {track.title}
                    </p>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      {track.forWho}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      <span className="font-semibold text-zinc-700">
                        You will drill
                      </span>{' '}
                      {track.youWillDrill}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {count} questions · {track.timeHint}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Button
                      type="button"
                      className="w-full h-9 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
                      onClick={() =>
                        selectRole(track.roleId, { practice: true })
                      }
                    >
                      Start practice
                    </Button>
                    <button
                      type="button"
                      onClick={() => selectRole(track.roleId)}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 py-1"
                    >
                      Browse this role instead
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              All roles
            </h2>
            <nav className="border border-zinc-200 bg-white rounded-lg overflow-hidden">
              {ROLES_DATA.map((role) => {
                const selected = selectedRoleId === role.id;
                const count =
                  (role.questions.Foundation?.length || 0) +
                  (role.questions.Advanced?.length || 0);
                const seen = (seenMap[role.id] || []).length;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => selectRole(role.id)}
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
                      {seen > 0 ? ` · ${Math.min(seen, count)} seen` : ''}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="border border-zinc-200 bg-white rounded-lg p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-zinc-900 tracking-tight">
                After practice
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full h-9 text-xs font-semibold border-zinc-200 rounded-md"
              >
                <Link href="/jobs">Browse jobs</Link>
              </Button>
              <Button
                asChild
                className="w-full h-9 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
              >
                <Link href="/editor">Finish your profile</Link>
              </Button>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Turn your PDF CV into a live page you can share with recruiters.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-5 min-w-0">
            <div className="border border-zinc-200 bg-white rounded-lg p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tighter text-zinc-900 mb-2">
                    {activeRole.role}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                    {activeRole.snapshot}
                  </p>
                </div>
                <p className="text-[11px] text-zinc-400 shrink-0">
                  {seenForRole.length}/{roleQuestionCount} seen
                </p>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Skills tested
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {activeRole.coreCompetencies.map((comp) => (
                  <span
                    key={comp}
                    className="text-[10px] font-medium px-2 py-1 border border-zinc-200 bg-zinc-50 text-zinc-600 rounded"
                  >
                    {comp}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  className="h-9 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
                  onClick={() => startPractice('all')}
                >
                  <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                  Practice mode
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 text-xs font-semibold border-zinc-200 rounded-md"
                  onClick={() => setMode('browse')}
                >
                  Browse list
                </Button>
              </div>
            </div>

            {mode === 'practice' && practiceQuestion ? (
              <div className="border border-zinc-200 bg-white rounded-lg p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-zinc-500">
                    Practice {practiceIndex + 1} of {practiceQueue.length}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px] font-semibold border-zinc-200 rounded-md"
                      onClick={() => setTimerSec(60)}
                    >
                      60s
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px] font-semibold border-zinc-200 rounded-md"
                      onClick={() => setTimerSec(180)}
                    >
                      3 min
                    </Button>
                    {timerSec !== null && (
                      <span className="inline-flex items-center px-2 text-xs font-mono font-semibold text-zinc-700">
                        {Math.floor(timerSec / 60)}:
                        {String(timerSec % 60).padStart(2, '0')}
                        {timerSec === 0 ? ' done' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight leading-snug">
                  {practiceQuestion.question}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {practiceQuestion.difficulty} · {practiceQuestion.expectedTime}
                </p>

                {!showAnswer ? (
                  <Button
                    type="button"
                    className="h-9 w-full sm:w-auto text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
                    onClick={() => setShowAnswer(true)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Show answer
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4">
                    <p className="text-sm font-semibold text-zinc-900 leading-relaxed">
                      {practiceQuestion.idealAnswer.coreIdea}
                    </p>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-600">
                      {practiceQuestion.idealAnswer.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-zinc-900 shrink-0">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-fit text-xs font-semibold border-zinc-200 rounded-md"
                      onClick={() => setShowAnswer(false)}
                    >
                      <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                      Hide answer
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-xs font-semibold border-zinc-200 rounded-md"
                    disabled={practiceIndex === 0}
                    onClick={() => {
                      setPracticeIndex((i) => Math.max(0, i - 1));
                      setShowAnswer(false);
                      setTimerSec(null);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    className="h-9 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
                    disabled={practiceIndex >= practiceQueue.length - 1}
                    onClick={() => {
                      const next = practiceIndex + 1;
                      setPracticeIndex(next);
                      setShowAnswer(false);
                      setTimerSec(null);
                      const nq = practiceQueue[next];
                      if (nq) markSeen(nq.id);
                    }}
                  >
                    Next question
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-xs font-semibold border-zinc-200 rounded-md"
                    onClick={() => startPractice('all')}
                  >
                    <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                    Shuffle again
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <Input
                      type="search"
                      placeholder="Search questions"
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
                          <span className="text-[10px] text-zinc-400">
                            ({count})
                          </span>
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
                                      <span className="text-zinc-900 shrink-0">
                                        •
                                      </span>
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
                                        Why interviewers ask this
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
              </>
            )}
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-zinc-200">
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            Starter bank for GenAI interviews. Last updated July 2026.
          </p>
        </div>
      </main>

      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
