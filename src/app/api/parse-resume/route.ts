import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/utils/supabase/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { getClientIp } from '@/lib/rate-limit';
import {
  validateParsedData,
  repairParsedData,
  extractSalvageResumeText,
  ensureMinimalProfile,
} from '@/lib/parse-guard';

export const maxDuration = 60;

// Defense-in-depth: reconstruction markers ("__PROT 0__") must NEVER reach the
// database or the user. If a token survives the parser, strip it from every
// string in the AI output instead of persisting the artifact.
const TOKEN_ARTIFACT_RE = /__PROT\s*\d+\s*__/g;

function scrubProtectedArtifacts(value: unknown): unknown {
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

const systemInstruction = `You are a strict, highly accurate JSON API extracting candidate resumes.
Return ONLY JSON matching EXACTLY the provided schema (do not use markdown blocks).
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "website": "", "github": "", "linkedin": "", "additionalLinks": [{ "label": "", "url": "" }] },
  "summary": "",
  "workExperience": [{ "company": "", "title": "", "location": "", "startDate": "", "endDate": "", "description": "" }],
  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "", "description": "" }],
  "skills": [""],
  "customSections": []
}

CRITICAL RULES:
1. ONLY extract information that is explicitly present in the provided resume text. DO NOT hallucinate, guess, or invent ANY details or dummy placeholders.
2. If a section (like workExperience, education) doesn't exist, leave that array completely EMPTY ([]). Do NOT populate [] with dummy objects.
3. EXTRACT ALL PROFESSIONAL EXPERIENCE into "workExperience"! Even if it is labeled irregularly (e.g. 'Internships', 'Freelance', 'Partnerships', 'Self-Employed', 'Leadership'), aggressively map it to "workExperience" to ensure no primary job data is lost.
4. CUSTOM SECTIONS RULE: If the CV contains ANY supplementary sections beyond work/education/skills, you MUST map them into "customSections". This includes but is not limited to: 'Awards', 'Achievements', 'Honors', 'Certifications', 'Licenses', 'Publications', 'Patents', 'Projects', 'Volunteering', 'Community Service', 'Languages', 'Interests', 'Hobbies', 'Testimonials', 'References', 'Courses', 'Training', 'Conferences', 'Memberships', 'Professional Affiliations', 'Research', 'Presentations', 'Extracurricular Activities', 'Competitions', 'Scholarships', 'Fellowships', 'Grants'. EXCLUSION: Do NOT create a customSection for Summary, Professional Summary, Profile, Objective, About Me, Career Summary, Executive Summary, Personal Statement, or Overview — these MUST go into the top-level "summary" field ONLY, never into customSections. Schema per section: { "sectionTitle": "Exact Section Name From CV", "items": [{ "title": "", "subtitle": "", "description": "", "date": "" }] }. EVERY distinct section in the CV that is not work/education/skills/summary MUST appear as a separate customSection. Do NOT silently skip any section!
5. OCR CLEANING RULE: If the input contains garbled characters, aggressively apply reasoning to reconstruct the intended words. Maintain detailed descriptions and retain bullet point formatting.
5b. SPACE RECONSTRUCTION RULE: PDF extraction often loses spaces between words, producing text like "Assistedinacquisitionof10+clients". You MUST reconstruct the correct spacing in ALL output fields. Carefully split concatenated words (e.g. "Assistedinacquisition" → "Assisted in acquisition", "proactive&reactiveselling" → "proactive & reactive selling", "winningcontractworth$10Mn" → "winning contract worth $10Mn"). Apply this to EVERY field including descriptions, titles, companies, degrees, and skills. Output text must read as natural English with proper word boundaries.
6. LOCATION PRIVACY RULE: Do NOT extract full specific street addresses. ONLY output the generalized "City, Country" (e.g., "San Francisco, USA", "London, UK") for the personal location field!
7. LINKS RULE: Extract ALL URLs/links found anywhere in the CV. Put GitHub in "github", LinkedIn in "linkedin", and a personal website/portfolio in "website". ALL other links (ResearchGate, Google Scholar, Twitter/X, Behance, Dribbble, Medium, Stack Overflow, Kaggle, ORCID, YouTube, Facebook, Instagram, or any other URL) MUST go into "additionalLinks" with a human-readable "label" (e.g. "ResearchGate", "Google Scholar", "Twitter") and the full "url". Do NOT drop any link!
8. COMPLETENESS RULE: Count every distinct section heading in the CV. Every one must appear in your output (as workExperience, education, skills, or customSections). If your output has fewer sections than the CV, you are WRONG.
9. PROMOTIONS RULE: If a candidate held multiple roles or titles at the SAME company (promotions, lateral moves, role changes), you MUST create a SEPARATE workExperience entry for EACH distinct role with its own title, dates, and description. The "company" field MUST be identical across all entries for that company. Example input — "Google: Staff Engineer (2022-Present), Senior Engineer (2020-2022), Engineer (2018-2020)" becomes THREE separate workExperience entries all with company "Google". Look for patterns like multiple titles with date ranges listed under a single company heading, or titles separated by promotion indicators.
10. WORK LOCATION RULE: For each work experience entry, extract the work location (city, country or city, state) into the "location" field. This is where the job was performed, NOT the candidate's home address. If multiple locations, combine them (e.g. "Dubai & London"). If remote, put "Remote". If hybrid, put "Hybrid, [City]". If not mentioned anywhere in that role's context, leave as empty string. Do NOT guess a location that is not stated or clearly implied. Do NOT put the location inside the description field.
11. SKILLS SEGREGATION RULE: The "skills" field MUST be a flat array of individual, short, clean, distinct keywords or brief tech/business skill phrases (e.g., "React", "SQL", "Product Discovery"). If the resume groups skills under category lines or lists them as long comma-separated lines (e.g., "Product Management: Product Discovery, PRDs", "Languages: JavaScript, TypeScript"), you MUST segregate them. Split these categories into individual, separate strings in the "skills" array (e.g., ["Product Management", "Product Discovery", "PRDs", "JavaScript", "TypeScript"]). Do NOT include trailing commas, colons, or category prefixes within the individual skill strings, and NEVER output an entire long multi-skill line or category block as a single array element!
12. SKILLS CAP RULE: Output AT MOST 30 skills. Only include actual technical skills, tools, methodologies, and core competencies that the candidate would list in a "Skills" section. Do NOT extract project topics, domain-specific nouns from job descriptions, or industry verticals as skills. For example, "Hyperledger Fabric" is a skill, but "rural road verification" or "birth and death registration" are project topics, NOT skills. Prioritize hard skills and widely-recognized competencies over vague or overly-specific phrases.
13. NAME RULE: The "fullName" field MUST be the candidate's real first + last name. NEVER return document labels such as "Curriculum Vitae", "Resume", "Résumé", "CV", "Profile", "Bio", or any abbreviation/acronym (e.g. "H.R.M", "A.K.") as the name. If the header line mixes a name with contact info or a location, extract ONLY the name. Convert ALL-CAPS names to normal Title Case ("REDDY SUMANTH" → "Reddy Sumanth"). NEVER append a city, state, or country to the name (e.g. "Reddy Sumanth Chittoor" is WRONG — "Chittoor" is a location). Do NOT add periods between initials ("H.R.M" is wrong; spell out the name you can see).
14. EDUCATION RULE: Create ONE education entry per distinct degree/institution. "institution" and "degree" MUST both be populated with real values. The "description" must be SHORT (max 3 lines) and must NOT contain the candidate's name, email, phone, GitHub/LinkedIn URLs, or the header/contact block. NEVER dump the candidate's whole resume (projects, skills, experience, certifications) into a single education entry's description — that is a critical failure.
15. NO-DUMP RULE: Every distinct section of the CV (skills, projects, certifications, achievements, publications, experience) MUST be extracted into its proper array (skills, workExperience, or customSections). A rich CV must NEVER collapse into a single education record with everything in "description". If the CV clearly contains work experience or skills, "workExperience" and "skills" MUST NOT be empty arrays.
16. LOCATION FORMAT RULE: Location fields must be formatted "City, Country" or "City, State" with a SINGLE space after the comma. NEVER concatenate like "Nigeria,Lagos" — that is wrong.
17. DATE RULE: If a role or education is ongoing, set "endDate" to "Present" and "startDate" to the actual start date. NEVER put placeholder text like "Still ongoing" in "startDate" or "endDate". If a date is unknown, leave the field as an empty string.
DO NOT THROW ANY REAL WORK DATA AWAY!`;

// Strict JSON schema for OpenAI structured outputs — guarantees schema-valid JSON.
const OPENAI_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'resume_parse',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['personalInfo', 'summary', 'workExperience', 'education', 'skills', 'customSections'],
      properties: {
        personalInfo: {
          type: 'object',
          additionalProperties: false,
          required: ['fullName', 'email', 'phone', 'location', 'website', 'github', 'linkedin', 'additionalLinks'],
          properties: {
            fullName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
            website: { type: 'string' },
            github: { type: 'string' },
            linkedin: { type: 'string' },
            additionalLinks: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['label', 'url'],
                properties: { label: { type: 'string' }, url: { type: 'string' } },
              },
            },
          },
        },
        summary: { type: 'string' },
        workExperience: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['company', 'title', 'location', 'startDate', 'endDate', 'description'],
            properties: {
              company: { type: 'string' },
              title: { type: 'string' },
              location: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        education: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['institution', 'degree', 'fieldOfStudy', 'startDate', 'endDate', 'description'],
            properties: {
              institution: { type: 'string' },
              degree: { type: 'string' },
              fieldOfStudy: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        skills: { type: 'array', items: { type: 'string' } },
        customSections: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['sectionTitle', 'items'],
            properties: {
              sectionTitle: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['title', 'subtitle', 'description', 'date'],
                  properties: {
                    title: { type: 'string' },
                    subtitle: { type: 'string' },
                    description: { type: 'string' },
                    date: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const DEFAULT_OPENAI_MODEL = 'gpt-4.1';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_RETRIES = 2;
/** Prefer vision/document path when extractable text is shorter than this. */
const MIN_TEXT_CHARS = 50;

interface OpenAIMessage {
  role: 'system' | 'user';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string }; file?: { filename: string; file_data: string } }>;
}

type ParseMedia =
  | { kind: 'none' }
  | { kind: 'image'; dataUri: string; mimeType: string }
  | { kind: 'pdf'; base64: string };

function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

const PARSE_USER_PROMPT =
  'Parse this resume into the required JSON schema. Extract the candidate name, contact info, summary, all work experience, all education, skills, and every other section as customSections. Follow all rules exactly.';

/** iPhone photos (HEIC/HEIF) → JPEG so both OpenAI and Gemini vision accept them. */
async function convertHeicToJpeg(input: Buffer): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const convert = require('heic-convert') as (opts: {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality: number;
  }) => Promise<ArrayBuffer>;
  const out = await convert({ buffer: input, format: 'JPEG', quality: 0.9 });
  return Buffer.from(out);
}

async function callOpenAI(messages: OpenAIMessage[]): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing');
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages,
          response_format: OPENAI_SCHEMA,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusCode = response.status;
        const errorMsg = errorData.error?.message || `API Error ${statusCode}`;
        if ((statusCode === 429 || statusCode >= 500) && attempt < MAX_RETRIES) {
          console.warn(`OpenAI API returned ${statusCode}, retrying (attempt ${attempt + 1}/${MAX_RETRIES})...`);
          lastError = new Error(errorMsg);
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from AI engine');

      let raw = String(content).replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(raw);
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error('Unknown AI error');
      if (attempt < MAX_RETRIES && (lastError.name === 'AbortError' || lastError.message.includes('fetch'))) {
        console.warn(`OpenAI request failed (attempt ${attempt + 1}), retrying...`, lastError.message);
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError || new Error('AI parsing failed');
}

/** Build OpenAI user content that can include images and/or PDF file parts. */
function buildOpenAIUserContent(
  text: string,
  media: ParseMedia
): OpenAIMessage['content'] {
  if (media.kind === 'image') {
    return [
      { type: 'text', text },
      { type: 'image_url', image_url: { url: media.dataUri } },
    ];
  }
  if (media.kind === 'pdf') {
    // OpenAI file input (models that accept PDF). If the model rejects it,
    // callParseAI falls through to Gemini which accepts PDF natively.
    return [
      { type: 'text', text },
      {
        type: 'file',
        file: {
          filename: 'resume.pdf',
          file_data: `data:application/pdf;base64,${media.base64}`,
        },
      },
    ];
  }
  return text;
}

/** Gemini — text, images, or multi-page PDF bytes (best path for scans). */
async function callGemini(
  userText: string,
  media: ParseMedia = { kind: 'none' }
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  const parts: Array<Record<string, unknown>> = [
    { text: `${systemInstruction}\n\n${userText}` },
  ];
  if (media.kind === 'image') {
    const b64 = media.dataUri.includes(',') ? media.dataUri.split(',')[1]! : media.dataUri;
    parts.push({ inline_data: { mime_type: media.mimeType, data: b64 } });
  } else if (media.kind === 'pdf') {
    parts.push({ inline_data: { mime_type: 'application/pdf', data: media.base64 } });
  }

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  // Prefer stronger flash models for document/vision; fall back down the list.
  const models = Array.from(
    new Set([
      model,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-flash-latest',
    ])
  );

  let lastError: Error | null = null;
  for (const m of models) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const statusCode = response.status;
          const errorMsg = errorData.error?.message || `Gemini API Error ${statusCode}`;
          lastError = new Error(errorMsg);
          if ((statusCode === 429 || statusCode >= 500) && attempt < MAX_RETRIES) {
            console.warn(`Gemini ${m} returned ${statusCode}, retrying...`);
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
            continue;
          }
          // try next model
          break;
        }
        const result = await response.json();
        const content =
          result.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
        if (!content) {
          lastError = new Error('Empty response from Gemini');
          break;
        }
        let raw = String(content).replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(raw);
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error('Unknown Gemini error');
        if (attempt < MAX_RETRIES && (lastError.name === 'AbortError' || lastError.message.includes('fetch'))) {
          console.warn(`Gemini ${m} failed (attempt ${attempt + 1}), retrying...`, lastError.message);
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }
  throw lastError || new Error('Gemini parsing failed');
}

/**
 * ALWAYS OpenAI primary (higher limits). Gemini only if OpenAI is missing or fails.
 * Applies to text, images, scanned PDFs, and HEIC — no Gemini-first special cases.
 */
async function callParseAI(
  messages: OpenAIMessage[],
  opts: { media?: ParseMedia; forceProvider?: 'openai' | 'gemini' } = {}
): Promise<any> {
  const media = opts.media || { kind: 'none' };
  const force = opts.forceProvider;
  const wantOpenAI = hasOpenAI() && force !== 'gemini';
  const wantGemini = hasGemini() && force !== 'openai';

  if (!wantOpenAI && !wantGemini) {
    throw new Error(
      'No AI keys configured. Set OPENAI_API_KEY (primary) and optionally GEMINI_API_KEY (fallback).'
    );
  }

  // Extract the latest user text prompt for Gemini / rebuild
  let userText = PARSE_USER_PROMPT;
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (lastUser && typeof lastUser.content === 'string') {
    userText = lastUser.content;
  } else if (lastUser && Array.isArray(lastUser.content)) {
    const t = lastUser.content.find((p) => p.type === 'text' && p.text);
    if (t?.text) userText = t.text;
  }

  const tryOpenAI = async () => {
    // Rebuild messages so image/PDF parts are attached for this provider
    const rebuilt: OpenAIMessage[] = [{ role: 'system', content: systemInstruction }];
    rebuilt.push({
      role: 'user',
      content: buildOpenAIUserContent(userText, media),
    });
    return callOpenAI(rebuilt);
  };

  const tryGemini = async () => callGemini(userText, media);

  const errors: string[] = [];

  // 1) OpenAI always first when available
  if (wantOpenAI) {
    try {
      return await tryOpenAI();
    } catch (err) {
      errors.push(`openai: ${err instanceof Error ? err.message : err}`);
      console.warn('OpenAI parse failed; falling back to Gemini…', errors[errors.length - 1]);
    }
  }

  // 2) Gemini only as fallback (rate-limit / outage / unsupported modality)
  if (wantGemini) {
    try {
      return await tryGemini();
    } catch (err) {
      errors.push(`gemini: ${err instanceof Error ? err.message : err}`);
    }
  }

  throw new Error(
    media.kind === 'pdf'
      ? `Could not read this scanned PDF (${errors.join(' | ')}). Try exporting as a text PDF or uploading a clear JPG/PNG photo.`
      : `Failed to process resume (${errors.join(' | ') || 'no provider available'}).`
  );
}


// Supported file types — accept everything users commonly send as a CV.
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/rtf': 'rtf',
  'text/rtf': 'rtf',
  'text/plain': 'txt',
  'text/markdown': 'txt',
  'text/csv': 'txt',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'image/bmp': 'image',
  'image/tiff': 'image',
  'image/tif': 'image',
  'image/heic': 'image-heic',
  'image/heif': 'image-heic',
  // Some browsers send octet-stream / empty MIME — extension fallback handles these.
  'application/octet-stream': 'binary',
};

// Rate Limiter: In-memory for guests (best-effort in serverless), Supabase-backed for auth users
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

async function isUserRateLimited(userId: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabaseAdmin
      .from('parse_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);
    return (count || 0) >= RATE_LIMIT;
  } catch {
    return false; // Fail open — don't block if DB is unreachable
  }
}

async function logParseEvent(userId: string | null, ip: string): Promise<void> {
  try {
    await supabaseAdmin.from('parse_logs').insert({ user_id: userId, ip });
  } catch {
    // Non-fatal
  }
}

export async function POST(request: NextRequest) {
  // cf-connecting-ip is set by Cloudflare and cannot be spoofed by the
  // client (x-forwarded-for alone is user-controlled).
  const ip = getClientIp(request);

  // Auth-based rate limiting (persistent across cold starts)
  let authUserId: string | null = null;
  try {
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (user) {
      authUserId = user.id;
      if (await isUserRateLimited(user.id)) {
        return NextResponse.json({ error: 'Too many requests. Max 10 uploads per hour.' }, { status: 429 });
      }
    }
  } catch { /* continue without auth rate limiting */ }

  // Fallback IP-based rate limiting (best-effort for guests)
  if (!authUserId && isRateLimited(ip)) {
    console.warn(`Rate limit hit: ${ip}`);
    return NextResponse.json({ error: 'Too many requests. Max 10 uploads per hour.' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    let fileType = ALLOWED_TYPES[file.type];
    // Fallback: extension when MIME is wrong/empty (common for HEIC, mobile, Windows).
    if (!fileType || fileType === 'binary') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') fileType = 'pdf';
      else if (ext === 'docx') fileType = 'docx';
      else if (ext === 'doc') fileType = 'doc';
      else if (ext === 'rtf') fileType = 'rtf';
      else if (ext === 'txt' || ext === 'md' || ext === 'markdown' || ext === 'csv') fileType = 'txt';
      else if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tif', 'tiff'].includes(ext)) fileType = 'image';
      else if (ext && ['heic', 'heif'].includes(ext)) fileType = 'image-heic';
      else if (!fileType) {
        // Best-effort: sniff magic bytes, then fall through as text/pdf/image
        fileType = 'unknown';
      }
    }

    let fileBuffer = Buffer.from(await file.arrayBuffer());
    const startTime = Date.now();

    // HEIC/HEIF (iPhone photos) → JPEG for vision models
    if (fileType === 'image-heic') {
      try {
        fileBuffer = await convertHeicToJpeg(fileBuffer);
        fileType = 'image';
      } catch (err) {
        console.warn('HEIC conversion failed; sending original bytes to vision:', err);
        fileType = 'image-heic-raw';
      }
    }

    let pageCount = 0;
    let extractedText = '';
    let aiStructuredData: any = null;
    let imageDataUri = '';
    let parseMedia: ParseMedia = { kind: 'none' };
    /** Keep original PDF bytes so a bad text parse can re-try as a scanned document. */
    let pdfBase64ForFallback: string | null = null;

    try {
      if (fileType === 'pdf') {
        pdfBase64ForFallback = fileBuffer.toString('base64');
        let pdfData: { text?: string; numpages?: number } | null = null;
        try {
          pdfData = await pdf(fileBuffer);
        } catch (err: any) {
          // Password / corrupt PDF — still attempt vision/document models with raw bytes
          console.warn('pdf-parse failed; routing to document vision:', err?.message || err);
          pdfData = null;
        }

        pageCount = pdfData?.numpages || 0;
        // Don't reject long CVs — keep text from all pages for the model (capped later)

        extractedText = (pdfData?.text || '').trim();
        // Enough selectable text → text path (cheaper, structured). Sparse/empty →
        // treat as image-only/scanned PDF and send document bytes to vision models.
        if (extractedText.length >= MIN_TEXT_CHARS) {
          parseMedia = { kind: 'none' };
        } else {
          parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          // Keep any sparse OCR crumbs for the prompt
        }

      } else if (fileType === 'image') {
        const mimeType =
          file.type && file.type.startsWith('image/') && !file.type.includes('heic') && !file.type.includes('heif')
            ? file.type === 'image/jpg'
              ? 'image/jpeg'
              : file.type
            : 'image/jpeg';
        imageDataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        parseMedia = { kind: 'image', dataUri: imageDataUri, mimeType };

      } else if (fileType === 'image-heic-raw') {
        // Unconverted HEIC — Gemini only
        imageDataUri = `data:image/heic;base64,${fileBuffer.toString('base64')}`;
        parseMedia = { kind: 'image', dataUri: imageDataUri, mimeType: 'image/heic' };

      } else if (fileType === 'doc') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const WordExtractor = require('word-extractor');
          const extractor = new WordExtractor();
          const doc = await extractor.extract(fileBuffer);
          extractedText = doc.getBody() || '';
        } catch (err) {
          console.warn('word-extractor failed; trying latin1 text fallback:', err);
          extractedText = fileBuffer.toString('latin1').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');
        }

      } else if (fileType === 'docx') {
        try {
          const mammothResult = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = mammothResult.value || '';
        } catch (err) {
          console.warn('mammoth failed; trying buffer as text/pdf vision:', err);
          extractedText = fileBuffer.toString('utf-8').replace(/\0/g, ' ');
          if (extractedText.trim().length < MIN_TEXT_CHARS) {
            pdfBase64ForFallback = fileBuffer.toString('base64');
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
        }

      } else if (fileType === 'rtf') {
        const rtfContent = fileBuffer.toString('utf-8');
        extractedText = rtfContent
          .replace(/\\[a-z]+\d*\s?/gi, '')
          .replace(/[{}]/g, '')
          .replace(new RegExp("\\\\'[0-9a-f]{2}", 'gi'), '')
          .trim();

      } else if (fileType === 'unknown') {
        // Sniff: PDF magic, image magic, else text
        const head = fileBuffer.subarray(0, 8);
        const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
        const isPng = head[0] === 0x89 && head[1] === 0x50;
        const isJpg = head[0] === 0xff && head[1] === 0xd8;
        const isGif = head[0] === 0x47 && head[1] === 0x49;
        const isWebp = fileBuffer.length > 12 && fileBuffer.toString('ascii', 0, 4) === 'RIFF';
        if (isPdf) {
          pdfBase64ForFallback = fileBuffer.toString('base64');
          try {
            const pdfData = await pdf(fileBuffer);
            extractedText = (pdfData?.text || '').trim();
            pageCount = pdfData?.numpages || 0;
          } catch { /* vision path */ }
          if (extractedText.length < MIN_TEXT_CHARS) {
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
        } else if (isPng || isJpg || isGif || isWebp) {
          const mime = isPng ? 'image/png' : isGif ? 'image/gif' : isWebp ? 'image/webp' : 'image/jpeg';
          imageDataUri = `data:${mime};base64,${fileBuffer.toString('base64')}`;
          parseMedia = { kind: 'image', dataUri: imageDataUri, mimeType: mime };
        } else {
          extractedText = fileBuffer.toString('utf-8').replace(/\0/g, ' ');
          if (extractedText.trim().length < MIN_TEXT_CHARS) {
            // Last resort: treat as PDF bytes for vision models
            pdfBase64ForFallback = fileBuffer.toString('base64');
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
        }
      } else {
        // txt / markdown / csv
        extractedText = fileBuffer.toString('utf-8');
      }

      // Build the AI payload
      let baseMessages: OpenAIMessage[];
      if (parseMedia.kind === 'image') {
        baseMessages = [
          { role: 'system', content: systemInstruction },
          {
            role: 'user',
            content: [
              { type: 'text', text: PARSE_USER_PROMPT },
              { type: 'image_url', image_url: { url: imageDataUri } },
            ],
          },
        ];
      } else if (parseMedia.kind === 'pdf') {
        const crumbs =
          extractedText && extractedText.length > 0
            ? `\n\nPartial text extracted from the PDF (may be incomplete — prefer the document image):\n${extractedText.slice(0, 4000)}`
            : '';
        baseMessages = [
          { role: 'system', content: systemInstruction },
          {
            role: 'user',
            content:
              `${PARSE_USER_PROMPT}\n\nThis is a scanned or image-based PDF resume. Read every page carefully.${crumbs}`,
          },
        ];
      } else {
        if (!extractedText || extractedText.trim().length < MIN_TEXT_CHARS) {
          // Never reject — push whatever bytes we have to vision/document models
          if (pdfBase64ForFallback) {
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          } else if (!imageDataUri && fileBuffer.length > 0) {
            pdfBase64ForFallback = fileBuffer.toString('base64');
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
          baseMessages = [
            { role: 'system', content: systemInstruction },
            {
              role: 'user',
              content:
                `${PARSE_USER_PROMPT}\n\nExtract every detail from this resume document. Read pages carefully even if text extraction was empty.`,
            },
          ];
        } else {
          baseMessages = [
            { role: 'system', content: systemInstruction },
            {
              role: 'user',
              content: `${PARSE_USER_PROMPT}\n\nRESUME TEXT:\n${extractedText}`,
            },
          ];
        }
      }

      aiStructuredData = await callParseAI(baseMessages, { media: parseMedia });

      // Validate RAW model output FIRST. Repair used to truncate education dumps
      // to 500 chars, which hid the dump from validators (yash2 / education-dump bug).
      aiStructuredData = scrubProtectedArtifacts(aiStructuredData);
      let validation = validateParsedData(aiStructuredData);

      // Critical failure → one corrective re-parse with the raw source + the bad
      // output + explicit instructions. This recovers education-dump corruption.
      if (validation.critical) {
        // If text parse of a PDF was bad, escalate to full document vision.
        let corrMedia = parseMedia;
        if (corrMedia.kind === 'none' && pdfBase64ForFallback) {
          corrMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
        }

        const issueLines = validation.issues.map((i) => `- ${i}`).join('\n');
        const sourceHint =
          corrMedia.kind === 'image' || corrMedia.kind === 'pdf'
            ? 'Re-parse the resume document attached to this message (image or PDF).'
            : `RAW RESUME TEXT:\n${extractedText}`;

        const correctionText = [
          sourceHint,
          '',
          'Your previous parse was INCORRECT. Fix these problems and re-extract the FULL resume:',
          issueLines,
          'Critical instructions:',
          '- fullName MUST be the candidate\'s real first + last name only (Title Case). NEVER append city/country (wrong: "Yash Kathait New Delhi").',
          '- education MUST contain ONE entry per real degree/institution with a SHORT description (max 3 lines). NEVER put the contact header, email, phone, LinkedIn, or the whole resume into institution/description.',
          '- Map EVERY job/internship into workExperience (separate entry per role). Map Projects, Certifications, Achievements into customSections.',
          '- skills MUST be a flat array of individual skill strings.',
          '- summary MUST be a short professional summary if present on the CV.',
          'Return ONLY the corrected JSON for the ENTIRE resume. Do not lose any data.',
        ].join('\n');

        console.warn('Parse failed validation; re-parsing. Issues:', validation.issues.join(' | '));
        const correctionMessages: OpenAIMessage[] = [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: correctionText },
        ];

        aiStructuredData = await callParseAI(correctionMessages, { media: corrMedia });
        aiStructuredData = scrubProtectedArtifacts(aiStructuredData);
        validation = validateParsedData(aiStructuredData);
      }

      // If still critical, re-parse using the dump blob as resume text (yash2 recovery)
      if (validation.critical) {
        const salvage = extractSalvageResumeText(aiStructuredData);
        if (salvage && salvage.length >= 200) {
          console.warn('Salvaging resume from dumped education/work blob…');
          try {
            const salvageMessages: OpenAIMessage[] = [
              { role: 'system', content: systemInstruction },
              {
                role: 'user',
                content:
                  `${PARSE_USER_PROMPT}\n\nThe previous extract collapsed the CV into one field. Re-parse this full resume text carefully. Split education, experience, projects, skills, certifications into the correct arrays.\n\nRESUME TEXT:\n${salvage}`,
              },
            ];
            aiStructuredData = await callParseAI(salvageMessages, { media: { kind: 'none' } });
            aiStructuredData = scrubProtectedArtifacts(aiStructuredData);
            validation = validateParsedData(aiStructuredData);
          } catch (salvageErr) {
            console.warn('Salvage re-parse failed:', salvageErr);
          }
        }
      }

      // Always return best-effort structured data — never 422 the user.
      aiStructuredData = repairParsedData(aiStructuredData);
      aiStructuredData = ensureMinimalProfile(aiStructuredData, { fileName: file.name });
      if (validation.critical) {
        console.warn(
          'Returning partial parse after recovery attempts. Remaining issues:',
          validation.issues.join(' | ')
        );
        aiStructuredData._parseWarnings = validation.issues;
      }

    } catch (aiError) {
      console.error('AI parsing failed; returning minimal profile shell:', aiError);
      // Last resort UX: never block the user — open editor with a usable shell
      aiStructuredData = ensureMinimalProfile(
        {
          personalInfo: {},
          summary: '',
          workExperience: [],
          education: [],
          skills: [],
          customSections: [],
        },
        { fileName: file.name }
      );
      aiStructuredData._parseWarnings = [
        aiError instanceof Error ? aiError.message : 'AI parsing failed',
      ];
    }

    // Strip any residual reconstruction markers before returning to the client.
    aiStructuredData = scrubProtectedArtifacts(aiStructuredData);

    // Resume processing after successful extraction
    const duration = Date.now() - startTime;

    // ---------- Option C: Safe Slug Generation (Non-Fatal — frontend has its own fallback) ----------
    try {
      const supabaseUserClient = await createClient();
      const { data: { user } } = await supabaseUserClient.auth.getUser();

      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data: currentProfile } = await supabaseAdmin
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        const isBadProfileSlug = (s: string | null | undefined) => {
          if (!s) return true;
          const x = String(s).toLowerCase();
          if (x.length < 2 || x.length > 48) return true;
          if (x === user.id) return true;
          if (x.includes('http') || x.includes('www') || x.includes('linkedin') || x.includes('github')) return true;
          if (/^(https?|www)/.test(x) || x.includes('linkedincom') || x.includes('githubcom')) return true;
          if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(x)) return true;
          return false;
        };

        const nameToSlug = (name: string) => {
          const parts = String(name || '')
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .map((p) => p.replace(/[^a-z0-9]/g, ''))
            .filter((p) => p && !['https', 'http', 'www', 'com', 'linkedin', 'github', 'in'].includes(p));
          const base = parts.slice(0, 3).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
          return (base || 'profile').slice(0, 40);
        };

        let finalSlug: string;
        if (currentProfile?.username && !isBadProfileSlug(currentProfile.username)) {
          finalSlug = currentProfile.username;
        } else {
          const prefixSlug = nameToSlug(aiStructuredData.personalInfo?.fullName || 'profile');
          finalSlug = prefixSlug;
          let isUnique = false;
          let attempt = 0;

          while (!isUnique && attempt < 100) {
            const { data: existingProfile, error: existErr } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('username', finalSlug)
              .maybeSingle();

            if (existErr) {
              console.error("Slug uniqueness check failed, frontend will handle:", existErr);
              break;
            }

            if (!existingProfile || existingProfile.id === user.id) {
              isUnique = true;
            } else {
              attempt++;
              finalSlug = `${prefixSlug}${attempt}`;
            }
          }
        }

        if (finalSlug) {
          if (!aiStructuredData.personalInfo) {
            aiStructuredData.personalInfo = {};
          }
          aiStructuredData.personalInfo.slug = finalSlug;
        }
      }
    } catch (slugError) {
      console.warn('Slug generation failed (non-fatal, frontend will handle):', slugError);
    }

    console.log(JSON.stringify({
      event: 'cv_parse_success',
      fileType,
      fileSizeKB: Math.round(file.size / 1024),
      pageCount,
      durationMs: duration,
      sectionsFound: {
        work: aiStructuredData.workExperience?.length || 0,
        education: aiStructuredData.education?.length || 0,
        skills: aiStructuredData.skills?.length || 0,
        custom: aiStructuredData.customSections?.length || 0,
      },
      ip,
    }));

    logParseEvent(authUserId, ip);

    return NextResponse.json(aiStructuredData, { status: 200 });

  } catch (error) {
    console.error('Fatal API Error (returning empty shell for UX):', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Still never hard-block the user: open editor with a shell they can fill in
    const shell = ensureMinimalProfile(
      {
        personalInfo: {},
        summary: '',
        workExperience: [],
        education: [],
        skills: [],
        customSections: [],
      },
      {}
    );
    shell._parseWarnings = [message];
    return NextResponse.json(shell, { status: 200 });
  }
}
