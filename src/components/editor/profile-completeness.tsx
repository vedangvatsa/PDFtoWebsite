"use client";

import { useEffect, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import type { UserProfile, WorkExperience, Education } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function ProfileCompleteness({
  profile,
  work,
  education,
  skills,
  onCompleteChange,
}: {
  profile: Partial<UserProfile>;
  work: WorkExperience[];
  education: Education[];
  skills: string[];
  onCompleteChange?: (complete: boolean) => void;
}) {
  const completeness = useMemo(() => {
    const checks = [
      { name: 'Add a Profile Photo', complete: !!profile.avatarUrl, targetId: 'avatar-upload-label' },
      { name: 'Write a Summary', complete: !!profile.summary, targetId: 'summary' },
      { name: 'Add your Location', complete: !!profile.location, targetId: 'location' },
      { name: 'Add Work Experience', complete: work.some((w) => (w.title && w.title.trim() !== '') || (w.company && w.company.trim() !== '') || (w.description && w.description.trim() !== '')), targetId: 'work-experience-section' },
      { name: 'Add your Education', complete: education.some((e) => (e.institution && e.institution.trim() !== '') || (e.degree && e.degree.trim() !== '')), targetId: 'education-section' },
      { name: 'Add at least one Skill', complete: skills.some((s) => { const val = typeof s === 'string' ? s : (s as any)?.name || ''; return typeof val === 'string' && val.trim().length > 0; }), targetId: 'skills-section' },
    ];
    const completeCount = checks.filter((c) => c.complete).length;
    const totalCount = checks.length;
    const score = Math.round((completeCount / totalCount) * 100);

    return { score, checks, isComplete: completeCount === totalCount };
  }, [profile, work, education, skills]);

  const { score, checks, isComplete } = completeness;

  useEffect(() => { onCompleteChange?.(isComplete); }, [isComplete, onCompleteChange]);

  return (
    <Card className="h-full shadow-sm flex flex-col justify-center">
      <CardContent className="pt-4 pb-3">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Profile Score</p>
          <div className="flex items-center gap-2">
            <Progress value={score} className="h-1.5 w-16 sm:w-24 bg-secondary" />
            <span className="text-xs font-bold text-foreground">{score}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {checks.map((c) => (
            <button
              type="button"
              key={c.name}
              onClick={() => {
                const el = document.getElementById(c.targetId);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  if ('focus' in el) (el as HTMLElement).focus({ preventScroll: true });
                }
              }}
              className={`cursor-pointer flex items-center gap-2 p-2 rounded-md border text-[10px] text-left transition-all ${c.complete ? 'bg-secondary/40 border-transparent text-muted-foreground/60 line-through grayscale' : 'bg-background shadow-none border-border/60 hover:border-primary/40 font-medium text-foreground hover:shadow-sm'}`}
            >
              {c.complete ? <CheckCircle className="h-3 w-3 text-green-500 shrink-0" /> : <div className="h-2.5 w-2.5 rounded-full border border-gray-400 shrink-0" />}
              <span className="truncate" title={c.name}>{c.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
