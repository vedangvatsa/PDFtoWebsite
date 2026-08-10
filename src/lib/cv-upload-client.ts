/**
 * Client helpers so every CV upload entry point (landing, editor, jobs, blog)
 * keeps the user in-flow even when AI parsing is down.
 */

export type ParsedPersonalInfo = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  slug?: string;
  additionalLinks?: Array<{ label?: string; url?: string }>;
  [key: string]: unknown;
};

export type ParsedResumeClient = {
  personalInfo?: ParsedPersonalInfo;
  summary?: string;
  workExperience?: unknown[];
  education?: unknown[];
  skills?: unknown[];
  customSections?: unknown[];
  _parseMethod?: string;
  _parseNeedsReview?: boolean;
  _parseWarnings?: string[];
  [key: string]: unknown;
};

export function emptyParsedResumeShell(fileName?: string): ParsedResumeClient {
  let name = 'Your Name';
  if (fileName && !/screenshot|image|photo|img/i.test(fileName)) {
    const fromFile = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\b(cv|resume|curriculum|vitae|final|new|copy|updated)\b/gi, ' ')
      .replace(/\b20\d{2}\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (fromFile.length >= 3) name = fromFile;
  }
  return {
    personalInfo: {
      fullName: name,
      email: '',
      phone: '',
      location: '',
      website: '',
      github: '',
      linkedin: '',
      additionalLinks: [],
    },
    summary: '',
    workExperience: [],
    education: [],
    skills: [],
    customSections: [],
    _parseMethod: 'shell',
    _parseNeedsReview: true,
    _parseWarnings: [
      'Could not auto-extract fields. Continue in the editor and fill in your details.',
    ],
  };
}

export function parseNeedsReview(parsed: ParsedResumeClient | null | undefined): boolean {
  if (!parsed) return true;
  if (parsed._parseNeedsReview) return true;
  if (parsed._parseMethod === 'regex' || parsed._parseMethod === 'shell') return true;
  const work = Array.isArray(parsed.workExperience) ? parsed.workExperience.length : 0;
  const edu = Array.isArray(parsed.education) ? parsed.education.length : 0;
  const skills = Array.isArray(parsed.skills) ? parsed.skills.length : 0;
  return work + edu + skills === 0;
}

export function persistParsedResume(parsed: ParsedResumeClient): void {
  const json = JSON.stringify(parsed);
  try {
    sessionStorage.setItem('parsedResume', json);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem('parsedResume', json);
    localStorage.setItem('parsedResumeTimestamp', Date.now().toString());
  } catch {
    /* quota */
  }
  if (parseNeedsReview(parsed)) {
    try {
      sessionStorage.setItem('parseNeedsReview', '1');
    } catch {
      /* ignore */
    }
  } else {
    try {
      sessionStorage.removeItem('parseNeedsReview');
    } catch {
      /* ignore */
    }
  }
}

/** Store file for a later re-parse (login flow / retry). Skip large files. */
export async function storePendingResumeFile(file: File, maxBytes = 1_500_000): Promise<void> {
  if (!file || file.size > maxBytes) return;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('read failed'));
      reader.readAsDataURL(file);
    });
    if (!dataUrl || dataUrl.length > maxBytes * 1.4) return;
    sessionStorage.setItem('pendingResume', dataUrl);
    sessionStorage.setItem('pendingResumeName', file.name);
  } catch {
    /* ignore storage failures */
  }
}

export function reviewToastCopy(parsed: ParsedResumeClient): {
  title: string;
  description: string;
} {
  if (parsed._parseMethod === 'regex') {
    return {
      title: 'CV imported — please review',
      description:
        'Auto-fill used a backup parser. Check name, roles, and skills, then save.',
    };
  }
  if (parsed._parseMethod === 'shell' || parseNeedsReview(parsed)) {
    return {
      title: 'Continue in the editor',
      description:
        'We could not fully auto-fill this CV. Your progress is saved — add details manually or re-upload later.',
    };
  }
  return {
    title: 'CV parsed',
    description: 'Review your profile and publish when ready.',
  };
}
