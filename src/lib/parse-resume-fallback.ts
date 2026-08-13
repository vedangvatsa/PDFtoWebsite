import {
  repairParsedData,
  ensureMinimalProfile,
} from '@/lib/parse-guard';
import {
  salvageResumeFromText,
  resumeParseContentScore,
} from '@/lib/resume-parser';

// Defense-in-depth: reconstruction markers ("__PROT 0__") must NEVER reach the
// database or the user. If a token survives the parser, strip it from every
// string in the AI output instead of persisting the artifact.
const TOKEN_ARTIFACT_RE = /__PROT\s*\d+\s*__/g;
/** Minimum extractable text before the regex fallback is worth running. */
const REGEX_FALLBACK_MIN_CHARS = 80;

/**
 * Deterministic CV salvage when AI is down or returns an empty/critical shell.
 * Always keeps raw text in the payload when present so the user never loses content.
 */
export function tryRegexResumeFallback(
  text: string,
  opts?: { fileName?: string; authName?: string; reason?: string }
): any | null {
  const raw = String(text || '').trim();
  if (raw.length < REGEX_FALLBACK_MIN_CHARS) return null;

  try {
    let data: any = salvageResumeFromText(raw);
    data = repairParsedData(data, { authName: opts?.authName });
    data = ensureMinimalProfile(data, { fileName: opts?.fileName });

    const reason = opts?.reason || 'AI unavailable';
    data._parseWarnings = [
      ...(Array.isArray(data._parseWarnings) ? data._parseWarnings : []),
      `Used non-AI resume parser (${reason})`,
    ];
    data._parseMethod = 'regex';
    data._parseNeedsReview = true;
    console.warn(
      `Regex resume fallback used (${reason}); score=${resumeParseContentScore(data)}`
    );
    return data;
  } catch (err) {
    console.warn('Regex resume fallback failed:', err);
    return null;
  }
}

/** Empty-but-openable editor shell — user can fill manually; never hard-fail UX. */
export function emptyProfileShell(
  fileName?: string,
  warnings: string[] = []
): any {
  const shell = ensureMinimalProfile(
    {
      personalInfo: {},
      summary: '',
      workExperience: [],
      education: [],
      skills: [],
      customSections: [],
    },
    { fileName }
  );
  shell._parseMethod = 'shell';
  shell._parseNeedsReview = true;
  shell._parseWarnings = warnings.length
    ? warnings
    : ['Could not auto-extract fields. Continue in the editor and fill in your details.'];
  return shell;
}

export function scrubProtectedArtifacts(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(TOKEN_ARTIFACT_RE, '').trim();
  }
  if (Array.isArray(value)) {
    return value.map(scrubProtectedArtifacts);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = scrubProtectedArtifacts(v);
    }
    return out;
  }
  return value;
}
