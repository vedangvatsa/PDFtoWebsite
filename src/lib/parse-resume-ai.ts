/** Gemini / DeepSeek resume parse providers and prompts. */

export const PARSE_SYSTEM_INSTRUCTION = `You are a resume parser. Return ONLY JSON exactly matching this schema (no markdown):
{"personalInfo":{"fullName":"","email":"","phone":"","location":"","website":"","github":"","linkedin":"","additionalLinks":[{"label":"","url":""}]},"summary":"","workExperience":[{"company":"","title":"","location":"","startDate":"","endDate":"","description":""}],"education":[{"institution":"","degree":"","fieldOfStudy":"","startDate":"","endDate":"","description":""}],"skills":[],"customSections":[]}

RULES:
1. Extract ONLY what's in the CV; never invent.
2. Empty sections -> empty arrays.
3. Map ALL experience (incl. internships/freelance/leadership) into workExperience.
4. Map ALL other sections (awards, certs, projects, languages, volunteering, publications, etc.) into customSections as {sectionTitle, items:[{title,subtitle,description,date}]}. Summary/profile/objective go into "summary" only.
5. Fix garbled OCR and re-add missing spaces ("Assistedinacquisition" -> "Assisted in acquisition").
6. Location = "City, Country/State", never full street addresses.
7. Extract ALL URLs: github/linkedin/website fields; everything else -> additionalLinks.
8. Every distinct CV section must appear in output.
9. Multiple roles at one company -> separate workExperience entries, same "company".
10. workExperience location = where the job was (Remote/Hybrid/City), not home address.
11. skills = flat array of individual short skills; split category lines ("PM: Discovery, PRDs" -> ["PM","Discovery","PRDs"]).
12. Max 30 skills; only real skills, not project topics.
13. fullName = real name, never "CV/Resume" labels or initials; Title Case; never append location.
14. One education entry per degree; description max 3 lines; never dump the whole CV there.
15. Never collapse a rich CV into one education blob; workExperience/skills must not be empty if present in CV.
16. Locations formatted "City, Country" (single space).
17. Ongoing roles -> endDate "Present"; unknown dates -> empty string.
Don't throw away any real work data.`;

const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-flash';
const DEFAULT_DEEPSEEK_REASONING_EFFORT = 'low';
const MAX_RETRIES = 2;
/** Prefer vision/document path when extractable text is shorter than this. */
export const MIN_TEXT_CHARS = 50;

/** Models that currently accept new Gemini API keys (2.5-flash is often 404/429). */
const GEMINI_MODEL_FALLBACKS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
] as const;

/** Round-robin cursor so concurrent uploads spread across all keys. */
let geminiKeyCursor = 0;

function getGeminiApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ]
    .map((k) => k?.trim())
    .filter((k): k is string => Boolean(k));
  return [...new Set(keys)];
}

function getDeepSeekApiKeys(): string[] {
  const keys = [
    process.env.DEEPSEEK_API_KEY,
    process.env.DEEPSEEK_API_KEY_2,
  ].map((k) => k?.trim()).filter((k): k is string => Boolean(k));
  return [...new Set(keys)];
}

export interface OpenAIMessage {
  role: 'system' | 'user';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string }; file?: { filename: string; file_data: string } }>;
}

export type ParseMedia =
  | { kind: 'none' }
  | { kind: 'image'; dataUri: string; mimeType: string }
  | { kind: 'pdf'; base64: string };

function hasGemini(): boolean {
  return getGeminiApiKeys().length > 0;
}

function hasDeepSeek(): boolean {
  return getDeepSeekApiKeys().length > 0;
}

export const PARSE_USER_PROMPT =
  'Parse this resume into the required JSON schema. Extract the candidate name, contact info, summary, all work experience, all education, skills, and every other section as customSections. Follow all rules exactly.';

/** iPhone photos (HEIC/HEIF) → JPEG so Gemini vision accepts them. */
export async function convertHeicToJpeg(input: Buffer): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const convert = require('heic-convert') as (opts: {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality: number;
  }) => Promise<ArrayBuffer>;
  const out = await convert({ buffer: input, format: 'JPEG', quality: 0.9 });
  return Buffer.from(out);
}

/** DeepSeek — OpenAI-compatible chat completions. Text-only (no vision); used for extracted text. */
async function callDeepSeek(messages: OpenAIMessage[]): Promise<any> {
  const apiKeys = getDeepSeekApiKeys();
  if (apiKeys.length === 0) throw new Error('DEEPSEEK_API_KEY is missing');
  const model = process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_DEEPSEEK_MODEL;
  const reasoningEffort =
    process.env.DEEPSEEK_REASONING_EFFORT?.trim() || DEFAULT_DEEPSEEK_REASONING_EFFORT;

  let lastError: Error | null = null;
  for (const apiKey of apiKeys) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: 'json_object' },
            thinking: { type: 'disabled' },
            reasoning_effort: reasoningEffort,
            max_tokens: 4096,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const statusCode = response.status;
          const errorMsg = errorData.error?.message || `DeepSeek API Error ${statusCode}`;
          if ((statusCode === 429 || statusCode >= 500) && attempt < MAX_RETRIES) {
            console.warn(
              `DeepSeek API returned ${statusCode}, retrying (attempt ${attempt + 1}/${MAX_RETRIES})...`
            );
            lastError = new Error(errorMsg);
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
            continue;
          }
          throw new Error(errorMsg);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from DeepSeek');

        let raw = String(content).replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(raw);
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error('Unknown DeepSeek error');
        if (attempt < MAX_RETRIES && (lastError.name === 'AbortError' || lastError.message.includes('fetch'))) {
          console.warn(`DeepSeek request failed (attempt ${attempt + 1}), retrying...`, lastError.message);
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }
  throw lastError || new Error('DeepSeek parsing failed');
}

/** Gemini — text, images, or multi-page PDF bytes (best path for scans). */
async function callGemini(
  userText: string,
  media: ParseMedia = { kind: 'none' }
): Promise<any> {
  const apiKeys = getGeminiApiKeys();
  if (apiKeys.length === 0) throw new Error('GEMINI_API_KEY is missing');
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  const parts: Array<Record<string, unknown>> = [
    { text: `${PARSE_SYSTEM_INSTRUCTION}\n\n${userText}` },
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
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  // Prefer currently-available flash models; rotate keys on quota/billing failures.
  const models = Array.from(new Set([model, ...GEMINI_MODEL_FALLBACKS]));

  let lastError: Error | null = null;
  const start = geminiKeyCursor++ % apiKeys.length;
  for (let ki = 0; ki < apiKeys.length; ki++) {
    const apiKey = apiKeys[(start + ki) % apiKeys.length];
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
            // Hard billing / not-found → next model (or next key after models).
            if (statusCode === 403 || statusCode === 404) break;
            if ((statusCode === 429 || statusCode >= 500) && attempt < MAX_RETRIES) {
              console.warn(`Gemini ${m} returned ${statusCode}, retrying...`);
              await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
              continue;
            }
            // 429 after retries → next model; other errors → next model
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
  }
  throw lastError || new Error('Gemini parsing failed');
}

/**
 * Provider priority:
 *  - DeepSeek — text-only for extracted-text resumes (skip for image/PDF).
 *  - Gemini — handles PDF/images natively (incl. HEIC).
 * Both run in parallel; the first success wins.
 */
export async function callParseAI(
  messages: OpenAIMessage[],
  opts: { media?: ParseMedia; forceProvider?: 'deepseek' | 'gemini' } = {}
): Promise<any> {
  const media = opts.media || { kind: 'none' };
  const force = opts.forceProvider;
  const isTextOnly = media.kind === 'none';
  // DeepSeek is text-only, so it is only used when the parse is text-based;
  // Gemini handles text + PDF + images.
  const wantDeepSeek = hasDeepSeek() && isTextOnly && force !== 'gemini';
  const wantGemini = hasGemini() && force !== 'deepseek';

  if (!wantDeepSeek && !wantGemini) {
    throw new Error(
      'No AI keys configured. Set DEEPSEEK_API_KEY (text resumes) and/or GEMINI_API_KEY (PDFs/images).'
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

  const tryGemini = async () => callGemini(userText, media);
  const tryDeepSeek = async () => callDeepSeek(messages);

  const errors: string[] = [];

  // Race DeepSeek + Gemini in parallel — first success wins, so the
  //    user-visible latency is the fastest provider, not their sum.
  const tasks: Array<{ name: string; run: () => Promise<any> }> = [];
  if (wantDeepSeek) tasks.push({ name: 'deepseek', run: tryDeepSeek });
  if (wantGemini) tasks.push({ name: 'gemini', run: tryGemini });

  if (tasks.length > 0) {
    try {
      return await raceFirstSuccess(tasks);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  throw new Error(
    media.kind === 'pdf'
      ? `Could not read this scanned PDF (${errors.join(' | ')}). Try exporting as a text PDF or uploading a clear JPG/PNG photo.`
      : `Failed to process resume (${errors.join(' | ') || 'no provider available'}).`
  );
}

/**
 * Runs all tasks concurrently and resolves with the FIRST successful result.
 * If every task rejects, rejects with all collected errors joined.
 */
function raceFirstSuccess<T>(tasks: Array<{ name: string; run: () => Promise<T> }>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let pending = tasks.length;
    const errs: string[] = [];
    for (const t of tasks) {
      t.run()
        .then((v) => resolve(v))
        .catch((err) => {
          errs.push(`${t.name}: ${err instanceof Error ? err.message : err}`);
          if (--pending === 0) reject(new Error(errs.join(' | ')));
        });
    }
  });
}
