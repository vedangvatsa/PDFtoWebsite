'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, Download, ArrowUpRight, FileDown, Github, Linkedin, Twitter, Youtube, Facebook, Instagram, BookOpen, GraduationCap, Palette, Code2, Pen, MessageCircle, Send, Music, Headphones, Tv, Hash, Figma, Package, Gamepad2, Megaphone, Users, Briefcase, Rss, FileCode2, GitBranch } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { ServerProfileData as ProfileData } from '@/lib/supabase-server';
import posthog from 'posthog-js';
import { PROFILE_EVENTS } from '@/lib/posthog-events';

const LINK_ICON_MAP: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  // Major social
  'twitter': { icon: Twitter, color: '#1DA1F2' },
  'x': { icon: Twitter, color: '#000000' },
  'youtube': { icon: Youtube, color: '#FF0000' },
  'facebook': { icon: Facebook, color: '#1877F2' },
  'instagram': { icon: Instagram, color: '#E4405F' },
  'tiktok': { icon: Music, color: '#000000' },
  'threads': { icon: Hash, color: '#000000' },
  'pinterest': { icon: Palette, color: '#E60023' },
  'snapchat': { icon: MessageCircle, color: '#FFFC00' },
  // Messaging (regional)
  'telegram': { icon: Send, color: '#26A5E4' },
  'whatsapp': { icon: MessageCircle, color: '#25D366' },
  'wechat': { icon: MessageCircle, color: '#07C160' },
  'weixin': { icon: MessageCircle, color: '#07C160' },
  'line': { icon: MessageCircle, color: '#00C300' },
  'kakaotalk': { icon: MessageCircle, color: '#FFE812' },
  'kakao': { icon: MessageCircle, color: '#FFE812' },
  'discord': { icon: Gamepad2, color: '#5865F2' },
  'slack': { icon: Hash, color: '#4A154B' },
  // Professional (regional)
  'xing': { icon: Briefcase, color: '#006567' },
  'vk': { icon: Users, color: '#4680C2' },
  'vkontakte': { icon: Users, color: '#4680C2' },
  // Fediverse / New social
  'mastodon': { icon: Megaphone, color: '#6364FF' },
  'bluesky': { icon: Globe, color: '#0085FF' },
  // Writing & Publishing
  'medium': { icon: Pen, color: '#000000' },
  'substack': { icon: Rss, color: '#FF6719' },
  'hashnode': { icon: Hash, color: '#2962FF' },
  'dev': { icon: Code2, color: '#0A0A0A' },
  'devto': { icon: Code2, color: '#0A0A0A' },
  'dev.to': { icon: Code2, color: '#0A0A0A' },
  // Design
  'dribbble': { icon: Palette, color: '#EA4C89' },
  'behance': { icon: Palette, color: '#1769FF' },
  'figma': { icon: Figma, color: '#F24E1E' },
  'artstation': { icon: Palette, color: '#13AFF0' },
  'deviantart': { icon: Palette, color: '#00E59B' },
  // Developer
  'stackoverflow': { icon: Code2, color: '#F48024' },
  'stack-overflow': { icon: Code2, color: '#F48024' },
  'kaggle': { icon: Code2, color: '#20BEFF' },
  'gitlab': { icon: GitBranch, color: '#FC6D26' },
  'bitbucket': { icon: GitBranch, color: '#0052CC' },
  'codepen': { icon: FileCode2, color: '#000000' },
  'hackerrank': { icon: Code2, color: '#00EA64' },
  'leetcode': { icon: Code2, color: '#FFA116' },
  'codeforces': { icon: Code2, color: '#1F8ACB' },
  'npm': { icon: Package, color: '#CB3837' },
  'pypi': { icon: Package, color: '#3775A9' },
  'notion': { icon: BookOpen, color: '#000000' },
  // Academic
  'researchgate': { icon: BookOpen, color: '#00CCBB' },
  'google-scholar': { icon: GraduationCap, color: '#4285F4' },
  'orcid': { icon: BookOpen, color: '#A6CE39' },
  'scholar': { icon: GraduationCap, color: '#4285F4' },
  'academia': { icon: GraduationCap, color: '#41454A' },
  'pubmed': { icon: BookOpen, color: '#326599' },
  'scopus': { icon: BookOpen, color: '#E9711C' },
  // Media & Entertainment
  'soundcloud': { icon: Headphones, color: '#FF5500' },
  'spotify': { icon: Music, color: '#1DB954' },
  'twitch': { icon: Tv, color: '#9146FF' },
  'vimeo': { icon: Tv, color: '#1AB7EA' },
};

function getLinkIcon(type: string, url?: string): { Icon?: React.ComponentType<any>; color: string; faviconUrl?: string } {
  const key = type.toLowerCase().replace(/\s+/g, '-');
  const match = LINK_ICON_MAP[key];
  if (match) return { Icon: match.icon, color: match.color };
  // Try partial matching for labels like "Google Scholar Profile"
  for (const [k, v] of Object.entries(LINK_ICON_MAP)) {
    if (key.includes(k)) return { Icon: v.icon, color: v.color };
  }
  // For unknown types, extract domain and use favicon
  if (url) {
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const domain = new URL(fullUrl).hostname;
      return { color: '#4285F4', faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=32` };
    } catch {}
  }
  return { Icon: Globe, color: '#4285F4' };
}

function LinkifyText({ text }: { text: string }) {
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>()[\]{}]+)/gi;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          const href = part.startsWith('http') ? part : 'https://' + part;
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-muted-foreground/40 hover:decoration-foreground transition-colors">
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function LinkifiedLine({ text }: { text: string }) {
  const lineBreakRegex = /(?:<br\s*\/?>|\\\s*(?=\s|$))/gi;
  const lines = text.split(lineBreakRegex);
  return (
    <>
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          <LinkifyText text={line} />
        </React.Fragment>
      ))}
    </>
  );
}

// Detects if a line is a bullet point (•, -, *, or numbered like "1.")
function isBulletLine(line: string): boolean {
  return /^(\s*)(●|•|-|\*|\d+\.)\s+/.test(line);
}

function stripBulletPrefix(line: string): string {
  return line.replace(/^(\s*)(●|•|-|\*|\d+\.)\s+/, '').trim();
}

// Split a long text blob into 2-3 paragraphs (max 2 breaks) at sentence boundaries
function splitIntoParas(text: string): string[] {
  if (text.length <= 400) return [text];

  let safe = text;
  const replacements: string[] = [];

  // 1. Protect URLs from being treated as sentence ends (e.g. "github.com/user. Published")
  safe = safe.replace(/(?:https?:\/\/|www\.)\S+/gi, (match) => {
    replacements.push(match);
    return `__REPL${replacements.length - 1}__`;
  });

  // 2. Protect common abbreviations (Dr., Mr., Inc., e.g., i.e., etc.)
  const abbrevs = /\b(Dr|Mr|Mrs|Ms|Prof|Gen|Gov|Sr|Jr|Inc|Ltd|Corp|Co|No|vs|Vol|Dept|Univ|St|Sgt|Capt|Col|Maj|Rev|Ave|Blvd|Mt|Ft|approx|est|al|etc|i\.e|e\.g)\.\s/gi;
  safe = safe.replace(abbrevs, (match) => {
    replacements.push(match);
    return `__REPL${replacements.length - 1}__`;
  });

  // 3. Split at real sentence boundaries:
  //    period/exclamation/question → space → uppercase letter followed by lowercase
  //    (requires [A-Z][a-z] to avoid splitting before ALL-CAPS words like "DEPLOYED", "AWS")
  const sentenceBreak = /(?<=[.!?])\s+(?=[A-Z][a-z])/g;
  const sentences = safe.split(sentenceBreak);

  // Restore all protected tokens
  const restore = (s: string) => s.replace(/__REPL(\d+)__/g, (_, i) => replacements[parseInt(i)]);

  if (sentences.length < 2) return [text]; // nothing to split

  // For exactly 2 sentences, split into 2 paras if both are substantial
  if (sentences.length === 2) {
    return sentences.map(s => restore(s.trim()));
  }

  // 3+ sentences: 2 paras for moderate text, 3 paras for very long text (>900 chars with 5+ sentences)
  const numParas = text.length > 900 && sentences.length >= 5 ? 3 : 2;
  const targetPerPara = Math.ceil(sentences.length / numParas);
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += targetPerPara) {
    const chunk = sentences.slice(i, i + targetPerPara).join(' ').trim();
    if (chunk) paras.push(restore(chunk));
  }
  return paras.length > 0 ? paras : [text];
}

function StructuredText({ text }: { text?: string }) {
  if (!text) return null;

  // Split inline ● bullets into separate lines
  const normalized = text.replace(/\s*●\s*/g, '\n● ');
  const lines = normalized.split('\n');
  const blocks: Array<{ type: 'bullet' | 'para'; lines: string[] }> = [];
  let afterBlankLine = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      afterBlankLine = true;
      continue;
    }

    if (isBulletLine(line)) {
      // Append to existing bullet block or start a new one
      if (blocks.length > 0 && blocks[blocks.length - 1].type === 'bullet' && !afterBlankLine) {
        blocks[blocks.length - 1].lines.push(line);
      } else {
        blocks.push({ type: 'bullet', lines: [line] });
      }
      afterBlankLine = false;
    } else {
      // Non-bullet line
      const last = blocks.length > 0 ? blocks[blocks.length - 1] : null;
      if (last && !afterBlankLine) {
        if (last.type === 'bullet') {
          // Append as continuation of the last bullet line
          const lastIdx = last.lines.length - 1;
          last.lines[lastIdx] = last.lines[lastIdx] + ' ' + line;
        } else if (last.type === 'para') {
          // Append as continuation of the paragraph
          last.lines.push(line);
        }
      } else {
        // Start a new paragraph block
        blocks.push({ type: 'para', lines: [line] });
      }
      afterBlankLine = false;
    }
  }

  // Remove empty para blocks (from consecutive blank lines)
  const cleanBlocks = blocks.filter(b => b.lines.length > 0);

  // Count para blocks — if user already added line breaks (2+ para blocks), skip auto-splitting
  const paraBlockCount = cleanBlocks.filter(b => b.type === 'para').length;
  const shouldAutoSplit = paraBlockCount <= 1 && !text.includes('\n');

  return (
    <div className="space-y-2.5">
      {cleanBlocks.map((block, bi) => {
        if (block.type === 'bullet') {
          return (
            <ul key={bi} className="list-disc list-outside ml-4 space-y-0.5">
              {block.lines.map((line, li) => (
                <li key={li} className="text-xs text-muted-foreground leading-relaxed">
                  <LinkifiedLine text={stripBulletPrefix(line)} />
                </li>
              ))}
            </ul>
          );
        }
        const fullText = block.lines.join('<br>');
        // Only auto-split if user didn't already add their own line breaks
        const paras = shouldAutoSplit ? splitIntoParas(fullText) : [fullText];
        return (
          <React.Fragment key={bi}>
            {paras.map((para, pi) => (
              <p key={pi} className="text-xs text-muted-foreground leading-relaxed">
                <LinkifiedLine text={para} />
              </p>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}


export default function TemplateModern(props: ProfileData) {
  const { profile, workExperience, education, customSections: rawCustomSections } = props;
  const skills = profile.skills || [];

  // Filter out custom sections that duplicate the summary field
  const SUMMARY_TITLES = /^(professional\s+)?summary|^profile|^objective|^about\s*me|^career\s+(summary|objective)|^executive\s+summary|^overview|^personal\s+statement|^introduction$/i;
  const customSections = rawCustomSections?.filter(s => !SUMMARY_TITLES.test(s.sectionTitle?.trim() || ''));

  const { toast } = useToast();

  const handleDownloadPDF = useCallback(async () => {
    // Dynamically import to avoid SSR errors
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.querySelector('.resume-page');
    if (!element) return;

    toast({
      title: "Generating PDF",
      description: "Your professional resume is being prepared for download.",
    });

    const opt = {
      margin: [12, 12, 12, 12], // Reduced global margins slightly for a denser fit
      filename: `${profile.fullName.replace(/\s+/g, '')}-CVinBio.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      pagebreak: { mode: 'css', avoid: '.avoid-break' },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        windowWidth: 800 // Stable width for consistent rendering
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    if (isDark) root.classList.remove('dark');

    // Increased delay to allow full CSS repaint of text colors for PDF capture
    await new Promise(r => setTimeout(r, 300));

    try {
      // Wait for the PDF to be fully generated and saved
      await (html2pdf() as any).set(opt).from(element as HTMLElement).save();
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      toast({
        variant: "destructive",
        title: "PDF generation failed",
        description: "Could not generate PDF. Try using your browser's Print → Save as PDF instead.",
      });
    } finally {
      if (isDark) root.classList.add('dark');
    }
  }, [profile.fullName, toast]);


  return (
    <>
      {/* Print CSS — clean resume, no browser chrome */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in 0.6in;
            size: letter;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .resume-page {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            gap: 1rem !important;
          }
          .resume-page .space-y-5 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.75rem !important; /* Denser top level */
          }
          .resume-page .space-y-3 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.35rem !important; /* Denser items */
          }
          .resume-page .space-y-2\\.5 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.35rem !important;
          }
          .resume-page p, .resume-page span, .resume-page h3 {
            line-height: 1.35 !important;
          }
          .resume-page h2 {
            margin-bottom: 0.25rem !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .resume-page .mb-4 { margin-bottom: 0.5rem !important; }
          .resume-page .mt-4 { margin-top: 0.5rem !important; }
          .resume-page .pt-6 { padding-top: 0.5rem !important; }
          
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .resume-outer {
            background: white !important;
            padding: 0 !important;
            min-height: auto !important;
          }
        }
      `}</style>

      <div className="resume-outer min-h-screen bg-background">
        {/* Temporarily disabled PDF button: 
        <button
          onClick={handleDownloadPDF}
          className="no-print fixed bottom-6 right-6 z-[60] rounded-full bg-zinc-900 text-white p-4 shadow-xl hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 group flex items-center gap-2"
          title="Save as PDF"
        >
          <FileDown className="h-5 w-5" />
          <span className="text-xs font-semibold pr-1">Save PDF</span>
        </button> 
        */}

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="resume-page space-y-5 pb-8">

            {/* ─── HEADER ─── */}
            <header className="text-center">
              {profile.avatarUrl && !profile.avatarUrl.includes('picsum.photos') && (
                <div className="flex justify-center mb-4">
                  <div className="relative overflow-hidden rounded-full border-2 border-indigo-100 bg-muted shrink-0 flex items-center justify-center transform-gpu shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:shadow-[0_0_50px_-5px_rgba(99,102,241,0.6)]" style={{ width: 72, height: 72, borderRadius: '50%' }}>
                    {profile.avatarUrl.startsWith('data:') ? (
                      <img
                        src={profile.avatarUrl}
                        alt={`${profile.fullName} profile photo on CVin.Bio`}
                        className="w-full h-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                        fetchPriority="high"
                        loading="eager"
                      />
                    ) : (
                      <img
                        src={profile.avatarUrl}
                        alt={`${profile.fullName} profile photo on CVin.Bio`}
                        className="w-full h-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                        data-ai-hint={profile.avatarHint || 'person portrait'}
                        fetchPriority="high"
                        loading="eager"
                      />
                    )}
                  </div>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-foreground">
                {profile.fullName}
              </h1>
              {/* ── Contact & social row ── */}
              <div className="mt-3 flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5 cursor-default">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#E74C3C]" />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#EA4335]" />
                    <span>{profile.email}</span>
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[#25D366]" />
                    <span>{profile.phone}</span>
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    aria-label={`Website: ${profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/60 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    <Globe className="h-4 w-4 text-[#4285F4]" />
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={profile.github.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, '').replace(/\/$/, '')}
                    aria-label={`GitHub: ${profile.github.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, '').replace(/\/$/, '')}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/60 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    <Github className="h-4 w-4 text-[#181717]" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={profile.linkedin.replace(/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')}
                    aria-label={`LinkedIn: ${profile.linkedin.replace(/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/60 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                  </a>
                )}
                {/* Additional links (ResearchGate, Google Scholar, Twitter, etc.) */}
                {profile.links?.filter((l: any) => !['email', 'phone', 'location', 'website', 'github', 'linkedin'].includes(l.type)).map((link: any, idx: number) => {
                  const { Icon, color, faviconUrl } = getLinkIcon(link.type, link.value);
                  const label = link.type.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                  return (
                    <a
                      key={idx}
                      href={link.value.startsWith('http') ? link.value : `https://${link.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      aria-label={label}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/60 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      {faviconUrl ? (
                        <img src={faviconUrl} alt={label} className="h-4 w-4 rounded-sm" loading="lazy" />
                      ) : Icon ? (
                        <Icon className="h-4 w-4" style={{ color }} />
                      ) : null}
                    </a>
                  );
                })}
              </div>

              {profile.summary && (
                <div className="mt-8 text-left w-full text-sm font-medium text-foreground/80">
                  <StructuredText text={profile.summary} />
                </div>
              )}
            </header>

            {(workExperience.length > 0 || education.length > 0 || skills.length > 0 || customSections?.some(s => s.items?.length > 0)) && <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />}

            {/* ─── EXPERIENCE ─── */}
            {workExperience.length > 0 && (
              <>
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2.5">
                    Experience
                  </h2>
                  <div className="space-y-4">
                    {workExperience.map(job => (
                      <div key={job.id} className="avoid-break relative pl-4 border-l-2 border-indigo-200/70">
                        {/* Timeline dot */}
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-400/80" />
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            {job.location && (
                              <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />{job.location}
                              </p>
                            )}
                          </div>
                          <span className="text-xs font-medium text-indigo-600/80 whitespace-nowrap">
                            {job.startDate && job.endDate ? `${job.startDate} — ${job.endDate}` : job.startDate ? `${job.startDate} — Present` : job.endDate || ''}
                          </span>
                        </div>
                        {job.description && (
                          <div className="mt-1.5">
                            <StructuredText text={job.description} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
                {(education.length > 0 || skills.length > 0 || customSections?.some(s => s.items?.length > 0)) && <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />}
              </>
            )}

            {/* ─── EDUCATION ─── */}
            {education.length > 0 && (
              <>
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2.5">
                    Education
                  </h2>
                  <div className="space-y-2.5">
                    {education.map(edu => (
                      <div key={edu.id} className="avoid-break">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{edu.institution}</h3>
                            <p className="text-xs text-muted-foreground">{edu.degree}</p>
                          </div>
                          <span className="text-xs font-medium text-indigo-600/80 whitespace-nowrap">
                            {edu.startDate && edu.endDate ? `${edu.startDate} — ${edu.endDate}` : edu.startDate || edu.endDate || ''}
                          </span>
                        </div>
                        {edu.description && (
                          <div className="mt-1.5">
                            <StructuredText text={edu.description} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
                {(skills.length > 0 || customSections?.some(s => s.items?.length > 0)) && <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />}
              </>
            )}

            {/* ─── SKILLS ─── */}
            {skills.length > 0 && (
              <>
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2.5">
                    Skills
                  </h2>
                  <div className="block" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-md border border-indigo-500/20 bg-indigo-50/50 text-indigo-700 text-xs px-2.5 py-1 mb-1.5 mr-1.5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
                {customSections?.some(s => s.items?.length > 0) && <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />}
              </>
            )}

            {/* ─── CUSTOM SECTIONS ─── */}
            {customSections?.filter(s => s.items && s.items.length > 0).map((section, idx, filteredArr) => (
              <React.Fragment key={section.id}>
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2.5">
                    {section.sectionTitle}
                  </h2>
                  <div className="space-y-3">
                    {section.items?.map(item => (
                      <div key={item.id} className="avoid-break">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                            {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                          </div>
                          {item.date && (
                            <span className="text-xs font-medium text-indigo-600/80 whitespace-nowrap">{item.date}</span>
                          )}
                        </div>
                        {item.description && (
                          <div className="mt-1.5">
                            <StructuredText text={item.description} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
                {idx < filteredArr.length - 1 && <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />}
              </React.Fragment>
            ))}

            {/* Footer - branding */}
            <div className="no-print pt-6 text-center">
              <Link
                href="/?utm_source=watermark&utm_medium=badge&utm_campaign=portfolio-watermark"
                onClick={() => {
                  posthog.capture(PROFILE_EVENTS.WATERMARK_CLICKED, {
                    slug: profile.slug,
                    name: profile.fullName,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/60 text-xs font-medium text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <span className="text-[10px]">✦</span>
                Made with CVin.Bio
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
